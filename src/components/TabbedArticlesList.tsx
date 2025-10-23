"use client";
import Link from "next/link";
import { useState } from "react";

export type ArticleItem = {
  id: string | number;
  title: string;
  excerpt: string;
  image: string; // url
  href?: string;
};

export type TabConfig = {
  key: string;
  label: string;
  items: ArticleItem[];
};

export default function TabbedArticlesList({
  tabs = defaultTabs,
  initialTab = tabs[0]?.key,
  className = "",
}: {
  tabs?: TabConfig[];
  initialTab?: string;
  className?: string;
}) {
  const [active, setActive] = useState(initialTab);
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <section className={`mx-auto w-full max-w-md px-3 sm:max-w-lg ${className}`}>
      {/* Tabs */}
      <div className="sticky top-0 z-10 -mx-3 mb-4 bg-transparent/0 px-3 pt-2">
        <div className="flex items-center gap-6 border-b border-white/15 pb-2 text-white/80">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`relative pb-1 text-base font-semibold tracking-wide ${
                active === t.key ? "text-white" : "text-white/60 hover:text-white"
              }`}
            >
              {t.label}
              {active === t.key && (
                <span className="absolute -bottom-[9px] left-0 right-0 mx-auto block h-1 w-12 rounded-full bg-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4 pb-16">
        {activeTab.items.map((it) => (
          <ArticleCard key={it.id} item={it} />
        ))}
      </div>
    </section>
  );
}

function ArticleCard({ item }: { item: ArticleItem }) {
  const Content = (
    <div className="rounded-3xl bg-white/95 p-3 shadow-[0_10px_25px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
      <div className="overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt="" className="h-40 w-full object-cover sm:h-44" />
      </div>
      <div className="pt-3">
        <h3 className="text-[17px] font-bold text-slate-900">{item.title}</h3>
        <p className="mt-1 line-clamp-3 text-[13px] leading-6 text-slate-600">{item.excerpt}</p>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80">
        {Content}
      </Link>
    );
  }
  return Content;
}

const lipsum =
  "โลนิปาสกาลเรค เพรียวบางน้องใหม่นอมินีเห็นด้วยดราม่ดยุ่ย แกควอร์ตัล รัช แครกเกอร์ทส์เดเฮาส์ยีวุ๊ แคร์โชว์ออฟพลัสติคุ เจ๊จะเเจ๊ะดรอวดทานุกูนซื่อ โฟล์ทิกปู๊กกรืน";

const defaultTabs: TabConfig[] = [
  {
    key: "articles",
    label: "บทความ",
    items: [
      { id: 1, title: "Article Name", excerpt: lipsum, image: "/images/tarot-article-1.jpg", href: "/articles/1" },
      { id: 2, title: "Article Name", excerpt: lipsum, image: "/images/tarot-article-2.jpg", href: "/articles/2" },
    ],
  },
  {
    key: "meanings",
    label: "ความหมายไพ่",
    items: [
      { id: 3, title: "Major Arcana 0 — The Fool", excerpt: lipsum, image: "/images/meaning-fool.jpg", href: "/meanings/the-fool" },
      { id: 4, title: "Major Arcana I — The Magician", excerpt: lipsum, image: "/images/meaning-magician.jpg", href: "/meanings/the-magician" },
    ],
  },
  {
    key: "guides",
    label: "คู่มือฟรี",
    items: [
      { id: 5, title: "Tarot 101 — เริ่มต้น", excerpt: lipsum, image: "/images/guide-101.jpg", href: "/guides/101" },
      { id: 6, title: "Spread พื้นฐานที่ควรรู้", excerpt: lipsum, image: "/images/guide-spreads.jpg", href: "/guides/spreads" },
    ],
  },
];

/** Usage
 *
 * <TabbedArticlesList
 *   tabs={[
 *     { key: 'articles', label: 'บทความ', items: articleList },
 *     { key: 'meanings', label: 'ความหมายไพ่', items: meaningsList },
 *     { key: 'guides', label: 'คู่มือฟรี', items: freeGuidesList },
 *   ]}
 * />
 */
