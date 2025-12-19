# วิธีตั้งค่า Facebook Login สำหรับ Supabase

## ปัญหาที่พบ
```
ไม่สามารถโหลด URL ได้
โดเมนของ URL นี้ไม่ได้รวมอยู่ในโดเมนของแอพนี้
```

## วิธีแก้ไข

### 1. เข้า Facebook Developers Console
- ไปที่: https://developers.facebook.com/apps/
- เลือก App ของคุณ (App ID: ``)

### 2. ตั้งค่า App Domains
**Settings → Basic**

เพิ่มข้อมูลในฟิลด์ **App Domains:**
```
09ac2f27ef89.ngrok-free.app
zgmlexjmpijyzgtjautg.supabase.co
```

### 3. ตั้งค่า OAuth Redirect URIs
**Facebook Login → Settings**

เพิ่ม URLs ใน **Valid OAuth Redirect URIs:**
```
https://zgmlexjmpijyzgtjautg.supabase.co/auth/v1/callback
https://09ac2f27ef89.ngrok-free.app/auth/callback
```

### 4. ตรวจสอบ Supabase Configuration

**Supabase Dashboard → Authentication → Providers → Facebook**

ตรวจสอบว่า:
- ✅ Facebook Provider: **Enabled**
- ✅ Client ID (App ID): `1779982889374124`
- ✅ Client Secret: `[your-facebook-app-secret]`
- ✅ Authorized Client IDs: (ปล่อยว่างได้)

### 5. ตรวจสอบ Environment Variables

ใน `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=https://09ac2f27ef89.ngrok-free.app
NEXT_PUBLIC_SUPABASE_URL=https://zgmlexjmpijyzgtjautg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 6. บันทึกการเปลี่ยนแปลง
- คลิก **Save Changes** ใน Facebook Developers Console
- Restart Next.js development server

---

## สำหรับ Production

### เปลี่ยน Domain จาก ngrok เป็น Production Domain

**Facebook App Domains:**
```
yourdomain.com
zgmlexjmpijyzgtjautg.supabase.co
```

**Valid OAuth Redirect URIs:**
```
https://zgmlexjmpijyzgtjautg.supabase.co/auth/v1/callback
https://yourdomain.com/auth/callback
```

**Environment Variables:**
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## หมายเหตุสำคัญ

### Facebook App Mode

**Development Mode:**
- ทดสอบได้เฉพาะ Facebook accounts ที่เพิ่มใน **Roles** (Admin, Developer, Tester)
- เหมาะสำหรับการพัฒนา

**Live Mode:**
- ผู้ใช้ทั่วไปสามารถ login ได้
- ต้อง submit app for review บางฟีเจอร์
- ต้องมี Privacy Policy URL และ Terms of Service URL

### การเปลี่ยนเป็น Live Mode

1. เข้า **App Review → Permissions and Features**
2. Request permissions ที่ต้องการ (เช่น `email`, `public_profile`)
3. เพิ่ม Privacy Policy URL และ Terms of Service URL
4. Switch to **Live Mode** ใน Settings → Basic

---

## Troubleshooting

### ปัญหา: "URL Blocked: This redirect failed"
**แก้ไข:**
- ตรวจสอบว่า domain ถูกเพิ่มใน App Domains
- ตรวจสอบว่า redirect URI ถูกเพิ่มใน Valid OAuth Redirect URIs

### ปัญหา: "App Not Setup"
**แก้ไข:**
- ตรวจสอบว่า Facebook Login product ถูก enable แล้ว
- ตรวจสอบ Client ID และ Client Secret ใน Supabase

### ปัญหา: "Invalid OAuth Redirect URI"
**แก้ไข:**
- URL ต้องตรงกันทุกตัวอักษร (รวม `https://` และ path)
- ห้ามมี trailing slash เช่น `/callback/`

---

## การทดสอบ

1. เปิด browser ใน incognito/private mode
2. ไปที่หน้า login ของคุณ
3. คลิก "Login with Facebook"
4. Facebook จะขอ permission
5. หลัง authorize ควร redirect กลับมาที่แอพและ login สำเร็จ

---

## ข้อมูลเพิ่มเติม

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
