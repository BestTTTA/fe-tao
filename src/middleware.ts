import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // ให้การตรวจ session/redirect ไปทำใน updateSession (ที่เราปรับแล้ว)
  return await updateSession(request)
}

export const config = {
  matcher: [
    /**
     * จับทุกเส้นทาง ยกเว้น:
     * - _next/static, _next/image (ไฟล์ Next)
     * - favicon และสกุลรูปภาพทั่วไป
     * - robots.txt, sitemap.xml
     * - api/* (ถ้าอยากบังคับ auth กับ API ด้วย ให้ลบ 'api/' ออกจาก negative lookahead)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
