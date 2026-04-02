// app/menu/profile/edit/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import TransparentHeader from "@/components/TransparentHeader";
import ThaiAddressFields from "@/components/ThaiAddressFields";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useLoading } from "@/components/LoadingOverlay";
import { useLanguage } from "@/lib/i18n";

type SocialKey = "facebook" | "instagram" | "tiktok" | "line" | "youtube";

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
  showDisplayName: boolean;
  showAvatar: boolean;
  socials: Record<SocialKey, { selected: boolean; handle: string }>;
};

const SOCIAL_META: Record<SocialKey, { label: string; icon: string }> = {
  facebook:  { label: "Facebook",  icon: "/icons/facebook.png" },
  instagram: { label: "Instagram", icon: "/icons/instagram.png" },
  tiktok:    { label: "Tiktok",    icon: "/icons/tiktok.png" },
  line:      { label: "Line",      icon: "/icons/line.png" },
  youtube:   { label: "Youtube",   icon: "/icons/youtube.png" },
};

export default function EditProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const { showLoading, hideLoading } = useLoading();
  const { t } = useLanguage();

  const [data, setData] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        if (!sessionUser) { router.push("/login"); return; }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("full_name, nick_name, phone, email, address, sub_district, district, province, postal, share_profile_name, share_profile_image, facebook_handle, instagram_handle, tiktok_handle, line_handle, youtube_handle")
          .eq("id", sessionUser.id)
          .single();

        if (error) throw error;

        // Fallback to social login metadata if profile fields are empty
        const meta = sessionUser.user_metadata ?? {};
        const metaFullName: string = meta.full_name ?? meta.name ?? "";
        const rawEmail = meta.email ?? sessionUser.email ?? "";
        const metaEmail = rawEmail.includes("@line.placeholder.com") ? "" : rawEmail;

        const storedFullName = (profile?.full_name ?? "").trim();
        const resolvedFullName = storedFullName || metaFullName;
        const [firstName, ...rest] = resolvedFullName.split(" ").filter(Boolean);
        const lastName = rest.join(" ");

        setData({
          firstName: firstName ?? "",
          lastName: lastName ?? "",
          nickName: profile?.nick_name ?? "",
          phone: profile?.phone ?? "",
          email: profile?.email || metaEmail,
          address: profile?.address ?? "",
          subDistrict: profile?.sub_district ?? "",
          district: profile?.district ?? "",
          province: profile?.province ?? "",
          postal: profile?.postal ?? "",
          showDisplayName: profile?.share_profile_name ?? true,
          showAvatar: profile?.share_profile_image ?? false,
          socials: {
            facebook:  { selected: !!(profile?.facebook_handle),  handle: profile?.facebook_handle  ?? "" },
            instagram: { selected: !!(profile?.instagram_handle), handle: profile?.instagram_handle ?? "" },
            tiktok:    { selected: !!(profile?.tiktok_handle),    handle: profile?.tiktok_handle    ?? "" },
            line:      { selected: !!(profile?.line_handle),      handle: profile?.line_handle      ?? "" },
            youtube:   { selected: !!(profile?.youtube_handle),   handle: profile?.youtube_handle   ?? "" },
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    try {
      setSaving(true);
      showLoading(t.common.saving);
      const { data: { user: sessionUser } } = await supabase.auth.getUser();
      if (!sessionUser) throw new Error(t.profileEdit.noUserFound);

      const full_name = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
      const normalizedPhone = (data.phone || "").replace(/\D/g, "").slice(0, 10);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name,
          nick_name: data.nickName,
          phone: normalizedPhone,
          email: data.email,
          address: data.address,
          sub_district: data.subDistrict,
          district: data.district,
          province: data.province,
          postal: data.postal,
          share_profile_name: data.showDisplayName,
          share_profile_image: data.showAvatar,
          facebook_handle:  data.socials.facebook.selected  ? data.socials.facebook.handle  : "",
          instagram_handle: data.socials.instagram.selected ? data.socials.instagram.handle : "",
          tiktok_handle:    data.socials.tiktok.selected    ? data.socials.tiktok.handle    : "",
          line_handle:      data.socials.line.selected      ? data.socials.line.handle      : "",
          youtube_handle:   data.socials.youtube.selected   ? data.socials.youtube.handle   : "",
        })
        .eq("id", sessionUser.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert(t.profileEdit.saveError);
    } finally {
      setSaving(false);
      hideLoading();
    }
  };

  if (loading)
    return <div className="flex h-screen items-center justify-center text-white">{t.profileEdit.loading}</div>;

  if (!data)
    return <div className="flex h-screen items-center justify-center text-white">{t.profileEdit.noUser}</div>;

  return (
    <main className="relative min-h-screen">
      <TransparentHeader
        title={t.profileEdit.title}
        subtitle=""
        routeRules={{
          "/menu/profile/edit": {
            showLogo: false,
            showSearch: false,
            showMenu: false,
            showBack: true,
          },
        }}
      />

      <section className="relative h-[80px] w-full" />

      <form id="profile-form" onSubmit={onSubmit} className="mx-auto max-w-md px-4 pb-[100px] text-white space-y-3">

        {/* ชื่อ-นามสกุล-ชื่อเล่น-เบอร์-อีเมล */}
        <Field label={t.profileEdit.firstName}>
          <Input value={data.firstName} onChange={(v) => setData({ ...data, firstName: v })} placeholder={t.profileEdit.firstNamePlaceholder} />
        </Field>
        <Field label={t.profileEdit.lastName}>
          <Input value={data.lastName} onChange={(v) => setData({ ...data, lastName: v })} placeholder={t.profileEdit.firstNamePlaceholder} />
        </Field>
        <Field label={t.profileEdit.nickname}>
          <Input value={data.nickName} onChange={(v) => setData({ ...data, nickName: v })} placeholder={t.profileEdit.firstNamePlaceholder} />
        </Field>
        <Field label={t.profileEdit.phone}>
          <LockedInput value={data.phone} placeholder={t.profileEdit.phonePlaceholder} hint={t.profileEdit.phoneHelp} />
        </Field>
        <Field label={t.profileEdit.email}>
          <LockedInput value={data.email} placeholder={t.profileEdit.emailPlaceholder} hint={t.profileEdit.emailHelp} />
        </Field>

        {/* Address */}
        <Field label={t.profileEdit.addressLabel}>
          <Input value={data.address} onChange={(v) => setData({ ...data, address: v })} placeholder={t.profileEdit.addressPlaceholder} />
        </Field>
        <ThaiAddressFields
          subDistrict={data.subDistrict}
          district={data.district}
          province={data.province}
          postal={data.postal}
          onChange={(f) => setData({ ...data, ...f })}
        />

        {/* ข้อมูลที่จะปรากฏในรูปภาพที่ต้องการแชร์ */}
        <div className="pt-3">
          <p className="text-base font-bold text-white">{t.profileEdit.shareInfoSection}</p>
          <div className="mt-2 h-px bg-white/20" />
          <div className="mt-3 space-y-3">
            <p className="text-xs font-semibold text-white/70">{t.profileEdit.profileSection}</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="h-6 w-6 flex-none rounded border-2 border-white bg-white flex items-center justify-center">
                {data.showDisplayName && (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#22c55e" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input type="checkbox" checked={data.showDisplayName} onChange={(e) => setData({ ...data, showDisplayName: e.target.checked })} className="sr-only" />
              <span className="text-sm text-white">{t.profileEdit.username}</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="h-6 w-6 flex-none rounded border-2 border-white bg-white flex items-center justify-center">
                {data.showAvatar && (
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#22c55e" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input type="checkbox" checked={data.showAvatar} onChange={(e) => setData({ ...data, showAvatar: e.target.checked })} className="sr-only" />
              <span className="text-sm text-white">{t.profileEdit.profilePicture}</span>
            </label>
          </div>
          <div className="mt-3 h-px bg-white/20" />
        </div>

        {/* Social Media */}
        <div className="pt-2">
          <p className="mb-2 text-sm font-semibold text-white/90">
            {t.profileEdit.socialMedia} <span className="font-normal text-white/60">{t.profileEdit.socialMax}</span>
          </p>
          <div className="space-y-6">
            {(Object.keys(SOCIAL_META) as SocialKey[]).map((key) => {
              const meta = SOCIAL_META[key];
              const social = data.socials[key];
              return (
                <div key={key}>
                  {/* Social row - กล่องขาว */}
                  <button
                    type="button"
                    onClick={() => toggleSocial(key)}
                    className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3"
                  >
                    <Image src={meta.icon} alt={meta.label} width={32} height={32} className="rounded-full flex-none" />
                    <span className="flex-1 text-left text-sm font-medium text-slate-900">{meta.label}</span>
                    {social.selected && (
                      <div className="h-6 w-6 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center flex-none">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                  {/* Input ชื่อ - อยู่นอกกล่อง */}
                  {social.selected && (
                    <div className="mt-1.5 px-1">
                      <p className="mb-1 text-xs text-white/80">{t.profileEdit.name} {meta.label}</p>
                      <input
                        type="text"
                        value={social.handle}
                        onChange={(e) => updateSocialHandle(key, e.target.value)}
                        placeholder={meta.label}
                        className="w-full rounded-xl bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </form>

      {/* ปุ่มบันทึก - fixed bottom */}
      <div className="fixed inset-x-0 bottom-0 z-40">
        <div className="mx-auto max-w-md px-4 pb-6 pt-3 bg-white rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          <button
            type="submit"
            form="profile-form"
            disabled={saving}
            className={`w-full rounded-xl py-3 text-white font-semibold transition-colors duration-300 disabled:opacity-70 ${
              saved ? "bg-green-600" : "bg-violet-700 hover:bg-violet-800"
            }`}
          >
            {saving ? t.common.saving : saved ? t.profileEdit.saveSuccess : t.common.save}
          </button>
        </div>
      </div>
    </main>
  );
}

/* ---------- UI Components ---------- */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-white/90">{label}</label>
      {children}
    </div>
  );
}

function LockedInput({ value, placeholder, hint }: { value: string; placeholder?: string; hint?: string }) {
  return (
    <div>
      <div className="w-full rounded-xl border border-white/10 bg-white/30 text-white px-3 py-2.5 text-sm cursor-not-allowed select-none">
        {value || <span className="text-white/40">{placeholder}</span>}
      </div>
      {hint && <p className="mt-1 text-xs text-white/50">{hint}</p>}
    </div>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  inputMode,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
    />
  );
}
