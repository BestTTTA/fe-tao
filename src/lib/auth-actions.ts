'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

/* ---------------- Helpers ---------------- */

function toErrorRedirect(code: string, message: string): never {
  const q = new URLSearchParams({ code, message })
  redirect(`/error?${q.toString()}`)
}

/** คืน base URL ของแอป เช่น https://example.com */
async function getSiteUrl() {
  const env = process.env.NEXT_PUBLIC_SITE_URL
  if (env) return env.replace(/\/$/, '')

  // FIX: headers() ในบางโปรเจ็กต์เป็น Promise ต้อง await
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  return `${proto}://${host}`
}

/* ---------------- Actions ---------------- */

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: String(formData.get('email') || ''),
    password: String(formData.get('password') || ''),
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const msg = (error.message || '').toLowerCase()

    // ถ้ายังไม่ได้ยืนยันอีเมล → บังคับไปหน้า verify
    if (msg.includes('email') && (msg.includes('confirm') || msg.includes('not confirmed'))) {
      redirect('/verify-email')
    }

    if (msg.includes('invalid') || msg.includes('credentials')) {
      toErrorRedirect('auth_invalid_credentials', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง')
    }

    toErrorRedirect('auth_signin_error', error.message ?? 'เกิดข้อผิดพลาดขณะเข้าสู่ระบบ')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // อ่านค่าตรง ๆ (ไม่รองรับ prefix)
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '').trim()

  const first = String(formData.get('first-name') || '').trim()
  const last  = String(formData.get('last-name') || '').trim()
  const full_name = [first, last].filter(Boolean).join(' ')

  const nick_name  = (String(formData.get('nick_name') || '').trim()) || null
  const avatar_url = (String(formData.get('avatar_url') || '').trim()) || null

  // ทำความสะอาดเบอร์ → ตัวเลขล้วน 10 หลัก (ให้ตรง schema varchar(10))
  const phoneRaw = String(formData.get('phone') || '')
  const phone = phoneRaw ? phoneRaw.replace(/\D/g, '').slice(0, 10) : null

  const share_profile_name  = formData.get('share_profile_name') === 'on'
  const share_profile_image = formData.get('share_profile_image') === 'on'

  if (!email || !password) {
    toErrorRedirect('missing_fields', 'กรุณากรอกอีเมลและรหัสผ่าน')
  }
  if (phone && phone.length !== 10) {
    toErrorRedirect('invalid_phone', 'เบอร์โทรศัพท์ควรมี 10 หลัก')
  }

  // ตั้งปลายทางของลิงก์ยืนยันอีเมล
  const siteUrl = await getSiteUrl()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/login`, 
      data: {
        full_name,
        nick_name,
        phone,                  // varchar(10)
        share_profile_name,
        share_profile_image,
        avatar_url,
        // ไม่ต้องยัด email ใน metadata (trigger ใช้ NEW.email)
      },
    },
  })

  if (error) {
    const raw = (error.message || '').toLowerCase()
    if (raw.includes('already') && raw.includes('registered')) {
      toErrorRedirect('auth_already_registered', 'อีเมลนี้สมัครไว้แล้ว กรุณาเข้าสู่ระบบ')
    }
    toErrorRedirect('auth_signup_error', error.message ?? 'เกิดข้อผิดพลาดขณะลงทะเบียน')
  }

  // บังคับไปหน้าบอกให้ตรวจอีเมล (ยังไม่ให้เข้าระบบจนกว่าจะยืนยัน)
  revalidatePath('/', 'layout')
  redirect('/verify-email')
}

/** ส่งลิงก์ยืนยันอีเมลอีกครั้ง (ใช้ในหน้า /verify-email) */
export async function resendVerification(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') || '').trim()
  if (!email) {
    toErrorRedirect('missing_email', 'กรุณากรอกอีเมลสำหรับการส่งลิงก์ยืนยันอีกครั้ง')
  }

  const siteUrl = await getSiteUrl()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback` },
  })

  if (error) {
    toErrorRedirect('resend_error', error.message ?? 'ไม่สามารถส่งลิงก์ยืนยันอีกครั้ง')
  }

  redirect('/verify-email?sent=1')
}

/** ส่งอีเมลรีเซ็ตรหัสผ่าน */
export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') || '').trim()

  if (!email) {
    toErrorRedirect('missing_email', 'กรุณากรอกอีเมล')
  }

  const siteUrl = await getSiteUrl()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?type=recovery`,
  })

  if (error) {
    toErrorRedirect('reset_error', error.message ?? 'ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่าน')
  }

  redirect('/forgot?sent=1')
}

/** อัพเดทรหัสผ่านใหม่ (ใช้หลังจากยืนยันลิงก์) */
export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = String(formData.get('password') || '').trim()
  const confirm = String(formData.get('confirm') || '').trim()

  if (!password || password.length < 8) {
    toErrorRedirect('invalid_password', 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
  }

  if (password !== confirm) {
    toErrorRedirect('password_mismatch', 'รหัสผ่านไม่ตรงกัน')
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    toErrorRedirect('update_error', error.message ?? 'ไม่สามารถอัพเดทรหัสผ่าน')
  }

  // ออกจากระบบเพื่อให้ล็อกอินใหม่ด้วยรหัสผ่านใหม่
  await supabase.auth.signOut()
  redirect('/login?reset=success')
}

export async function signout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    toErrorRedirect('auth_signout_error', error.message ?? 'ออกจากระบบไม่สำเร็จ')
  }
  redirect('/')
}




export async function signInWithGoogle() {
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    console.log(error);
    redirect("/error");
  }

  redirect(data.url);
}

export async function signInWithFacebook() {
  const siteUrl = await getSiteUrl();

  // Generate random state for CSRF protection
  const state = Math.random().toString(36).substring(7);

  // Build Facebook OAuth authorization URL
  const facebookAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
  facebookAuthUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '');
  facebookAuthUrl.searchParams.set('redirect_uri', `${siteUrl}/auth/facebook/callback`);
  facebookAuthUrl.searchParams.set('state', state);
  facebookAuthUrl.searchParams.set('scope', 'email,public_profile');
  facebookAuthUrl.searchParams.set('response_type', 'code');

  // Redirect to Facebook authorization page
  redirect(facebookAuthUrl.toString());
}

export async function signInWithApple() {
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      scopes: 'name email', // Request name and email from Apple
    },
  });

  if (error || !data.url) {
    console.log(error);
    toErrorRedirect('auth_apple_error', error?.message ?? 'ไม่สามารถเข้าสู่ระบบด้วย Apple ได้');
  }

  redirect(data.url);
}

export async function signInWithLine() {
  const siteUrl = await getSiteUrl();

  // Generate random state for CSRF protection
  const state = Math.random().toString(36).substring(7);

  // Build LINE OAuth authorization URL
  const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
  lineAuthUrl.searchParams.set('response_type', 'code');
  lineAuthUrl.searchParams.set('client_id', process.env.LINE_CHANNEL_ID || '');
  lineAuthUrl.searchParams.set('redirect_uri', `${siteUrl}/auth/line/callback`);
  lineAuthUrl.searchParams.set('state', state);
  lineAuthUrl.searchParams.set('scope', 'profile openid email');

  // Redirect to LINE authorization page
  redirect(lineAuthUrl.toString());
}