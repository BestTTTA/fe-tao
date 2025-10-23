"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import TransparentHeader from "@/components/TransparentHeader";
import { signout } from "@/lib/auth-actions";
import Image from "next/image";
import LanguageModal from "@/components/LanguageModal";
import { useState } from "react";

export default function MenuPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("ไทย");
  const [openLang, setOpenLang] = useState(false);

  return (
    <main className="relative min-h-screen">
      <TransparentHeader
        title="TAROT"
        subtitle="& ORACLE"
        routeRules={{
          "/menu": {
            showLogo: false,
            showSearch: false,
            showMenu: false,
            showBack: true,
            backPath: "/",
          },
        }}
      />

      <section
        className="relative h-[210px] w-full overflow-hidden"
        style={{
          backgroundImage: "url('/hero-stars.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative -mt-16 mx-auto max-w-md px-4 pb-[120px] space-y-5">
        {/* การใช้งานทั่วไป */}
        <SectionLabel>การใช้งานทั่วไป</SectionLabel>
        <Card>
          <MenuItem
            icon={<UserIcon />}
            title="ข้อมูลส่วนตัว"
            onClick={() => router.push("/menu/profile")}
          />
          <Divider />
          <MenuItem
            icon={<LangIcon />}
            title="ภาษาของระบบ"
            value={language}
            onClick={() => setOpenLang(true)} // 👈 เปิด modal
          />
          <Divider />
          <MenuItem
            icon={<LockIcon />}
            title="รหัสผ่าน"
            value="แก้ไข"
            onClick={() => router.push("/settings/password")}
          />
        </Card>

        {/* เกี่ยวกับ Tarot & Oracle */}
        <SectionLabel>เกี่ยวกับ Tarot & Oracle</SectionLabel>
        <Card>
          <MenuItem
            icon={<InfoIcon />}
            title="เกี่ยวกับเรา"
            onClick={() => router.push("/menu/about")}
          />
          <Divider />
          <MenuItem
            icon={<DocIcon />}
            title="ข้อตกลงในการใช้งาน"
            onClick={() => router.push("/menu/tnc")}
          />
          <Divider />
          <MenuItem
            icon={<ShieldIcon />}
            title="นโยบายความเป็นส่วนตัว"
            onClick={() => router.push("/menu/policy")}
          />
          <Divider />
          <MenuItem
            icon={<MailIcon />}
            title="ติดต่อเรา"
            onClick={() => router.push("/menu/contact")}
          />
        </Card>
      </div>

      {/* Logout */}
      <div className="flex justify-center pb-12">
        <button
          type="button"
          onClick={signout}
          className="mb-2 text-white flex items-center gap-2 underline"
        >
          <Image
            src="/icons-general/name=sign-out.svg"
            alt="Logo"
            width={24}
            height={24}
          />
          ออกจากระบบ
        </button>
      </div>

      {/* Language Modal */}
      <LanguageModal
        open={openLang}
        selected={language}
        onSelect={(lang) => setLanguage(lang)}
        onClose={() => setOpenLang(false)}
      />
    </main>
  );
}


/* ---------- UI Partials ---------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 text-[13px] font-semibold text-white/90">{children}</p>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/95 shadow-lg ring-1 ring-black/5 backdrop-blur">
      {children}
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-slate-200" />;
}

function MenuItem({
  icon,
  title,
  value,
  onClick,
  href,
}: {
  icon?: React.ReactNode;
  title: string;
  value?: string;
  onClick?: () => void;
  href?: string;
}) {
  const Content = (
    <div className="flex w-full items-center gap-3 px-4 py-3 text-slate-900 hover:bg-slate-50">
      {icon && (
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <div className="text-[15px] font-semibold">{title}</div>
      </div>
      {value && <span className="mr-2 text-sm text-slate-500">{value}</span>}
      <ChevronRight />
    </div>
  );

  if (href) return <Link href={href}>{Content}</Link>;
  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      {Content}
    </button>
  );
}

/* ---------- Icons (inline SVG) ---------- */
function ChevronRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function LangIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6" />
      <path d="M12 2v7h7" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 4h16v16H4z" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}
