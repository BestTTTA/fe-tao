"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export type FooterProps = {
  active?: "home" | "cards" | "account";
  homePath?: string;
  cardsPath?: string;
  accountPath?: string;
  onHome?: () => void;
  onCards?: () => void;
  onAccount?: () => void;
  labels?: { home?: string; cards?: string; account?: string };
  className?: string;
};

export default function BottomTabFooter({
  active = "home",
  homePath,
  cardsPath,
  accountPath,
  onHome,
  onCards,
  onAccount,
  className = "",
  labels = { home: "หน้าแรก", cards: "เปิดไพ่", account: "บัญชี" },
}: FooterProps) {
  const router = useRouter();

  const goHome = () => {
    if (homePath) return router.push(homePath);
    if (onHome) return onHome();
  };
  const goCards = () => {
    if (cardsPath) return router.push(cardsPath);
    if (onCards) return onCards();
  };
  const goAccount = () => {
    if (accountPath) return router.push("/menu");
    if (onAccount) return onAccount();
  };

  return (
    <div className={`pointer-events-none fixed inset-x-0 bottom-0 z-50 ${className}`}>
      {/* container to center content */}
      <div className="pointer-events-auto mx-auto w-full">
        {/* bar */}
        <div className="relative rounded-t-3xl bg-white w-full">
          {/* extra top padding creates room for the FAB overlap */}
          <div className="p-4 w-full">
            <div className="flex items-end justify-around text-center text-[12px]">
              {/* Home */}
              <button
                onClick={goHome}
                className="flex flex-col items-center gap-1"
              >
                <HomeIcon active={active === "home"} />
                <span className={`font-medium ${active === "home" ? "text-slate-900" : ""}`}>{labels.home}</span>
              </button>

              <div className="w-16" />

              {/* Account */}
              <button
                onClick={goAccount}
                className="flex flex-col items-center gap-1 text-slate-700 hover:text-slate-900"
              >
                <UserIcon active={active === "account"} />
                <span className={`font-medium ${active === "account" ? "text-slate-900" : ""}`}>{labels.account}</span>
              </button>
            </div>
          </div>

          {/* Center FAB */}
          <div className="absolute left-1/2 top-4 -translate-x-1/2 -translate-y-1/2 z-50">
            <button
              onClick={goCards}
              aria-label="เปิดไพ่"    
              className="relative flex h-25 w-25 flex-col items-center justify-center rounded-full ring-16 ring-white bg-[url('/bg/bg.jpg')] bg-cover bg-no-repeat bg-center"
            >
              <CardsIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
    }

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <Image src="/icons-general/name=home.png" alt="" height={24} width={24} />
  );
}

function UserIcon({ active }: { active?: boolean }) {
  return (
    <Image src="/icons-general/name=user.png" alt="" height={24} width={24} />
  );
}

function CardsIcon() {
  return (
    <Image src="/button/card.svg" alt="" height={55} width={55} />
  );
}
