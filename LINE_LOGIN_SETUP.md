# LINE Login Setup Guide

## 📋 สิ่งที่ต้องตั้งค่า

### 1. LINE Developers Console

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. สร้าง Provider ใหม่ (ถ้ายังไม่มี)
3. สร้าง Channel ใหม่ประเภท **LINE Login**
4. กรอกข้อมูล Channel:
   - **Channel name**: ชื่อแอป (เช่น TAROT & ORACLE)
   - **Channel description**: คำอธิบาย
   - **App types**: Web app

### 2. ตั้งค่า Callback URL

ใน Channel Settings > LINE Login:

**Callback URL:**
```
Production: https://your-domain.com/auth/line/callback
Development: http://localhost:3000/auth/line/callback
```

⚠️ **สำคัญ:** ต้องเพิ่มทั้ง production และ development URLs

### 3. ตั้งค่า Email permission (Optional)

ใน Channel Settings > LINE Login:
- เปิด **Email address permission**
- กรอก Privacy policy URL และ Terms of use URL

### 4. คัดลอก Credentials

ใน Channel Settings > Basic settings:
- **Channel ID** - คัดลอกมาใส่ใน `.env.local`
- **Channel secret** - คัดลอกมาใส่ใน `.env.local`

---

## ⚙️ Environment Variables

แก้ไขไฟล์ `.env.local`:

```env
# LINE Login Configuration
LINE_CHANNEL_ID=1234567890
LINE_CHANNEL_SECRET=abcdef1234567890
LINE_DEFAULT_PASSWORD=your_secure_random_password_min_32_chars
```

⚠️ **สำคัญ:**
- `LINE_DEFAULT_PASSWORD` ต้องเป็นรหัสผ่านที่ปลอดภัยมาก (อย่างน้อย 32 ตัวอักษร)
- ใช้สำหรับสร้าง account ใน Supabase Auth สำหรับผู้ใช้ LINE
- **อย่าแชร์** password นี้กับใคร

**สร้าง secure password:**
```bash
# MacOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## 🗄️ Database Setup

รัน migration เพื่อเพิ่ม `line_user_id` column:

```bash
# ถ้าใช้ Supabase CLI
supabase db push

# หรือรัน SQL โดยตรงใน Supabase Dashboard > SQL Editor:
```

```sql
-- Add line_user_id column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS line_user_id VARCHAR(255) UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_line_user_id
ON profiles(line_user_id);
```

---

## 🧪 การทดสอบ

### Local Development:

1. ตรวจสอบว่า `.env.local` มีค่าครบถ้วน
2. Restart dev server:
   ```bash
   npm run dev
   ```
3. ไปที่ `http://localhost:3000/login`
4. คลิกปุ่ม **LINE**
5. ควรจะ redirect ไป LINE Login
6. หลังจาก login สำเร็จ redirect กลับมาที่ `/`

### Production:

1. เพิ่ม production callback URL ใน LINE Developers Console
2. Deploy แอป
3. ตั้งค่า environment variables บน hosting platform
4. ทดสอบเหมือน local development

---

## 🔒 Security Notes

### การจัดเก็บ LINE Users

LINE Login implementation นี้ทำงานโดย:

1. **ผู้ใช้ใหม่:**
   - สร้าง account ใน Supabase Auth ด้วย temporary email: `line_{userId}@temp.line.local`
   - Password: ใช้ `LINE_DEFAULT_PASSWORD` (user ไม่รู้รหัสผ่านนี้)
   - บันทึก `line_user_id` ใน profiles table

2. **ผู้ใช้เดิม:**
   - หา profile จาก `line_user_id`
   - Sign in ด้วย email + `LINE_DEFAULT_PASSWORD`

### ⚠️ Limitations:

- User ไม่สามารถ login ด้วย email/password ได้ (ต้องใช้ LINE เท่านั้น)
- ถ้าต้องการให้ user สามารถ link LINE account กับ email account ที่มีอยู่แล้ว ต้องพัฒนาเพิ่ม

### 🔐 แนะนำเพิ่มเติม:

1. เก็บ LINE access_token ถ้าต้องการเรียก LINE API
2. Implement account linking (เชื่อม LINE account กับ email account)
3. เพิ่ม error handling และ logging
4. ใช้ JWT หรือ session แทน default password

---

## 🐛 Troubleshooting

### Error: "Invalid redirect_uri"
- ตรวจสอบว่า callback URL ใน LINE Developers Console ตรงกับที่ใช้ในโค้ด
- ต้องใส่ URL แบบเต็ม (รวม https://)

### Error: "Channel not found"
- ตรวจสอบ `LINE_CHANNEL_ID` ใน `.env.local`
- ตรวจสอบว่า Channel เปิดใช้งานแล้ว

### Error: "Failed to exchange code for token"
- ตรวจสอบ `LINE_CHANNEL_SECRET`
- ตรวจสอบว่า callback URL ถูกต้อง

### User ไม่สามารถ login ได้
- ตรวจสอบ database: `SELECT * FROM profiles WHERE line_user_id = 'xxx'`
- ตรวจสอบ logs ใน browser console และ server logs

---

## 📚 Resources

- [LINE Login Documentation](https://developers.line.biz/en/docs/line-login/)
- [LINE Login API Reference](https://developers.line.biz/en/reference/line-login/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

---

## ✅ Checklist

- [ ] สร้าง LINE Developers Channel
- [ ] ตั้งค่า Callback URL
- [ ] คัดลอก Channel ID และ Channel Secret
- [ ] ตั้งค่า Environment Variables
- [ ] รัน Database Migration
- [ ] ทดสอบ LINE Login ใน local
- [ ] Deploy และทดสอบใน production
