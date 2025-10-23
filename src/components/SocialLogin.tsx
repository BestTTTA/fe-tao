'use client';

import React from 'react';
import { signInWithGoogle } from '@/lib/auth-actions';



export default function SocialLogin() {
  return (
    <div className="text-center">
      <div className="text-sm text-white/80">เข้าสู่ระบบด้วย Social Network</div>
      <div className="mt-3 flex items-center justify-center gap-4">
        <SocialButton ariaLabel="Login with Facebook" >
          <FbIcon />
        </SocialButton>
        <SocialButton ariaLabel="Login with LINE" >
          <LineIcon />
        </SocialButton>
        <SocialButton ariaLabel="Login with Google" onClick={signInWithGoogle}>
          <GoogleIcon />
        </SocialButton>
        <SocialButton ariaLabel="Login with Apple" >
          <AppleIcon />
        </SocialButton>
      </div>
    </div>
  );
}

function SocialButton({
  children,
  ariaLabel,
  onClick,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-900 shadow ring-1 ring-black/5 hover:brightness-95"
    >
      {children}
    </button>
  );
}

/* ---------- Icons ---------- */
function FbIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="#1877F2">
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.01 3.66 9.16 8.44 9.94v-7.03H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.97h-2.34V22c4.78-.78 8.44-4.93 8.44-9.94Z" />
    </svg>
  );
}
function LineIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="#06C755">
      <path d="M19.5 4h-15C2.57 4 2 4.57 2 5.5v8C2 16.43 2.57 17 3.5 17H7v3.5c0 .46.54.68.85.36L12 17h7.5c.93 0 1.5-.57 1.5-1.5v-8C21 4.57 20.43 4 19.5 4Z" />
      <rect x="6" y="8" width="1.8" height="5" fill="#fff" />
      <rect x="8.6" y="8" width="1.8" height="5" fill="#fff" />
      <rect x="11.2" y="8" width="1.8" height="5" fill="#fff" />
      <rect x="13.8" y="8" width="1.8" height="5" fill="#fff" />
    </svg>
  );
}
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40">
      <path fill="#EA4335" d="M12 10.2v3.9h5.45c-.24 1.25-.98 2.31-2.1 3.02l3.4 2.64C20.46 18.3 21.5 15.9 21.5 13c0-.83-.08-1.64-.24-2.4H12Z" />
      <path fill="#34A853" d="M6.53 14.32A6.01 6.01 0 0 0 6 12c0-.8.15-1.56.43-2.26L3 7.02A10 10 0 0 0 2 12c0 1.67.4 3.24 1.1 4.64l3.43-2.32Z" />
      <path fill="#4A90E2" d="M12 22c2.7 0 4.96-.9 6.61-2.42l-3.4-2.64c-.94.62-2.13.99-3.21.99-2.46 0-4.53-1.66-5.27-3.91l-3.43 2.32C4.94 19.98 8.2 22 12 22Z" />
      <path fill="#FBBC05" d="M18.61 6.42 15.2 9.06C14.45 8 13.29 7.33 12 7.33c-2.12 0-3.9 1.44-4.57 3.41L3 9.74C4.73 6 8.09 4 12 4c2.07 0 3.94.73 5.39 2.42Z" />
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor" className="text-black">
      <path d="M16.36 1.64c-.87.59-1.67 1.59-1.54 2.82 1.15.09 2.33-.58 3.03-1.42.86-.96 1.21-2.2 1.21-2.2s-1.83-.12-2.7.8ZM21 16.36c-.45 1.03-1 2.06-1.76 3.03-.94 1.21-2.1 2.61-3.63 2.61-1.41 0-1.86-.84-3.46-.84s-2.11.82-3.49.84c-1.51.03-2.67-1.31-3.61-2.52C2.2 17.47.97 14.2 2.36 11.5c.96-1.9 2.69-3.11 4.67-3.14 1.47-.03 2.86.92 3.46.92.58 0 2.16-1.13 3.64-1 .62.03 2.37.25 3.48 1.88-2.95 1.6-2.48 5.79.39 7.2Z" />
    </svg>
  );
}
