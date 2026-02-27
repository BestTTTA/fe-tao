import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { checkAndRegisterSession } from '@/lib/device-session'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // If type is 'recovery', redirect to reset-password page (no device session needed)
      if (type === 'recovery') {
        redirect('/reset-password')
      }
      // ตรวจสอบ single-device session หลังยืนยันอีเมล
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const result = await checkAndRegisterSession(user.id)
        if (result === 'conflict') {
          await supabase.auth.signOut()
          redirect('/session-conflict')
        }
      }
      // redirect user to specified redirect URL or root of app
      redirect(next)
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/error')
}