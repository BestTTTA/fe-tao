import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')

  // Validate required environment variables
  if (!process.env.LINE_CHANNEL_ID || !process.env.LINE_CHANNEL_SECRET || !process.env.LINE_DEFAULT_PASSWORD) {
    console.error('Missing required LINE environment variables')
    return NextResponse.redirect(
      new URL('/error?message=LINE authentication is not configured', requestUrl.origin)
    )
  }

  // Handle error from LINE
  if (error) {
    return NextResponse.redirect(
      new URL(`/error?message=LINE authentication failed: ${error}`, requestUrl.origin)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/error?message=No authorization code received', requestUrl.origin)
    )
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${requestUrl.origin}/auth/line/callback`,
        client_id: process.env.LINE_CHANNEL_ID!,
        client_secret: process.env.LINE_CHANNEL_SECRET!,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('LINE token exchange failed:', errorText)
      throw new Error(`Failed to exchange code for token: ${errorText}`)
    }

    const tokenData = await tokenResponse.json() as { access_token: string }
    const { access_token } = tokenData

    // Get user profile from LINE
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text()
      console.error('LINE profile fetch failed:', errorText)
      throw new Error(`Failed to get LINE profile: ${errorText}`)
    }

    const profile = await profileResponse.json()
    console.log('LINE profile retrieved:', { userId: profile.userId, displayName: profile.displayName })

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
            // Store cookies to set later in the response
            newCookies.forEach((cookie) => {
              cookieStore.set(cookie.name, cookie.value, cookie.options)
              cookiesToSet.push(cookie)
            })
          },
        },
      }
    )

    // Check if user exists with LINE user ID
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('line_user_id', profile.userId)
      .maybeSingle()

    const email = `line_${profile.userId}@line.placeholder.com`

    if (existingUser?.email) {
      // User exists, sign them in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: existingUser.email,
        password: process.env.LINE_DEFAULT_PASSWORD!,
      })

      if (signInError) {
        throw signInError
      }

      console.log('Existing LINE user signed in')
    } else {
      // Try to sign in first (in case user exists but line_user_id not set in profile)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: process.env.LINE_DEFAULT_PASSWORD!,
      })

      // If sign in fails with "invalid credentials", the user might not exist yet
      if (signInError && signInError.message?.toLowerCase().includes('invalid')) {
        // User doesn't exist, create new account
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password: process.env.LINE_DEFAULT_PASSWORD!,
          options: {
            emailRedirectTo: `${requestUrl.origin}/auth/callback`,
            data: {
              full_name: profile.displayName,
              avatar_url: profile.pictureUrl,
              line_user_id: profile.userId,
              provider: 'line',
            },
          },
        })

        if (signUpError) {
          // If rate limited, the user was probably already created - try to sign in
          if (signUpError.status === 429) {
            console.log('Rate limited during signup, attempting sign in...')
            await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
            const { error: retrySignInError } = await supabase.auth.signInWithPassword({
              email,
              password: process.env.LINE_DEFAULT_PASSWORD!,
            })
            if (retrySignInError && !retrySignInError.message?.includes('not confirmed')) {
              console.error('Sign in after rate limit failed:', retrySignInError)
              throw new Error('Account may exist but sign in failed. Please try again in a few moments.')
            }
            // If email not confirmed, continue anyway (LINE users don't need email confirmation)
          } else {
            throw signUpError
          }
        }
        // After signup, user session is automatically created, no need to sign in
        console.log('LINE user signed up successfully')
      } else if (signInError && signInError.message?.includes('not confirmed')) {
        // Email not confirmed - for LINE users, we'll update their email verification status
        console.log('LINE user exists but email not confirmed, manually confirming...')

        try {
          // Create admin client to confirm email
          const { createClient: createServiceClient } = await import('@supabase/supabase-js')
          const supabaseAdmin = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
          )

          // Get user by email or line_user_id from user_metadata
          const { data: userData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
          if (listError) {
            console.error('Failed to list users:', listError)
            throw listError
          }

          console.log('Total users found:', userData.users.length)

          // Try to find user by current email or by line_user_id in metadata
          let user = userData.users.find(u => u.email === email)

          if (!user) {
            // Try to find by line_user_id in user_metadata
            user = userData.users.find(u =>
              u.user_metadata?.line_user_id === profile.userId
            )
            console.log('User found by line_user_id:', !!user)
          }

          if (!user) {
            // Try to find by old email format
            const oldEmail = `line_${profile.userId}@temp.line.local`
            user = userData.users.find(u => u.email === oldEmail)
            console.log('User found by old email format:', !!user, oldEmail)
          }

          if (user) {
            console.log('Found user:', { id: user.id, email: user.email })

            // Update email if it's different
            if (user.email !== email) {
              console.log('Updating user email from', user.email, 'to', email)
              const { error: emailUpdateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
                email: email,
                email_confirm: true
              })

              if (emailUpdateError) {
                console.error('Failed to update email:', emailUpdateError)
                throw emailUpdateError
              }
            } else {
              // Just confirm the email
              const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
                email_confirm: true
              })

              if (updateError) {
                console.error('Failed to confirm email:', updateError)
                throw updateError
              }
            }

            console.log('Email confirmed for LINE user:', user.id)

            // Now try to sign in again
            const { error: finalSignInError } = await supabase.auth.signInWithPassword({
              email,
              password: process.env.LINE_DEFAULT_PASSWORD!,
            })

            if (finalSignInError) {
              console.error('Sign in after email confirmation failed:', finalSignInError)
              throw finalSignInError
            }

            console.log('LINE user signed in successfully after email confirmation')
          } else {
            console.error('User not found with email:', email)
            console.error('Users in system:', userData.users.map(u => ({ email: u.email, line_id: u.user_metadata?.line_user_id })))
            throw new Error('User not found in system')
          }
        } catch (adminError) {
          console.error('Error during admin email confirmation:', adminError)
          throw adminError
        }
      } else if (signInError) {
        // Other sign in errors
        console.error('Sign in error:', signInError)
        throw signInError
      }
    }

    // Create redirect response after sign in
    const response = NextResponse.redirect(new URL('/', requestUrl.origin))

    // Set all session cookies in the response
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    console.log('Cookies being sent:', cookiesToSet.map(c => ({ name: c.name, hasValue: !!c.value })))

    // Return the response with session cookies
    return response
  } catch (err) {
    console.error('LINE authentication error:', err)
    return NextResponse.redirect(
      new URL('/error?message=LINE authentication failed', requestUrl.origin)
    )
  }
}
