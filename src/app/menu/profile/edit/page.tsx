// app/menu/profile/edit/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import TransparentHeader from "@/components/TransparentHeader";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type FormState = {
  firstName: string;
  lastName: string;
  nickName: string;
  phone: string;
  email: string;
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  postal: string;
  showDisplayName: boolean;  // reserved for future use
  showAvatar: boolean;       // reserved for future use
  socials: Record<SocialKey, { selected: boolean; handle: string }>; // reserved
};

type SocialKey = "facebook" | "instagram" | "tiktok" | "line" | "youtube";

const SOCIAL_LABEL: Record<SocialKey, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "Tiktok",
  line: "Line",
  youtube: "Youtube",
};

export default function EditProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [data, setData] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // โหลดข้อมูลผู้ใช้จาก Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user: sessionUser },
        } = await supabase.auth.getUser();

        if (!sessionUser) {
          router.push("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select(
            "full_name, nick_name, phone, email, address, sub_district, district, province, postal"
          )
          .eq("id", sessionUser.id)
          .single();

        if (error) throw error;

        // แยกชื่อ-นามสกุลอย่างยืดหยุ่น
        const fullName = (profile?.full_name ?? "").trim();
        const [firstName, ...rest] = fullName.split(" ").filter(Boolean);
        const lastName = rest.join(" ");

        setData({
          firstName: firstName ?? "",
          lastName: lastName ?? "",
          nickName: profile?.nick_name ?? "",
          phone: profile?.phone ?? "",
          email: profile?.email ?? "",
          address: profile?.address ?? "",
          subDistrict: profile?.sub_district ?? "",
          district: profile?.district ?? "",
          province: profile?.province ?? "",
          postal: profile?.postal ?? "",
          showDisplayName: true,
          showAvatar: false,
          socials: {
            facebook: { selected: false, handle: "" },
            instagram: { selected: false, handle: "" },
            tiktok: { selected: false, handle: "" },
            line: { selected: false, handle: "" },
            youtube: { selected: false, handle: "" },
          },
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router, supabase]);

  // (สำรองไว้ ถ้าจะจำกัด social สูงสุด 3)
  const selectedCount = useMemo(
    () => Object.values(data?.socials ?? {}).filter((s) => s.selected).length,
    [data?.socials]
  );

  const toggleSocial = (key: SocialKey) => {
    if (!data) return;
    setData((prev) => {
      if (!prev) return prev;
      const s = { ...prev.socials[key] };
      const willSelect = !s.selected;
      if (willSelect && selectedCount >= 3) return prev;
      s.selected = willSelect;
      return { ...prev, socials: { ...prev.socials, [key]: s } };
    });
  };

  const updateSocialHandle = (key: SocialKey, handle: string) => {
    if (!data) return;
    setData((prev) => ({
      ...prev!,
      socials: { ...prev!.socials, [key]: { ...prev!.socials[key], handle } },
    }));
  };

  // บันทึกข้อมูลกลับไปยัง Supabase
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    try {
      setSaving(true);
      const {
        data: { user: sessionUser },
      } = await supabase.auth.getUser();
      if (!sessionUser) throw new Error("ไม่พบผู้ใช้");

      const full_name = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();

      // ทำความสะอาดเบอร์ (เก็บเฉพาะตัวเลข 0-9 และตัดความยาวเกิน 10 ตัว)
      const normalizedPhone = (data.phone || "").replace(/\D/g, "").slice(0, 10);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name,
          nick_name: data.nickName,
          phone: normalizedPhone,
          email: data.email,            // ถ้าไม่อยากให้แก้ email ใน profiles ให้ลบบรรทัดนี้
          address: data.address,
          sub_district: data.subDistrict,
          district: data.district,
          province: data.province,
          postal: data.postal,
        })
        .eq("id", sessionUser.id);

      if (error) throw error;

      alert("บันทึกข้อมูลสำเร็จ!");
      router.push("/menu/profile");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-white">
        กำลังโหลดข้อมูล...
      </div>
    );

  if (!data)
    return (
      <div className="flex h-screen items-center justify-center text-white">
        ไม่พบข้อมูลผู้ใช้
      </div>
    );

  return (
    <main className="relative min-h-screen">
      <TransparentHeader
        title="TAROT"
        subtitle="& ORACLE"
        routeRules={{
          "/menu/profile/edit": {
            showLogo: false,
            showSearch: false,
            showMenu: false,
            showBack: true,
            backPath: "/menu/profile",
          },
        }}
      />

      <section
        className="relative h-[210px] w-full overflow-hidden"
        style={{
          backgroundImage: "url('/hero-stars.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <form
        onSubmit={onSubmit}
        className="relative -mt-10 mx-auto max-w-md px-4 pb-[160px] text-white"
      >
        <h1 className="mb-3 text-2xl font-extrabold">แก้ไขข้อมูลส่วนตัว</h1>

        {/* ชื่อ-นามสกุล */}
        <Field label="ชื่อ">
          <Input value={data.firstName} onChange={(v) => setData({ ...data, firstName: v })} />
        </Field>
        <Field label="นามสกุล">
          <Input value={data.lastName} onChange={(v) => setData({ ...data, lastName: v })} />
        </Field>

        {/* ชื่อเล่น / เบอร์ / อีเมล */}
        <Field label="ชื่อเล่น">
          <Input value={data.nickName} onChange={(v) => setData({ ...data, nickName: v })} />
        </Field>
        <Field label="เบอร์โทรศัพท์">
          <Input value={data.phone} inputMode="tel" onChange={(v) => setData({ ...data, phone: v })} />
        </Field>
        <Field label="อีเมล">
          <Input value={data.email} type="email" onChange={(v) => setData({ ...data, email: v })} />
        </Field>

        {/* ที่อยู่ */}
        <Field label="ที่อยู่ (สำหรับรับของสมนาคุณ)">
          <TextArea
            value={data.address}
            onChange={(v) => setData({ ...data, address: v })}
            rows={4}
            placeholder="เช่น 123/45 ถนนสุขสันต์ แขวงบางรัก เขตบางกอกใหญ่ กรุงเทพมหานคร 10100"
          />
        </Field>


        {/* (ออปชัน) Social Media */}
        {/* ตัวอย่างการใช้ selectedCount / toggleSocial / updateSocialHandle ถ้าต้องการแสดงส่วนนี้ */}

        {/* ปุ่มบันทึก */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-violet-700 py-3 text-white font-semibold hover:bg-violet-800 disabled:opacity-70"
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>
    </main>
  );
}

/* ---------- UI Components ---------- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-sm text-white/90">{label}</label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  inputMode,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/20 bg-white text-slate-900 px-3 py-2 focus:ring-2 focus:ring-violet-500"
    />
  );
}


function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/20 bg-white text-slate-900 px-3 py-2 focus:ring-2 focus:ring-violet-500"
    />
  );
}
