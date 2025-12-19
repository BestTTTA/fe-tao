import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const next = requestUrl.searchParams.get('next') ?? '/'

  // Check for OAuth errors from provider
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const message = errorDescription || error || 'Authentication failed'
    return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent(message)}`, requestUrl.origin))
  }

  if (code) {
    const supabase = await createClient()

    // Exchange the code for a session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      // Successfully authenticated, redirect to the specified path or home
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }

    console.error('Error exchanging code for session:', exchangeError)
    return NextResponse.redirect(
      new URL(`/error?message=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
    )
  }

  // If there's an error or no code, redirect to error page
  return NextResponse.redirect(new URL('/error?message=Authentication failed', requestUrl.origin))
}
