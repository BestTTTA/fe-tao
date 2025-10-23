// app/search/page.tsx
import { Suspense } from "react";
import SearchClient from "@/components/SearchClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-white">กำลังโหลด...</div>}>
      <SearchClient />
    </Suspense>
  );
}

