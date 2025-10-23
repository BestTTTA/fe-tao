import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/register', '/verify-email', '/auth', '/error']
const isPublicPath = (pathname: string) =>
  PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, // anon/publishable key
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          // sync -> request
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          // sync -> response
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl

  // หน้า public ผ่านได้ทั้งหมด
  if (isPublicPath(pathname)) {
    return supabaseResponse
  }

  // ถ้าไม่มี user → redirect ไป /login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname + search)

    // ✅ คัดลอกคุกกี้จาก supabaseResponse -> redirectResponse
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, {
        ...c, // ถ้า next เวอร์ชันคุณไม่รองรับ spread นี้ ให้ส่งเฉพาะ { path: c.path, domain: c.domain, ... } ที่จำเป็น
      })
    })
    return redirectResponse
  }

  return supabaseResponse
}
