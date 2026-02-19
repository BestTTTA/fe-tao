import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockResend = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockUpdateUser = vi.fn();
const mockSignOut = vi.fn();
const mockRevalidatePath = vi.fn();

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signUp: mockSignUp,
        resend: mockResend,
        resetPasswordForEmail: mockResetPasswordForEmail,
        updateUser: mockUpdateUser,
        signOut: mockSignOut,
      },
    })
  ),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// ── Helper ───────────────────────────────────────────────────────────────────
function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

/** เอา URL จาก NEXT_REDIRECT error */
function extractRedirectUrl(err: unknown): string {
  if (err instanceof Error && err.message.startsWith("NEXT_REDIRECT:")) {
    return err.message.replace("NEXT_REDIRECT:", "");
  }
  throw err;
}

// ────────────────────────────────────────────────────────────────────────────
// login
// ────────────────────────────────────────────────────────────────────────────
describe("login()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
  });

  it("TC-064: login สำเร็จ → redirect ไป /", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    const { login } = await import("@/lib/auth-actions");

    await expect(
      login(makeFormData({ email: "user@test.com", password: "Pass1234!" }))
    ).rejects.toSatisfy(
      (e: unknown) => extractRedirectUrl(e) === "/"
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("TC-065: email ยังไม่ยืนยัน → redirect ไป /verify-email", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Email not confirmed" },
    });
    const { login } = await import("@/lib/auth-actions");

    await expect(
      login(makeFormData({ email: "u@t.com", password: "pass" }))
    ).rejects.toSatisfy(
      (e: unknown) => extractRedirectUrl(e) === "/verify-email"
    );
  });

  it("TC-066: credentials ผิด → redirect ไป /error?code=auth_invalid_credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    const { login } = await import("@/lib/auth-actions");

    await expect(
      login(makeFormData({ email: "u@t.com", password: "wrong" }))
    ).rejects.toSatisfy((e: unknown) => {
      const url = extractRedirectUrl(e);
      return url.includes("code=auth_invalid_credentials");
    });
  });

  it("TC-067: Supabase error อื่นๆ → redirect ไป /error?code=auth_signin_error", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Service unavailable" },
    });
    const { login } = await import("@/lib/auth-actions");

    await expect(
      login(makeFormData({ email: "u@t.com", password: "pass" }))
    ).rejects.toSatisfy((e: unknown) => {
      const url = extractRedirectUrl(e);
      return url.includes("code=auth_signin_error");
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// signup
// ────────────────────────────────────────────────────────────────────────────
describe("signup()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
  });

  it("TC-068: signup สำเร็จ → redirect ไป /verify-email", async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const { signup } = await import("@/lib/auth-actions");

    await expect(
      signup(
        makeFormData({
          email: "new@test.com",
          password: "Pass1234!",
          "first-name": "สมชาย",
          "last-name": "ใจดี",
        })
      )
    ).rejects.toSatisfy(
      (e: unknown) => extractRedirectUrl(e) === "/verify-email"
    );
  });

  it("TC-069: ไม่มี email → redirect /error?code=missing_fields", async () => {
    const { signup } = await import("@/lib/auth-actions");

    await expect(
      signup(makeFormData({ email: "", password: "Pass1234!" }))
    ).rejects.toSatisfy((e: unknown) => {
      const url = extractRedirectUrl(e);
      return url.includes("code=missing_fields");
    });
  });

  it("TC-070: ไม่มี password → redirect /error?code=missing_fields", async () => {
    const { signup } = await import("@/lib/auth-actions");

    await expect(
      signup(makeFormData({ email: "u@t.com", password: "" }))
    ).rejects.toSatisfy((e: unknown) => {
      const url = extractRedirectUrl(e);
      return url.includes("code=missing_fields");
    });
  });

  it("TC-071: เบอร์โทรไม่ครบ 10 หลัก → redirect /error?code=invalid_phone", async () => {
    const { signup } = await import("@/lib/auth-actions");

    await expect(
      signup(
        makeFormData({
          email: "u@t.com",
          password: "Pass1234!",
          phone: "0812345", // ไม่ครบ 10 หลัก
        })
      )
    ).rejects.toSatisfy((e: unknown) => {
      const url = extractRedirectUrl(e);
      return url.includes("code=invalid_phone");
    });
  });

  it("TC-072: email ซ้ำ → redirect /error?code=auth_already_registered", async () => {
    mockSignUp.mockResolvedValue({
      error: { message: "User already registered" },
    });
    const { signup } = await import("@/lib/auth-actions");

    await expect(
      signup(
        makeFormData({ email: "existing@test.com", password: "Pass1234!" })
      )
    ).rejects.toSatisfy((e: unknown) => {
      const url = extractRedirectUrl(e);
      return url.includes("code=auth_already_registered");
    });
  });

  it("TC-073: phone 10 หลักถูกต้อง ผ่านการ validate", async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const { signup } = await import("@/lib/auth-actions");

    await expect(
      signup(
        makeFormData({
          email: "u@t.com",
          password: "Pass1234!",
          phone: "0812345678",
        })
      )
    ).rejects.toSatisfy(
      (e: unknown) => extractRedirectUrl(e) === "/verify-email"
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// updatePassword
// ────────────────────────────────────────────────────────────────────────────
describe("updatePassword()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC-074: password สั้นกว่า 8 ตัว → redirect /error?code=invalid_password", async () => {
    const { updatePassword } = await import("@/lib/auth-actions");

    await expect(
      updatePassword(makeFormData({ password: "1234567", confirm: "1234567" }))
    ).rejects.toSatisfy((e: unknown) => {
      const url = extractRedirectUrl(e);
      return url.includes("code=invalid_password");
    });
  });

  it("TC-075: password ว่าง → redirect /error?code=invalid_password", async () => {
    const { updatePassword } = await import("@/lib/auth-actions");

    await expect(
      updatePassword(makeFormData({ password: "", confirm: "" }))
    ).rejects.toSatisfy((e: unknown) => {
      const url = extractRedirectUrl(e);
      return url.includes("code=invalid_password");
    });
  });

  it("TC-076: password ไม่ตรงกัน → redirect /error?code=password_mismatch", async () => {
    const { updatePassword } = await import("@/lib/auth-actions");

    await expect(
      updatePassword(
        makeFormData({ password: "NewPass123!", confirm: "DiffPass456!" })
      )
    ).rejects.toSatisfy((e: unknown) => {
      const url = extractRedirectUrl(e);
      return url.includes("code=password_mismatch");
    });
  });

  it("TC-077: password ถูกต้องและตรงกัน → redirect /login?reset=success", async () => {
    mockUpdateUser.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });
    const { updatePassword } = await import("@/lib/auth-actions");

    await expect(
      updatePassword(
        makeFormData({ password: "NewPass123!", confirm: "NewPass123!" })
      )
    ).rejects.toSatisfy(
      (e: unknown) => extractRedirectUrl(e) === "/login?reset=success"
    );
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: "NewPass123!" });
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("TC-078: Supabase error update → redirect /error?code=update_error", async () => {
    mockUpdateUser.mockResolvedValue({
      error: { message: "Token expired" },
    });
    const { updatePassword } = await import("@/lib/auth-actions");

    await expect(
      updatePassword(
        makeFormData({ password: "NewPass123!", confirm: "NewPass123!" })
      )
    ).rejects.toSatisfy((e: unknown) => {
      const url = extractRedirectUrl(e);
      return url.includes("code=update_error");
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// signout
// ────────────────────────────────────────────────────────────────────────────
describe("signout()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("TC-079: signout สำเร็จ → redirect ไป /", async () => {
    mockSignOut.mockResolvedValue({ error: null });
    const { signout } = await import("@/lib/auth-actions");

    await expect(signout()).rejects.toSatisfy(
      (e: unknown) => extractRedirectUrl(e) === "/"
    );
  });

  it("TC-080: Supabase signout error → redirect /error?code=auth_signout_error", async () => {
    mockSignOut.mockResolvedValue({ error: { message: "Session not found" } });
    const { signout } = await import("@/lib/auth-actions");

    await expect(signout()).rejects.toSatisfy((e: unknown) => {
      const url = extractRedirectUrl(e);
      return url.includes("code=auth_signout_error");
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// resendVerification
// ────────────────────────────────────────────────────────────────────────────
describe("resendVerification()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
  });

  it("TC-081: ไม่มี email → redirect /error?code=missing_email", async () => {
    const { resendVerification } = await import("@/lib/auth-actions");

    await expect(
      resendVerification(makeFormData({ email: "" }))
    ).rejects.toSatisfy((e: unknown) => {
      const url = extractRedirectUrl(e);
      return url.includes("code=missing_email");
    });
  });

  it("TC-082: ส่ง email สำเร็จ → redirect /verify-email?sent=1", async () => {
    mockResend.mockResolvedValue({ error: null });
    const { resendVerification } = await import("@/lib/auth-actions");

    await expect(
      resendVerification(makeFormData({ email: "u@test.com" }))
    ).rejects.toSatisfy(
      (e: unknown) => extractRedirectUrl(e) === "/verify-email?sent=1"
    );
  });

  it("TC-083: Supabase error → redirect /error?code=resend_error", async () => {
    mockResend.mockResolvedValue({
      error: { message: "Rate limit exceeded" },
    });
    const { resendVerification } = await import("@/lib/auth-actions");

    await expect(
      resendVerification(makeFormData({ email: "u@test.com" }))
    ).rejects.toSatisfy((e: unknown) => {
      const url = extractRedirectUrl(e);
      return url.includes("code=resend_error");
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// requestPasswordReset
// ────────────────────────────────────────────────────────────────────────────
describe("requestPasswordReset()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
  });

  it("TC-084: ไม่มี email → redirect /error?code=missing_email", async () => {
    const { requestPasswordReset } = await import("@/lib/auth-actions");

    await expect(
      requestPasswordReset(makeFormData({ email: "" }))
    ).rejects.toSatisfy((e: unknown) => {
      const url = extractRedirectUrl(e);
      return url.includes("code=missing_email");
    });
  });

  it("TC-085: ส่ง reset email สำเร็จ → redirect /forgot?sent=1", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    const { requestPasswordReset } = await import("@/lib/auth-actions");

    await expect(
      requestPasswordReset(makeFormData({ email: "u@test.com" }))
    ).rejects.toSatisfy(
      (e: unknown) => extractRedirectUrl(e) === "/forgot?sent=1"
    );
  });

  it("TC-086: Supabase error → redirect /error?code=reset_error", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: "User not found" },
    });
    const { requestPasswordReset } = await import("@/lib/auth-actions");

    await expect(
      requestPasswordReset(makeFormData({ email: "u@test.com" }))
    ).rejects.toSatisfy((e: unknown) => {
      const url = extractRedirectUrl(e);
      return url.includes("code=reset_error");
    });
  });
});
