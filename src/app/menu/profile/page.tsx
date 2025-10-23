"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import TransparentHeader from "@/components/TransparentHeader";

type UserProfile = {
  id: string;
  plan_type: string;
  stripe_customer_id?: string;
  full_name: string;
  nickname?: string;
  phone?: string;
  email: string;
  address?: string;
  avatar_url?: string;
};

export default function AccountProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setUser(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, supabase]);

  // ✅ ฟังก์ชันอัปโหลด avatar
  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const filePath = `user-profile/${user.id}.${fileExt}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("tao-card")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const publicUrl = `${baseUrl}/storage/v1/object/public/tao-card/${filePath}`;

      // 3. Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // 4. Update UI
      setUser({ ...user, avatar_url: publicUrl });
      alert("อัปโหลดรูปสำเร็จ!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูป");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-white">
        กำลังโหลดข้อมูล...
      </div>
    );

  if (!user)
    return (
      <div className="flex h-screen items-center justify-center text-white">
        ไม่พบข้อมูลผู้ใช้
      </div>
    );

  return (
    <main className="relative min-h-screen">
      {/* Header */}
      <TransparentHeader
        title="TAROT"
        subtitle="& ORACLE"
        routeRules={{
          "/menu/profile": {
            showLogo: false,
            showSearch: false,
            showMenu: false,
            showBack: true,
            backPath: "/menu",
          },
        }}
      />

      {/* พื้นหลัง hero */}
      <section
        className="relative h-[210px] w-full overflow-hidden"
        style={{
          backgroundImage: "url('/hero-stars.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* เนื้อหา */}
      <div className="relative -mt-16 mx-auto max-w-md px-4 pb-24 text-white">
        <h1 className="mb-3 text-2xl font-extrabold">ข้อมูลส่วนตัว</h1>

        <div className="overflow-hidden rounded-3xl bg-white/95 p-5 text-slate-900 shadow-lg ring-1 ring-black/5 backdrop-blur">
          {/* Avatar */}
          <div className="mb-4 flex flex-col items-center">
            <div className="relative">
              <img
                src={user.avatar_url ?? "/images/avatar-placeholder.jpg"}
                alt="avatar"
                className="h-24 w-24 rounded-full object-cover border border-slate-200"
              />
              <label
                htmlFor="avatarUpload"
                className="absolute bottom-0 right-0 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-violet-700 text-white shadow ring-2 ring-white hover:bg-violet-800"
                title="เปลี่ยนรูปโปรไฟล์"
              >
                <PenIcon />
                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadAvatar}
                  disabled={uploading}
                />
              </label>
            </div>
            {uploading && (
              <p className="mt-2 text-sm text-slate-600">กำลังอัปโหลด...</p>
            )}
          </div>

          {/* แพ็กเกจ */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">แพ็กเกจของคุณ</div>
                <div className="text-lg font-semibold text-slate-900">
                  {user.plan_type || "Freemium"}
                </div>
              </div>
          
              {user.plan_type !== "VIP" && (
                <button
                  type="button"
                  onClick={() => router.push("/packages")}
                  className="rounded-md bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900 hover:bg-amber-300"
                >
                  สมัคร VIP
                </button>
              )}
            </div>
          </div>


          <Divider />

          {/* รายละเอียด */}
          <Field label="รหัสลูกค้า (Stripe)" value={user.stripe_customer_id ?? "-"} />
          <Field label="ชื่อ-นามสกุล" value={user.full_name ?? "-"} />
          <Field label="ชื่อเล่น" value={user.nickname ?? "-"} />
          <Field label="เบอร์โทรศัพท์" value={user.phone ?? "-"} />
          <Field label="อีเมล" value={user.email ?? "-"} isEmail />
          <Field label="ที่อยู่" value={user.address ?? "-"} multiline />

          {/* ปุ่มแก้ไข */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => router.push("/menu/profile/edit")}
              className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-violet-800"
            >
              แก้ไขข้อมูล
            </button>
          </div>
        </div>
      </div>

      {/* home indicator */}
      <div className="pointer-events-none fixed inset-x-0 bottom-2 z-10">
        <div className="mx-auto h-1 w-24 rounded-full bg-white/85" />
      </div>
    </main>
  );
}

/* ---------- UI Partials ---------- */

function Divider() {
  return <div className="my-2 h-px w-full bg-slate-200" />;
}

function Field({
  label,
  value,
  isEmail,
  multiline,
}: {
  label: string;
  value: string;
  isEmail?: boolean;
  multiline?: boolean;
}) {
  return (
    <div className="py-2">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      {multiline ? (
        <div className="whitespace-pre-wrap text-[15px] font-semibold text-slate-900">
          {value}
        </div>
      ) : isEmail ? (
        <a
          href={`mailto:${value}`}
          className="text-[15px] font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-500"
        >
          {value}
        </a>
      ) : (
        <div className="text-[15px] font-semibold text-slate-900">{value}</div>
      )}
      <div className="mt-2 h-px w-full bg-slate-200" />
    </div>
  );
}

function PenIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
    </svg>
  );
}
