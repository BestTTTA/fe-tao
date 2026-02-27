import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * ตรวจสอบและลงทะเบียน session ใหม่แบบ atomic
 *
 * ใช้วิธี INSERT แทน SELECT+INSERT เพื่อป้องกัน race condition
 * - คืน 'ok'       → INSERT สำเร็จ = ไม่มี session อื่น
 * - คืน 'conflict' → duplicate key (code 23505) = มี session อื่นอยู่แล้ว
 * - คืน 'ok'       → error อื่น → fail open (ป้องกัน lock out กรณี DB มีปัญหา)
 */
export async function checkAndRegisterSession(userId: string): Promise<'ok' | 'conflict'> {
  try {
    const admin = getAdminClient()

    const { error } = await admin
      .from('active_device_sessions')
      .insert({ user_id: userId })

    if (!error) {
      return 'ok'
    }

    // 23505 = unique_violation → มี session อยู่แล้ว
    if (error.code === '23505') {
      return 'conflict'
    }

    // 42P01 = table ไม่มีอยู่ → แจ้งเตือนชัดเจน
    if (error.code === '42P01') {
      console.error(
        '[device-session] TABLE ไม่มีอยู่ → กรุณารัน SQL ใน Supabase Dashboard:\n' +
        'CREATE TABLE IF NOT EXISTS public.active_device_sessions (\n' +
        '  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,\n' +
        '  created_at TIMESTAMPTZ DEFAULT NOW()\n' +
        ');'
      )
      return 'ok' // fail open
    }

    console.error('[device-session] insert error:', error.code, error.message)
    return 'ok' // fail open สำหรับ error อื่น
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
