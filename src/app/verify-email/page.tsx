// app/verify-email/page.tsx
import { Suspense } from "react";
import VerifyEmailClient from "@/components/VerifyEmailClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-white">กำลังโหลด...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}
