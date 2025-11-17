"use client";
import Link from "next/link";

export type CategoryItem = {
  key: string;
  title: string; // e.g., "LOVE HOROSCOPE"
  image: string; // background image url
  href?: string; // navigate to page
  onClick?: () => void; // optional click handler
};

export default function HoroscopeCategoryGrid({
  heading = "ดูดวง",
  items = defaultItems,
  className = "",
}: {
  heading?: string;
  items?: CategoryItem[];
  className?: string;
}) {
  return (
    <section className={`mx-auto w-full ${className}`}>
      {/* heading */}
      <h2 className="mb-3 px-2 text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
        {heading}
      </h2>

      {/* grid 2x2 */}
      <div className="grid grid-cols-2 gap-3 px-2">
        {items.map((it) => (
          <CategoryCard key={it.key} item={it} />)
        )}
      </div>
    </section>
  );
}

function CategoryCard({ item }: { item: CategoryItem }) {
  const Inner = (
    <div className="relative h-28 overflow-hidden rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.35)] ring-1 ring-white/10 transition-transform duration-200 hover:-translate-y-0.5">
      {/* bg image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
        loading="lazy"
      />

      {/* overlay pattern + gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/0" />

      {/* text */}
      <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
        <span className="text-[18px] font-extrabold leading-tight tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          {item.title}
        </span>
      </div>

      {/* subtle inner highlight top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-white/10 mix-blend-overlay" />
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
        {Inner}
      </Link>
    );
  }

  return (
    <button onClick={item.onClick} className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
      {Inner}
    </button>
  );
}

const defaultItems: CategoryItem[] = [
  { key: "love", title: "LOVE HOROSCOPE", image: "/horoscope-love.jpg", href: "/horoscope/love" },
  { key: "work", title: "WORK HOROSCOPE", image: "/horoscope-work.jpg", href: "/horoscope/work" },
  { key: "travel", title: "TRAVEL HOROSCOPE", image: "/horoscope-travel.jpg", href: "/horoscope/travel" },
  { key: "health", title: "HEALTH HOROSCOPE", image: "/horoscope-health.jpg", href: "/horoscope/health" },
];


