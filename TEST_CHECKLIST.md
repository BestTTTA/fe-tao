# Unit Test Checklist — fe-tao

> สร้างเมื่อ: 2026-02-18
> Framework: **Vitest** + **React Testing Library** + **@testing-library/jest-dom**

---

## Setup

- [x] ติดตั้ง `vitest`, `@vitejs/plugin-react`, `jsdom`
- [x] ติดตั้ง `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- [x] ติดตั้ง `@vitest/coverage-v8`
- [x] สร้าง `vitest.config.ts` (env=jsdom, path alias `@/`)
- [x] สร้าง `src/__tests__/setup.ts` (mock next/navigation, next/cache, next/headers)
- [x] เพิ่ม script `test`, `test:watch`, `test:coverage` ใน `package.json`

---

## Test Files

| ไฟล์ | Module ที่ทดสอบ | จำนวน Test Cases |
|------|----------------|-----------------|
| `src/__tests__/utils/toPublicUrl.test.ts` | `src/utils/toPublicUrl.ts` | 11 |
| `src/__tests__/utils/imageCompression.test.ts` | `src/utils/imageCompression.ts` | 20 |
| `src/__tests__/components/AlertModal.test.tsx` | `src/components/AlertModal.tsx` | 14 |
| `src/__tests__/components/ConfirmModal.test.tsx` | `src/components/ConfirmModal.tsx` | 18 |
| `src/__tests__/lib/auth-actions.test.ts` | `src/lib/auth-actions.ts` | 23 |
| **รวม** | | **86** |

---

## Checklist by Module

### 1. `utils/toPublicUrl` — TC-001 ถึง TC-011

- [x] TC-001: คืน null สำหรับ `undefined`
- [x] TC-002: คืน null สำหรับ `null`
- [x] TC-003: คืน null สำหรับ string ว่าง
- [x] TC-004: ไม่แก้ไข https URL
- [x] TC-005: ไม่แก้ไข http URL
- [x] TC-006: case-insensitive https detection
- [x] TC-007: ต่อ base URL กับ relative path
- [x] TC-008: ตัด `/` นำหน้า path
- [x] TC-009: ตัด `/` หลายตัวนำหน้า
- [x] TC-010: ตัด `/` ท้าย base URL
- [x] TC-011: ใช้ string ว่างเมื่อไม่มี env var

---

### 2. `utils/imageCompression` — TC-012 ถึง TC-031

#### `isValidImageType`
- [x] TC-012: ยอมรับ `image/jpeg`
- [x] TC-013: ยอมรับ `image/jpg`
- [x] TC-014: ยอมรับ `image/png`
- [x] TC-015: ยอมรับ `image/gif`
- [x] TC-016: ยอมรับ `image/webp`
- [x] TC-017: ยอมรับ `image/bmp`
- [x] TC-018: ยอมรับ `image/svg+xml`
- [x] TC-019: ปฏิเสธ `application/pdf`
- [x] TC-020: ปฏิเสธ `video/mp4`
- [x] TC-021: ปฏิเสธ `text/plain`
- [x] TC-022: ปฏิเสธ type ว่าง
- [x] TC-023: ปฏิเสธ `application/octet-stream`

#### `isValidFileSize`
- [x] TC-024: ไฟล์เล็กกว่า limit → ผ่าน
- [x] TC-025: ไฟล์ขนาดเท่า limit พอดี → ผ่าน (boundary)
- [x] TC-026: ไฟล์ใหญ่กว่า limit 1 byte → ไม่ผ่าน
- [x] TC-027: ไฟล์ 1 byte กับ limit 5 MB → ผ่าน
- [x] TC-028: ไฟล์ 10 MB กับ limit 5 MB → ไม่ผ่าน
- [x] TC-029: ไฟล์ 4 MB กับ limit 5 MB → ผ่าน
- [x] TC-030: limit 0 MB → ปฏิเสธทุกไฟล์ที่ > 0
- [x] TC-031: ไฟล์ 0 byte → ผ่านทุก limit

---

### 3. `components/AlertModal` — TC-032 ถึง TC-045

#### Visibility
- [x] TC-032: ไม่แสดงเมื่อ `open=false`
- [x] TC-033: แสดงเมื่อ `open=true`

#### Content
- [x] TC-034: แสดง title ถูกต้อง
- [x] TC-035: แสดง body ถูกต้อง
- [x] TC-036: แสดงปุ่ม 'ตกลง'

#### Icon / Type
- [x] TC-037: default type=warning → amber icon
- [x] TC-038: type=success → green icon
- [x] TC-039: type=warning → amber icon

#### Interactions
- [x] TC-040: กดปุ่มตกลง → เรียก `onClose`
- [x] TC-041: คลิก backdrop → เรียก `onClose`

#### Accessibility (a11y)
- [x] TC-042: `role="alertdialog"`
- [x] TC-043: `aria-modal="true"`
- [x] TC-044: `aria-labelledby="alert-title"`
- [x] TC-045: `aria-describedby="alert-body"`

---

### 4. `components/ConfirmModal` — TC-046 ถึง TC-063

#### Visibility
- [x] TC-046: ไม่แสดงเมื่อ `open=false`
- [x] TC-047: แสดงเมื่อ `open=true`

#### Content
- [x] TC-048: แสดง body ถูกต้อง
- [x] TC-049: แสดง title เมื่อมี prop
- [x] TC-050: ไม่แสดง heading เมื่อไม่มี title
- [x] TC-051: ปุ่มยกเลิก default = 'ยกเลิก'
- [x] TC-052: ปุ่มยืนยัน default = 'ยืนยัน'
- [x] TC-053: ใช้ `cancelText` custom ได้
- [x] TC-054: ใช้ `confirmText` custom ได้

#### Interactions
- [x] TC-055: กดยกเลิก → เรียก `onClose`
- [x] TC-056: กดยืนยัน → เรียก `onConfirm`
- [x] TC-057: คลิก backdrop → เรียก `onClose`
- [x] TC-058: กดยืนยัน → ไม่เรียก `onClose`

#### Accessibility (a11y)
- [x] TC-059: `role="alertdialog"`
- [x] TC-060: `aria-modal="true"`
- [x] TC-061: `aria-labelledby="confirm-title"` เมื่อมี title
- [x] TC-062: ไม่มี `aria-labelledby` เมื่อไม่มี title
- [x] TC-063: `aria-describedby="confirm-body"`

---

### 5. `lib/auth-actions` — TC-064 ถึง TC-086

#### `login()`
- [x] TC-064: login สำเร็จ → `redirect('/')` + `revalidatePath`
- [x] TC-065: email ยังไม่ยืนยัน → `redirect('/verify-email')`
- [x] TC-066: credentials ผิด → `redirect('/error?code=auth_invalid_credentials')`
- [x] TC-067: Supabase error อื่นๆ → `redirect('/error?code=auth_signin_error')`

#### `signup()`
- [x] TC-068: signup สำเร็จ → `redirect('/verify-email')`
- [x] TC-069: ไม่มี email → `redirect('/error?code=missing_fields')`
- [x] TC-070: ไม่มี password → `redirect('/error?code=missing_fields')`
- [x] TC-071: เบอร์โทร < 10 หลัก → `redirect('/error?code=invalid_phone')`
- [x] TC-072: email ซ้ำ → `redirect('/error?code=auth_already_registered')`
- [x] TC-073: phone 10 หลัก → ผ่าน validation

#### `updatePassword()`
- [x] TC-074: password < 8 ตัว → `redirect('/error?code=invalid_password')`
- [x] TC-075: password ว่าง → `redirect('/error?code=invalid_password')`
- [x] TC-076: password ไม่ตรงกัน → `redirect('/error?code=password_mismatch')`
- [x] TC-077: password ถูกต้อง → `redirect('/login?reset=success')` + `signOut`
- [x] TC-078: Supabase error → `redirect('/error?code=update_error')`

#### `signout()`
- [x] TC-079: signout สำเร็จ → `redirect('/')`
- [x] TC-080: Supabase error → `redirect('/error?code=auth_signout_error')`

#### `resendVerification()`
- [x] TC-081: ไม่มี email → `redirect('/error?code=missing_email')`
- [x] TC-082: สำเร็จ → `redirect('/verify-email?sent=1')`
- [x] TC-083: Supabase error → `redirect('/error?code=resend_error')`

#### `requestPasswordReset()`
- [x] TC-084: ไม่มี email → `redirect('/error?code=missing_email')`
- [x] TC-085: สำเร็จ → `redirect('/forgot?sent=1')`
- [x] TC-086: Supabase error → `redirect('/error?code=reset_error')`

---

## วิธีรัน Tests

```bash
# ติดตั้ง dependencies ก่อน
npm install

