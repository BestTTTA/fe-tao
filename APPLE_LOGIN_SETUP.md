# วิธีตั้งค่า Sign in with Apple สำหรับ Supabase

## ข้อกำหนดเบื้องต้น

- ✅ Apple Developer Account ($99/year)
- ✅ Domain ที่ verified (ไม่สามารถใช้ localhost หรือ ngrok ได้)
- ✅ Email domain ที่ verified (สำหรับรับ private relay emails)

## ⚠️ หมายเหตุสำคัญ

**Sign in with Apple ต้องการ:**
- **Production domain** (ไม่สามารถทดสอบบน localhost ได้)
- **HTTPS** เท่านั้น
- **Apple Developer Account** ที่ชำระเงินแล้ว

ถ้ายังไม่มี Apple Developer Account หรือ production domain แนะนำให้เริ่มจาก **Google, Facebook, หรือ LINE** ก่อน

---

## ขั้นตอนการตั้งค่า

### 1. สร้าง App ID (ถ้ายังไม่มี)

1. ไปที่ [Apple Developer Console](https://developer.apple.com/account/)
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. คลิก **+** (Add) → เลือก **App IDs** → คลิก **Continue**
4. เลือก **App** → คลิก **Continue**
5. กรอกข้อมูล:
   - **Description**: Your App Name
   - **Bundle ID**: com.yourcompany.yourapp (Explicit)
6. ใน **Capabilities** → เลือก **Sign in with Apple**
7. คลิก **Continue** → **Register**

### 2. สร้าง Services ID

1. ใน **Identifiers** → คลิก **+** (Add)
2. เลือก **Services IDs** → คลิก **Continue**
3. กรอกข้อมูล:
   - **Description**: Your App Name Web
   - **Identifier**: com.yourcompany.yourapp.web (ต้องไม่ซ้ำกับ App ID)
4. คลิก **Continue** → **Register**

### 3. Configure Services ID

1. คลิกที่ Services ID ที่สร้างไว้
2. เลือก **Sign in with Apple** → คลิก **Configure**
3. กรอกข้อมูล:
   - **Primary App ID**: เลือก App ID ที่สร้างไว้ใน Step 1
   - **Domains and Subdomains**:
     ```
     yourdomain.com
     zgmlexjmpijyzgtjautg.supabase.co
     ```
   - **Return URLs**:
     ```
     https://zgmlexjmpijyzgtjautg.supabase.co/auth/v1/callback
     https://yourdomain.com/auth/callback
     ```
4. คลิก **Next** → **Done** → **Continue** → **Save**

### 4. สร้าง Private Key

1. ใน **Certificates, Identifiers & Profiles** → **Keys**
2. คลิก **+** (Add)
3. กรอก **Key Name**: Sign in with Apple Key
4. เลือก **Sign in with Apple** → คลิก **Configure**
5. เลือก **Primary App ID** ที่สร้างไว้
6. คลิก **Save** → **Continue** → **Register**
7. **ดาวน์โหลด Private Key** (.p8 file) → **เก็บไว้ให้ดี ดาวน์โหลดได้ครั้งเดียว**
8. จด **Key ID** ที่แสดงหลังดาวน์โหลด

### 5. หา Team ID

1. ไปที่ [Membership](https://developer.apple.com/account/#/membership/)
2. จด **Team ID** (10 ตัวอักษร เช่น `ABC123DEFG`)

---

## ตั้งค่า Supabase

### 1. เปิดใช้งาน Apple Provider

1. ไปที่ [Supabase Dashboard](https://app.supabase.com/)
2. เลือก Project ของคุณ
3. **Authentication** → **Providers** → **Apple**
4. Toggle **Enable Sign in with Apple**: **ON**

### 2. กรอกข้อมูล

**Services ID (Client ID):**
```
com.yourcompany.yourapp.web
```
(Services ID ที่สร้างใน Step 2)

**Secret Key (Private Key):**
```
-----BEGIN PRIVATE KEY-----
[เนื้อหาจากไฟล์ .p8 ที่ดาวน์โหลด]
-----END PRIVATE KEY-----
```

**Key ID:**
```
ABC123DEFG
```
(Key ID จาก Step 4)

**Team ID:**
```
XYZ789HIJK
```
(Team ID จาก Step 5)

### 3. Save Configuration

คลิก **Save** ที่ด้านล่าง

---

## ตั้งค่า Environment Variables (ถ้าใช้ Custom Implementation)

ถ้าต้องการ implement Apple login แบบ custom (เหมือน LINE/Facebook):

### เพิ่มใน `.env.local`:

```env
# Apple Sign In Configuration
NEXT_PUBLIC_APPLE_CLIENT_ID=com.yourcompany.yourapp.web
APPLE_TEAM_ID=ABC123DEFG
APPLE_KEY_ID=XYZ789HIJK
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIGT...your key...\n-----END PRIVATE KEY-----"
APPLE_DEFAULT_PASSWORD=your_secure_password_here
```

**หมายเหตุ:**
- `APPLE_PRIVATE_KEY`: ใส่เนื้อหาจากไฟล์ .p8 โดยใช้ `\n` แทนการขึ้นบรรทัดใหม่
- `APPLE_DEFAULT_PASSWORD`: รหัสผ่านสำหรับ Apple users (ใช้รหัสเดียวกับ LINE/Facebook ได้)

---

## การใช้งานใน Code

### Option 1: ใช้ Supabase OAuth (แนะนำ)

Code ที่มีอยู่แล้วใน `src/lib/auth-actions.ts`:

```typescript
export async function signInWithApple() {
  const supabase = await createClient();
  const siteUrl = await getSiteUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      scopes: 'name email', // Request name and email
    },
  });

  if (error || !data.url) {
    console.log(error);
    toErrorRedirect('auth_apple_error', error?.message ?? 'ไม่สามารถเข้าสู่ระบบด้วย Apple ได้');
  }

  redirect(data.url);
}
```

### Option 2: Custom Implementation (Advanced)

ถ้าต้องการ control เต็มรูปแบบ (เหมือน LINE/Facebook):

สร้างไฟล์ `src/app/(auth)/auth/apple/callback/route.ts` และ implement เหมือน Facebook callback

---

## คุณสมบัติพิเศษของ Apple

### 1. Hide My Email

Apple มี feature "Hide My Email" ที่จะสร้าง relay email ให้ user เช่น:
```
user123abc@privaterelay.appleid.com
```

Email นี้จะ forward ไปยัง email จริงของ user

**การจัดการ:**
- ต้องตั้งค่า Email Relay Service ใน Apple Developer Console
- ระบุ domain ที่ verified สำหรับส่ง email

### 2. User Name (ครั้งแรกเท่านั้น)

Apple จะส่ง `name` มาให้ **ครั้งแรกเท่านั้น** ที่ user login

**Best Practice:**
- เก็บ `name` ไว้ใน database ทันทีที่ได้รับ
- ไม่ควร rely on name ในการ login ครั้งถัดไป

### 3. Authorization Revocation

User สามารถ revoke access ได้จาก Settings → Apple ID → Password & Security → Apps Using Your Apple ID

**จัดการ:**
- ต้อง implement revocation endpoint
- Apple จะส่ง notification มาที่ endpoint เมื่อ user revoke

---

## Troubleshooting

### ปัญหา: "invalid_client"

**สาเหตุ:**
- Services ID ไม่ถูกต้อง
- Private key ไม่ถูกต้อง
- Team ID หรือ Key ID ผิด

**แก้ไข:**
- ตรวจสอบค่าทั้งหมดใน Supabase Dashboard
- ตรวจสอบว่า Private Key มี format ที่ถูกต้อง (รวม BEGIN/END)

### ปัญหา: "invalid_request - redirect_uri"

**สาเหตุ:**
- Return URL ใน Services ID Configuration ไม่ตรงกับที่ระบุใน request

**แก้ไข:**
- ตรวจสอบว่า Return URLs ใน Apple Developer Console ตรงกับ Supabase callback URL
- URL ต้องตรงทุกตัวอักษร (รวม https:// และ path)

### ปัญหา: "Domain not verified"

**สาเหตุ:**
- Domain ยังไม่ได้ verify ใน Apple Developer Console

**แก้ไข:**
1. ไปที่ Services ID Configuration
2. เพิ่ม domain ใน Domains and Subdomains
3. Follow ขั้นตอนการ verify (อาจต้องเพิ่ม file หรือ DNS record)

### ปัญหา: ไม่ได้รับ email จาก Apple

**สาเหตุ:**
- User เลือก "Hide My Email"
- Email relay ยังไม่ได้ตั้งค่า

**แก้ไข:**
- ตั้งค่า Email Relay ใน Apple Developer Console
- ระบุ email domain ที่ verified
- ใช้ placeholder email ถ้าไม่ได้รับ (เหมือน Facebook)

---

## ข้อแนะนำ

### สำหรับ Development

- ⚠️ **ไม่สามารถทดสอบบน localhost ได้**
- ใช้ ngrok หรือ development domain ที่ verified
- หรือทดสอบบน staging environment

### สำหรับ Production

- ✅ ใช้ production domain ที่ verified
- ✅ Setup email relay สำหรับรับ emails
- ✅ Implement revocation endpoint
- ✅ Handle "Hide My Email" case
- ✅ Store user name ในครั้งแรก

### Alternative: ถ้าไม่มี Apple Developer Account

ถ้ายังไม่พร้อมสำหรับ Apple login แนะนำให้ใช้:
- ✅ Google Login (ง่ายที่สุด, ไม่ต้องจ่ายเงิน)
- ✅ Facebook Login (setup เสร็จแล้ว)
- ✅ LINE Login (setup เสร็จแล้ว, popular ในไทย)

---

## Resources

- [Apple Developer Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Supabase Apple OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)

---

## สรุป

Apple Login มีความซับซ้อนและข้อกำหนดมากกว่า provider อื่นๆ:

**ข้อดี:**
- ✅ ความปลอดภัยสูง
- ✅ Privacy-focused (Hide My Email)
- ✅ Trusted brand
- ✅ iOS users นิยมใช้

**ข้อเสีย:**
- ❌ ต้องจ่ายเงิน $99/year
- ❌ ต้องมี production domain
- ❌ ไม่สามารถทดสอบบน localhost
- ❌ Setup ซับซ้อนกว่า
- ❌ ต้อง handle edge cases หลายอย่าง

**คำแนะนำ:**
- ถ้าเป็น MVP หรือ early stage → เริ่มจาก Google/Facebook/LINE ก่อน
- ถ้ามี iOS app หรือ target audience ใช้ iPhone เยอะ → ควร implement Apple Login
