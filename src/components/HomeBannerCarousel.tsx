"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import TarotCarousel from "./TarotCarousel";

type BannerConfig = {
  key: string;
  value: string | null;
};

export default function HomeBannerCarousel() {
  const supabase = createClient();
  const [banners, setBanners] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from("configs")
          .select("key, value")
          .in("key", ["banner_1", "banner_2", "banner_3", "banner_4"])
          .order("key", { ascending: true });

        if (error) throw error;

        // Filter out null values and extract URLs
        const bannerUrls = (data as BannerConfig[])
          .filter((item) => item.value)
          .map((item) => item.value as string);

        setBanners(bannerUrls);
      } catch (err) {
        console.error("Error fetching banners:", err);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [supabase]);

  if (loading) {
    return (
      <div className="relative mx-auto w-full">
        <div className="h-[220px] animate-pulse rounded-2xl bg-slate-200/40" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <TarotCarousel
      images={banners}
      links={banners.map(() => "/packages")}
      enableLink={true}
      autoPlay={true}
      interval={4000}
    />
  );
}
