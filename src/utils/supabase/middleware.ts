import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/register', '/verify-email', '/forgot', '/reset-password', '/auth', '/error', '/session-conflict', '/terms']

// เพิ่ม pattern สำหรับหน้า result ของ reading
const PUBLIC_PATTERNS = [/^\/reading\/[^/]+\/result$/]

const isPublicPath = (pathname: string) =>
  PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
  PUBLIC_PATTERNS.some((regex) => regex.test(pathname))

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // 🔧 Skip middleware check in development mode
  if (process.env.SKIP_MIDDLEWARE === 'true') {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, // anon key
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl

  // หน้าที่ไม่ต้อง check terms (ป้องกัน redirect loop)
  const SKIP_TERMS_PATHS = ['/terms', '/login', '/register', '/auth', '/error', '/session-conflict', '/verify-email', '/forgot', '/reset-password']
  const skipTermsCheck = SKIP_TERMS_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  // 📋 ถ้า user login แล้ว + ยังไม่ยอมรับ terms → redirect ไป /terms
  if (user && !skipTermsCheck) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('accepted_terms')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile || profile.accepted_terms !== true) {
      const url = request.nextUrl.clone()
      url.pathname = '/terms'
      url.search = ''
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((c) => {
        redirectResponse.cookies.set(c.name, c.value, { ...c })
      })
      return redirectResponse
    }
  }

  // ✅ อนุญาตให้หน้า public ผ่านได้ทั้งหมด
  if (isPublicPath(pathname)) {
    return supabaseResponse
  }

  // 🚫 ถ้าไม่มี user → redirect ไป /login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname + search)

    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, {
        ...c,
      })
    })
    return redirectResponse
  }

  return supabaseResponse
}
