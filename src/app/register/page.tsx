"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import TransparentHeader from "@/components/TransparentHeader";
import { signup } from "../../lib/auth-actions";
import { useFormStatus } from "react-dom";
import SocialLogin from "@/components/SocialLogin";
import { useLoading } from "@/components/LoadingOverlay";
import { useLanguage } from "@/lib/i18n";

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [agreeTos, setAgreeTos] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  return (
    <main className="relative min-h-screen">
      <TransparentHeader
        title="TAROT"
        subtitle="& ORACLE"
        routeRules={{
          "/register": {
            showLogo: false,
            showSearch: false,
            showMenu: false,
            showBack: true,
            backPath: "/",
          },
        }}
      />

      <div className="mx-auto max-w-md px-4 pt-24 pb-[160px] text-white">
        <h1 className="text-2xl font-extrabold">{t.register.title}</h1>

        <form action={signup} className="mt-6 space-y-6">
          <section className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-white/90">
                {t.register.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                placeholder={t.register.emailPlaceholder}
                autoComplete="email"
                required
                className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 shadow focus:outline-none focus:ring-2 focus:ring-violet-500/80 px-3 py-3"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-white/90">
                {t.register.password}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder={t.register.passwordPlaceholder}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  onInput={(e) => {
                    const input = e.currentTarget as HTMLInputElement;
                    const val = input.value;
                    const hasLower = /[a-z]/.test(val);
                    const hasUpper = /[A-Z]/.test(val);
                    const hasDigit = /[0-9]/.test(val);
                    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,./`~]/.test(val);
                    if (!hasLower || !hasUpper || !hasDigit || !hasSpecial) {
                      input.setCustomValidity(t.register.passwordRequirement);
                    } else {
                      input.setCustomValidity("");
                    }
                  }}
                  className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 shadow focus:outline-none focus:ring-2 focus:ring-violet-500/80 px-3 py-3 pr-10"
                />
                <button
                  type="button"
                  aria-label={showPass ? t.login.hidePassword : t.login.showPassword}
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-600 hover:bg-slate-100"
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm" className="mb-1 block text-sm text-white/90">
                {t.register.confirmPassword}
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  name="confirm"
                  type={showPass2 ? "text" : "password"}
                  placeholder={t.register.confirmPasswordPlaceholder}
                  autoComplete="new-password"
                  required
                  onInput={(e) => {
                    const c = e.currentTarget as HTMLInputElement;
                    const p = (document.getElementById("password") as HTMLInputElement)?.value;
                    c.setCustomValidity(c.value && p && c.value !== p ? t.register.passwordMismatch : "");
                    setError(null);
                  }}
                  className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 shadow focus:outline-none focus:ring-2 focus:ring-violet-500/80 px-3 py-3 pr-10"
                />
                <button
                  type="button"
                  aria-label={showPass2 ? t.login.hidePassword : t.login.showPassword}
                  onClick={() => setShowPass2((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-600 hover:bg-slate-100"
                >
                  {showPass2 ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-1">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                id="agreeTos"
                name="agreeTos"
                checked={agreeTos}
                onChange={(e) => setAgreeTos(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/30 text-violet-600 focus:ring-violet-500"
                required
              />
              <span>
                {t.register.agreeTos}{" "}
                <Link href="/terms" className="underline">
                  {t.register.tosLink}
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                id="agreePrivacy"
                name="agreePrivacy"
                checked={agreePrivacy}
                onChange={(e) => setAgreePrivacy(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/30 text-violet-600 focus:ring-violet-500"
              />
              <span>{t.register.agreePrivacy}</span>
            </label>

            {/* Divider + Social */}
            <div className="my-2 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/20" />
              <span className="text-sm text-white/80">{t.common.or}</span>
              <div className="h-px flex-1 bg-white/20" />
            </div>

            <SocialLogin />
          </section>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100">{error}</p>
          )}

          <BottomBar />
        </form>
      </div>
    </main>
  );
}

function BottomBar() {
  const { pending } = useFormStatus();
  const { showLoading, hideLoading } = useLoading();
  const { t } = useLanguage();

  useEffect(() => {
    if (pending) {
      showLoading(t.register.submitting);
    } else {
      hideLoading();
    }
  }, [pending, showLoading, hideLoading, t]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="pointer-events-auto mx-auto w-full max-w-md">
        <div className="relative rounded-t-3xl border-t border-slate-200 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.25)]">
          <div className="px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)_+_16px)]">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center rounded-xl bg-violet-700 px-4 py-3 text-[15px] font-semibold text-white shadow hover:bg-violet-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? t.register.submitting : t.register.submit}
            </button>
            <Link href="/login" className="mt-3 block text-center text-sm font-semibold text-slate-800 hover:underline">
              {t.register.login}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Icons */
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.58 10.58a3 3 0 1 0 4.24 4.24" />
      <path d="M16.88 13.12a10.94 10.94 0 0 0 3.12-1.12s-4-7-10-7a10.94 10.94 0 0 0-3.12 1.12" />
      <path d="M6.1 6.1A10.94 10.94 0 0 0 2 12s4 7 10 7a10.94 10.94 0 0 0 5.9-1.9" />
    </svg>
  );
}
