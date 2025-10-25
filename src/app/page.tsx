// app/page.tsx
import TarotPromoModal from "@/components/TarotPromoModal";
import TransparentHeader from "@/components/TransparentHeader";
import TarotCarousel from "@/components/TarotCarousel";
import BottomTabFooter from "@/components/BottomTabFooter";
import HoroscopeCategoryGrid from "@/components/HoroscopeCategoryGrid";
import FreeDecksSection from "@/components/FreeDecksSection"; // ← เพิ่ม

export default function Home() { 
  return (
    <div className="relative min-h-screen text-white">
      {/* Modal โปรโมชัน */}
      <TarotPromoModal />

      {/* HERO + Header โปร่ง */}
      <section
        className="relative h-[100px] w-full overflow-hidden"
      >
        <div className="absolute inset-0 " />
        <TransparentHeader title="TAROT" subtitle="& ORACLE" />
      </section>

      {/* โซนคอนเทนต์ด้านบน (พื้นหลังสีเดิม) */}
      <div className="mx-auto max-w-2xl space-y-8 px-4 pt-6">
        {/* Carousel */}
        <div className="flex justify-center">
          <TarotCarousel
            images={["/banner/banner.png"]}
            links={["/packages"]}
            enableLink={true}
          />

        </div>

        {/* ✅ Deck ฟรีเฉพาะสมาชิก */}
        <FreeDecksSection className="mt-2" />
      </div>

      {/* ==== จากตรงนี้ลงไป ใส่พื้นหลังดำไล่ลงมา ==== */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a] to-black"
        />

        <div className="relative mx-auto space-y-8 px-4 py-6 text-white pb-[120px]">
          {/* หมวดหมู่ดูดวง */}
          <HoroscopeCategoryGrid
            heading="ดูดวง"
            items={[
              { key: "love", title: "", image: "/categories/love.png", href: "/horoscope/love" },
              { key: "work", title: "", image: "/categories/work.png", href: "/horoscope/work" },
              { key: "travel", title: "", image: "/categories/travel.png", href: "/horoscope/travel" },
              { key: "health", title: "", image: "/categories/health.png", href: "/horoscope/health" },
            ]}
          />

        </div>
      </section>

      <BottomTabFooter
        active="home"
        homePath="/"
        cardsPath="/opencard"
        accountPath="/account"
      />
    </div>
  );
}
