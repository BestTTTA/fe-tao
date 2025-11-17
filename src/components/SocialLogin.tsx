'use client';

import { signInWithGoogle } from '@/lib/auth-actions';
import Image from 'next/image';



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
  <Image src="/icons/facebook.png" alt="Facebook" width={40} height={40} />
  );
}
function LineIcon() {
  return (
  <Image src="/icons/line.png" alt="LINE" width={40} height={40} />
  );
}
function GoogleIcon() {
  return (
  <Image src="/icons/gmail.png" alt="Google" width={40} height={40} />
  );
}
function AppleIcon() {
  return (
  <Image src="/icons/apple.png" alt="Apple" width={40} height={40} />
  );
}
