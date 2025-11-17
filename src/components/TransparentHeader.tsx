"use client";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export type RouteOptions = {
  showLogo: boolean;
  showSearch: boolean;
  showMenu: boolean;
  openMenuOnClick: boolean; // for compatibility
  showBack?: boolean;
  backPath?: string;
  title?: string;
  subtitle?: string;
  onLeftClick?: () => void;
  onRightClick?: () => void;

  /** NEW: กำหนดการทำงานของปุ่มขวา */
  rightAction?: "menu" | "share" | "dots-menu";
};

export default function TransparentHeader({
  title = "TAROT",
  subtitle = "& ORACLE",
  logoSrc,
  onLeftClick,
  onRightClick,
  className = "",
  routeRules = {},
}: {
  title?: string;
  subtitle?: string;
  logoSrc?: string;
  logoClassName?: string;
  onLeftClick?: () => void;
  onRightClick?: () => void;
  className?: string;
  routeRules?: Record<string, Partial<RouteOptions>>;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";

  // ค่าเริ่มต้นต่อเส้นทาง
  const defaults: Record<string, Partial<RouteOptions>> = {
    "/": { showLogo: !!logoSrc, showSearch: true, showMenu: true, openMenuOnClick: true, rightAction: "menu" },
    "/login": { showLogo: false, showSearch: false, showMenu: false, showBack: true, rightAction: "menu" },
    "/search": { showSearch: false, showMenu: true, rightAction: "menu" },
    // หน้าแพ็กเกจ -> ปุ่มขวาเป็น Share
    "/vip": { showLogo: false, showSearch: false, showMenu: true, showBack: true, rightAction: "share" },
    "/packages": { showLogo: false, showSearch: false, showMenu: true, showBack: true, rightAction: "share" },
  };
  const merged = { ...defaults, ...routeRules };

  function resolveRule(path: string): RouteOptions {
    const prefixKey = Object.keys(merged).find((k) => k.endsWith("/*") && path.startsWith(k.slice(0, -2)));
    const picked = (merged[path] ?? (prefixKey ? merged[prefixKey] : undefined)) ?? {};
    return {
      showLogo: !!logoSrc,
      showSearch: true,
      showMenu: true,
      openMenuOnClick: true,
      title,
      subtitle,
      rightAction: "menu",
      ...picked,
    };
  }
  const r = resolveRule(pathname);

  const handleSearch = () => {
    if (r.onLeftClick) return r.onLeftClick();
    if (onLeftClick) return onLeftClick();
    router.push("/search");
  };

  const handleBack = () => (r.backPath ? router.push(r.backPath) : router.back());

  // ปุ่มขวา: แยก share/menu/dots-menu ตาม rightAction
  const handleRight = async () => {
    if (r.onRightClick) r.onRightClick();
    else if (onRightClick) onRightClick();

    if (r.rightAction === "share") {
      const url = typeof window !== "undefined" ? window.location.href : "";
      const data = {
        title: r.title ?? title,
        text: "สมัคร VIP — TAROT & ORACLE",
        url,
      };
      try {
        if (navigator.share) {
          await navigator.share(data);
        } else if (navigator.clipboard && url) {
          await navigator.clipboard.writeText(url);
          alert("คัดลอกลิงก์แล้ว");
        } else {
          alert(url || "ไม่พบ URL สำหรับแชร์");
        }
      } catch {
        // เงียบ ๆ ถ้าผู้ใช้ยกเลิก
      }
      return;
    }

    if (r.rightAction === "dots-menu") {
      // ถ้าเป็น dots-menu ให้เรียก callback เท่านั้น ไม่ต้องทำอะไร
      return;
    }

    // โหมด menu (ดีฟอลต์)
    router.push("/menu");
  };

  return (
    <header className={`pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-center px-4 pt-4 ${className}`}>
      <div className="pointer-events-auto relative flex w-full max-w-[390px] items-center justify-between">

        {/* Left: Back or Search */}
        {r.showBack ? (
          <button
            aria-label="Back"
            onClick={handleBack}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-700 shadow-md ring-1 ring-black/5 backdrop-blur hover:bg-white"
          >
            <Image src="/icons-general/name=arrow-left.svg" alt="Back" width={20} height={20} />
          </button>
        ) : r.showSearch ? (
          <button
            aria-label="Search"
            onClick={handleSearch}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-700 shadow-md ring-1 ring-black/5 backdrop-blur hover:bg-white"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-3.8-3.8" />
            </svg>
          </button>
        ) : (
          <div className="h-10 w-10" />
        )}

        {/* Center: Logo or Title */}
        <button onClick={() => router.push("/")} aria-label="Home" className="select-none text-center tracking-wide">
          {r.showLogo && logoSrc ? (
            <Image src={logoSrc} alt="Logo" width={20} height={20} />
          ) : (
            <>
              <div className="text-[28px] font-normal leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">{r.title}</div>
              {r.subtitle && (
                <div className="-mt-0.5 text-sm font-semibold uppercase tracking-[0.2em] text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
                  {r.subtitle}
                </div>
              )}
            </>
          )}
        </button>

        {/* Right: Menu or Share (ตาม route) */}
        {r.showMenu ? (
          <button
            aria-label={r.rightAction === "share" ? "Share" : r.rightAction === "dots-menu" ? "Options" : "Menu"}
            onClick={handleRight}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-700 shadow-md ring-1 ring-black/5 backdrop-blur hover:bg-white"
          >
            <div className="relative">
              {r.rightAction === "share" ? (
                // Share icon
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <path d="M8.6 13.5 15.4 17.5M15.4 6.5 8.6 10.5" />
                </svg>
              ) : r.rightAction === "dots-menu" ? (
                // Vertical dots icon (จุดไข่ปลาสามจุดแนวตั้ง)
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              ) : (
                // Menu icon (hamburger)
                <>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 7h16M4 12h16M4 17h16" />
                  </svg>

                </>
              )}
            </div>
          </button>
        ) : (
          <div className="h-10 w-10" />
        )}

      </div>
    </header>
  );
}
