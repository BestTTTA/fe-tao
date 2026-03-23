/**
 * ระบบสิทธิ์ผู้ใช้ 3 ระดับ:
 *   - "trial" = สมัครใหม่ ทดลองใช้ 30 วัน (เข้าถึง premium ได้)
 *   - "basic" = หมดทดลอง (ไม่มีสิทธิ์ premium)
 *   - "vip"   = สมัคร VIP แล้ว (MONTH/YEAR + active)
 */

export type UserTier = 'trial' | 'basic' | 'vip'

export type ProfilePlan = {
  plan_type: string | null
  plan_status: string | null
  plan_current_period_end: string | null
}

/** คำนวณ tier จากข้อมูล profile */
export function getUserTier(profile: ProfilePlan | null): UserTier {
  if (!profile) return 'basic'

  const { plan_type, plan_status, plan_current_period_end } = profile

  // VIP: จ่ายเงินแล้ว (MONTH/YEAR) + active
  if (
    (plan_type === 'MONTH' || plan_type === 'YEAR') &&
    (plan_status === 'active' || plan_status === 'trialing')
  ) {
    return 'vip'
  }

  // Trial: plan_status = trialing + ยังไม่หมดอายุ
  if (plan_status === 'trialing' && plan_current_period_end) {
    const expiry = new Date(plan_current_period_end)
    if (expiry > new Date()) {
      return 'trial'
    }
  }

  // Basic: อื่น ๆ ทั้งหมด (หมดทดลอง / FREE / canceled ฯลฯ)
  return 'basic'
}

/** ตรวจสอบว่า tier นี้เข้าถึง premium content ได้ไหม */
export function hasPremiumAccess(tier: UserTier): boolean {
  return tier === 'vip' || tier === 'trial'
}
