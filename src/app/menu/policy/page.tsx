"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import TransparentHeader from "@/components/TransparentHeader";

export default function PolicyPage() {
  const supabase = createClient();
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const { data, error } = await supabase
          .from("configs")
          .select("html_content")
          .eq("key", "privacy_policy")
          .single();

        if (error) throw error;
        setHtmlContent(data?.html_content ?? null);
      } catch (err) {
        console.error("Error fetching policy:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [supabase]);

  return (
    <div className="relative min-h-screen">
      <TransparentHeader
        title="นโยบายความเป็นส่วนตัว"
        subtitle=""
        routeRules={{
          "/menu/policy": {
            showBack: true,
            showLogo: false,
            showMenu: false,
            showSearch: false,
            backPath: "/menu",
          },
        }}
      />

      <div className="w-full max-w-md mx-auto px-4 pb-4 pt-28">
        <div className="bg-white/90 text-black rounded-xl p-5 shadow-lg">
          {loading ? (
            <p className="text-center text-slate-500">กำลังโหลด...</p>
          ) : htmlContent ? (
            <div
              className="html-content"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <p className="text-center text-slate-500">ไม่พบข้อมูล</p>
          )}
        </div>
      </div>
    </div>
  );
}
