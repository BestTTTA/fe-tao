"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import TransparentHeader from "@/components/TransparentHeader";

export default function ContactPage() {
  const supabase = createClient();
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const { data, error } = await supabase
          .from("configs")
          .select("html_content")
          .eq("key", "contact_us")
          .single();

        if (error) throw error;
        setHtmlContent(data?.html_content ?? null);
      } catch (err) {
        console.error("Error fetching contact:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [supabase]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/bg-stars.jpg')" }}
    >
      <TransparentHeader
        title="ติดต่อเรา"
        subtitle=""
        routeRules={{
          "/menu/contact": {
            showBack: true,
            showLogo: false,
            showMenu: false,
            showSearch: false,
            backPath: "/menu",
          },
        }}
      />

      <div className="w-full max-w-md p-4 mt-20">
        <div className="bg-white/90 text-black rounded-xl p-5 shadow-lg">
          {loading ? (
            <p className="text-center text-slate-500">กำลังโหลด...</p>
          ) : htmlContent ? (
            <div
              className="prose prose-sm max-w-none"
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
