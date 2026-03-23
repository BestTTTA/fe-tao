import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// session หมดอายุหลัง 30 วัน (ป้องกัน lock-out กรณีปิดแอปโดยไม่ logout)
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

/**
 * ตรวจสอบ session ก่อน login
 * - ถ้าไม่มี session หรือ session หมดอายุ → สร้าง session ใหม่ คืน 'ok'
 * - ถ้ามี session ที่ยังใช้งานได้ → คืน 'conflict' (user login อยู่ที่ device อื่น)
 */
export async function checkAndRegisterSession(userId: string): Promise<'ok' | 'conflict'> {
  try {
    const admin = getAdminClient()

    const { data: existing, error: selectError } = await admin
      .from('active_device_sessions')
      .select('created_at')
      .eq('user_id', userId)
      .maybeSingle()

    if (selectError) {
      if (selectError.code === '42P01') {
        console.error(
          '[device-session] TABLE ไม่มีอยู่ → กรุณารัน SQL ใน Supabase Dashboard:\n' +
          'CREATE TABLE IF NOT EXISTS public.active_device_sessions (\n' +
          '  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,\n' +
          '  created_at TIMESTAMPTZ DEFAULT NOW()\n' +
          ');'
        )
        return 'ok' // fail open
      }
      console.error('[device-session] select error:', selectError.code, selectError.message)
      return 'ok' // fail open
    }

    if (existing) {
      const sessionAge = Date.now() - new Date(existing.created_at).getTime()
      if (sessionAge < SESSION_TTL_MS) {
        // session ยังใช้งานอยู่ → device อื่น login ไม่ได้
        return 'conflict'
      }
      // session หมดอายุแล้ว → ให้ login ได้
    }

    // ไม่มี session หรือหมดอายุ → บันทึก session ใหม่
    const { error: upsertError } = await admin
      .from('active_device_sessions')
      .upsert(
        { user_id: userId, created_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )

    if (upsertError) {
      console.error('[device-session] upsert error:', upsertError.code, upsertError.message)
      return 'ok' // fail open
    }

    return 'ok'
  } catch (err) {
    console.error('[device-session] unexpected error:', err)
    return 'ok'
  }
}

/**
 * ลบ active session เมื่อผู้ใช้ logout
 */
export async function clearDeviceSession(userId: string): Promise<void> {
  try {
    const admin = getAdminClient()
    await admin
      .from('active_device_sessions')
      .delete()
      .eq('user_id', userId)
  } catch (err) {
    console.error('[device-session] clear error:', err)
  }
}
