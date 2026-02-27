import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')

  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET || !process.env.FACEBOOK_DEFAULT_PASSWORD) {
    console.error('Missing required Facebook environment variables')
    return NextResponse.redirect(
      new URL('/error?message=Facebook authentication is not configured', requestUrl.origin)
    )
  }

  // Handle error from Facebook
  if (error) {
    return NextResponse.redirect(
      new URL(`/error?message=Facebook authentication failed: ${error}`, requestUrl.origin)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/error?message=No authorization code received', requestUrl.origin)
    )
  }

  try {
    // Exchange authorization code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!)
    tokenUrl.searchParams.set('client_secret', process.env.FACEBOOK_APP_SECRET!)
    tokenUrl.searchParams.set('code', code)
    tokenUrl.searchParams.set('redirect_uri', `${requestUrl.origin}/auth/facebook/callback`)

    const tokenResponse = await fetch(tokenUrl.toString())

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Facebook token exchange failed:', errorText)
      throw new Error(`Failed to exchange code for token: ${errorText}`)
    }

    const tokenData = await tokenResponse.json() as { access_token: string }
    const { access_token } = tokenData

    // Generate appsecret_proof for server-side API calls
    const appsecret_proof = crypto
      .createHmac('sha256', process.env.FACEBOOK_APP_SECRET!)
      .update(access_token)
      .digest('hex')

    // Get user profile from Facebook
    const profileResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${access_token}&appsecret_proof=${appsecret_proof}`
    )

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text()
      console.error('Facebook profile fetch failed:', errorText)
      throw new Error(`Failed to get Facebook profile: ${errorText}`)
    }

    const profile = await profileResponse.json()
    console.log('Facebook profile retrieved:', {
      id: profile.id,
      name: profile.name,
      hasEmail: !!profile.email
    })

    // Create Supabase client with cookie handling
    const cookieStore = await cookies()
    const cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }> = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(newCookies) {
            newCookies.forEach((cookie) => {
              cookieStore.set(cookie.name, cookie.value, cookie.options)
              cookiesToSet.push(cookie)
            })
          },
        },
      }
    )

    // Check if user exists with Facebook user ID
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('facebook_user_id', profile.id)
      .maybeSingle()

    // Use email from Facebook if available, otherwise create placeholder
    const email = profile.email || `facebook_${profile.id}@facebook.placeholder.com`

    if (existingUser?.email) {
      // User exists, sign them in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: existingUser.email,
        password: process.env.FACEBOOK_DEFAULT_PASSWORD!,
      })

      if (signInError) {
        throw signInError
      }

      console.log('Existing Facebook user signed in')
    } else {
      // Try to sign in first (in case user exists but facebook_user_id not set)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: process.env.FACEBOOK_DEFAULT_PASSWORD!,
      })

      // If sign in fails with "invalid credentials", create new account
      if (signInError && signInError.message?.toLowerCase().includes('invalid')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password: process.env.FACEBOOK_DEFAULT_PASSWORD!,
          options: {
            emailRedirectTo: `${requestUrl.origin}/auth/callback`,
            data: {
              full_name: profile.name,
              avatar_url: profile.picture?.data?.url,
              facebook_user_id: profile.id,
              provider: 'facebook',
            },
          },
        })

        if (signUpError) {
          // If rate limited, try to sign in
          if (signUpError.status === 429) {
            console.log('Rate limited during signup, attempting sign in...')
            await new Promise(resolve => setTimeout(resolve, 2000))
            const { error: retrySignInError } = await supabase.auth.signInWithPassword({
              email,
              password: process.env.FACEBOOK_DEFAULT_PASSWORD!,
            })
            if (retrySignInError && !retrySignInError.message?.includes('not confirmed')) {
              console.error('Sign in after rate limit failed:', retrySignInError)
              throw new Error('Account may exist but sign in failed. Please try again.')
            }
          } else {
            throw signUpError
          }
        }
        console.log('Facebook user signed up successfully')
      } else if (signInError && signInError.message?.includes('not confirmed')) {
        // Email not confirmed - confirm it manually
        console.log('Facebook user exists but email not confirmed, manually confirming...')

        try {
          const { createClient: createServiceClient } = await import('@supabase/supabase-js')
          const supabaseAdmin = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
          )

          const { data: userData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
          if (listError) throw listError

          const user = userData.users.find(u =>
            u.email === email || u.user_metadata?.facebook_user_id === profile.id
          )

          if (user) {
            await supabaseAdmin.auth.admin.updateUserById(user.id, {
              email_confirm: true
            })

            const { error: finalSignInError } = await supabase.auth.signInWithPassword({
              email,
              password: process.env.FACEBOOK_DEFAULT_PASSWORD!,
            })

            if (finalSignInError) throw finalSignInError
            console.log('Facebook user signed in after email confirmation')
          }
        } catch (adminError) {
          console.error('Error during admin email confirmation:', adminError)
          throw adminError
        }
      } else if (signInError) {
        throw signInError
      }
    }

    // ตรวจสอบ single-device session
    const { data: { user: signedInUser } } = await supabase.auth.getUser()
    if (signedInUser) {
      const { checkAndRegisterSession } = await import('@/lib/device-session')
      const result = await checkAndRegisterSession(signedInUser.id)
      if (result === 'conflict') {
        await supabase.auth.signOut()
        const conflictResponse = NextResponse.redirect(new URL('/session-conflict', requestUrl.origin))
        cookiesToSet.forEach(({ name, value, options }) => {
          conflictResponse.cookies.set(name, value, options)
        })
        return conflictResponse
      }
    }

    // Create redirect response after sign in
    const response = NextResponse.redirect(new URL('/', requestUrl.origin))

    // Set all session cookies in the response
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    console.log('Cookies being sent:', cookiesToSet.map(c => ({ name: c.name, hasValue: !!c.value })))

    return response
  } catch (err) {
    console.error('Facebook authentication error:', err)
    return NextResponse.redirect(
      new URL('/error?message=Facebook authentication failed', requestUrl.origin)
    )
  }
}

