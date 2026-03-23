import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function initTrialIfNeeded(userId: string): Promise<void> {
  try {
    const admin = getAdminClient()

    let profile: {
      plan_type: string | null
      plan_status: string | null
      plan_current_period_end: string | null
    } | null = null

    for (let attempt = 0; attempt < 3; attempt++) {
      const { data } = await admin
        .from('profiles')
        .select('plan_type, plan_status, plan_current_period_end')
        .eq('id', userId)
        .maybeSingle()
      profile = data
      if (profile) break
      await new Promise(r => setTimeout(r, 300 * (attempt + 1)))
    }

    if (!profile) {
      console.warn('[init-trial] profile not found:', userId)
      return
    }

    // *** DEBUG — ลบออกทีหลัง ***
    console.log('[init-trial] profile:', JSON.stringify(profile))

    if (profile.plan_type && profile.plan_type !== 'FREE') {
      console.log('[init-trial] skip: paid plan =', profile.plan_type)
      return
    }
    if (profile.plan_status === 'trialing') {
      console.log('[init-trial] skip: already trialing')
      return
    }
    if (profile.plan_status === 'active' && profile.plan_current_period_end !== null) {
      console.log('[init-trial] skip: active with period end =', profile.plan_current_period_end)
      return
    }

    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 30)

    const { error } = await admin
      .from('profiles')
      .update({
        plan_type: 'FREE',
        plan_status: 'trialing',
        plan_current_period_end: trialEnd.toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('[init-trial] update failed:', error)
    } else {
      // verify ว่า DB จริงๆ อัปเดตแล้ว
      const { data: verify } = await admin
        .from('profiles')
        .select('plan_type, plan_status, plan_current_period_end')
        .eq('id', userId)
        .single()
      console.log('[init-trial] verify after update:', JSON.stringify(verify))
    }
  } catch (err) {
    console.error('[init-trial] error:', err)
  }
}
