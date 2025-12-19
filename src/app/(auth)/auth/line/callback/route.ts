import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const error = requestUrl.searchParams.get('error')

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
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const { access_token, id_token } = tokenData

    // Get user profile from LINE
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!profileResponse.ok) {
      throw new Error('Failed to get LINE profile')
    }

    const profile = await profileResponse.json()

    // Create or sign in user in Supabase
    const supabase = await createClient()

    // Check if user exists with LINE user ID
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('email')
      .eq('line_user_id', profile.userId)
      .maybeSingle()

    if (existingUser?.email) {
      // User exists, sign them in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: existingUser.email,
        password: process.env.LINE_DEFAULT_PASSWORD!, // Use a secure method in production
      })

      if (signInError) {
        throw signInError
      }
    } else {
      // New user, create account
      const email = `line_${profile.userId}@temp.line.local` // Temporary email
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: process.env.LINE_DEFAULT_PASSWORD!,
        options: {
          data: {
            full_name: profile.displayName,
            avatar_url: profile.pictureUrl,
            line_user_id: profile.userId,
            provider: 'line',
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }
    }

    // Redirect to home page
    return NextResponse.redirect(new URL('/', requestUrl.origin))
  } catch (err) {
    console.error('LINE authentication error:', err)
    return NextResponse.redirect(
      new URL('/error?message=LINE authentication failed', requestUrl.origin)
    )
  }
}