# รัน tests ครั้งเดียว
npm test

# รัน tests แบบ watch mode (auto-rerun เมื่อแก้ไขไฟล์)
npm run test:watch

# รัน tests พร้อม coverage report
npm run test:coverage
```

---

## Coverage Target

| Module | Line | Branch | Function |
|--------|------|--------|----------|
| `utils/toPublicUrl.ts` | 100% | 100% | 100% |
| `utils/imageCompression.ts` (pure functions) | 100% | 100% | 100% |
| `components/AlertModal.tsx` | ≥ 90% | ≥ 85% | 100% |
| `components/ConfirmModal.tsx` | ≥ 90% | ≥ 85% | 100% |
| `lib/auth-actions.ts` | ≥ 85% | ≥ 80% | ≥ 90% |

---

## TODO (ขั้นต่อไป)

- [ ] เพิ่ม tests สำหรับ `TarotCarousel.tsx` (complex carousel logic)
- [ ] เพิ่ม tests สำหรับ `FreeDecksSection.tsx` (favorites management)
- [ ] เพิ่ม integration tests สำหรับ API route `/api/checkout`
- [ ] เพิ่ม integration tests สำหรับ API route `/api/stripe/webhook`
- [ ] เพิ่ม E2E tests ด้วย Playwright สำหรับ user flows หลัก
- [ ] ตั้งค่า CI/CD pipeline รัน tests อัตโนมัติ (GitHub Actions)
