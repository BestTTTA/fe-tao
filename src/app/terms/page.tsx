"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function TermsAcceptPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const { data, error } = await supabase
          .from("configs")
          .select("html_content")
          .eq("key", "terms_of_service")
          .single();

        if (error) throw error;
        setHtmlContent(data?.html_content ?? null);
      } catch (err) {
        console.error("Error fetching terms:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchTerms();
  }, [supabase]);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ accepted_terms: true })
        .eq("id", user.id);

      if (error) throw error;

      router.replace("/");
    } catch (err) {
      console.error("Error accepting terms:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen">
      <div className="mx-auto max-w-md px-4 pt-12 pb-32">
        <h1 className="text-2xl font-extrabold text-white mb-4">ข้อตกลงและเงื่อนไขการใช้งาน</h1>

        <div className="bg-white/90 text-black rounded-xl p-5 shadow-lg max-h-[60vh] overflow-y-auto">
          {fetching ? (
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

      {/* Fixed bottom accept button */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
        <div className="pointer-events-auto mx-auto max-w-md w-full">
          <div className="relative rounded-t-3xl border-t border-slate-200 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.25)]">
            <div className="px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)_+_16px)]">
              <button
                onClick={handleAccept}
                disabled={loading || fetching}
                className="inline-flex w-full items-center justify-center rounded-xl bg-violet-700 px-4 py-3 text-[15px] font-semibold text-white shadow hover:bg-violet-800 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "กำลังดำเนินการ..." : "ยอมรับข้อตกลง"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
