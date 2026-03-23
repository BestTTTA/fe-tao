import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * ลงทะเบียน session ใหม่แบบ atomic (upsert)
 *
 * ใช้ upsert เพื่อให้ผู้ใช้คนเดิมสามารถ login ซ้ำได้เลย
 * โดยไม่ต้อง logout ก่อน (แก้ปัญหาปิดแอปแล้ว session ค้าง)
 * - คืน 'ok' เสมอ เมื่อ upsert สำเร็จ (แทนที่ session เก่า)
 * - คืน 'ok' เมื่อ error → fail open (ป้องกัน lock out กรณี DB มีปัญหา)
 */
export async function checkAndRegisterSession(userId: string): Promise<'ok' | 'conflict'> {
  try {
    const admin = getAdminClient()

    const { error } = await admin
      .from('active_device_sessions')
      .upsert(
        { user_id: userId, created_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )

    if (!error) {
      return 'ok'
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

    console.error('[device-session] upsert error:', error.code, error.message)
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
