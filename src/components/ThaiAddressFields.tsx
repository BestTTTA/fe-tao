// components/ThaiAddressFields.tsx
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import rawData from "@/data/thai-address.json";

export type AddressResult = {
  district: string;  // ตำบล/แขวง (d)
  amphoe: string;    // อำเภอ/เขต (a)
  province: string;  // จังหวัด (p)
  zipcode: string;   // รหัสไปรษณีย์ (z)
};

type RawData = {
  data: [string, number, [string, number, [string, number, string][]][]][]
};

// Expand compact JSON into flat array once at module level
const DB: AddressResult[] = (() => {
  const rows: AddressResult[] = [];
  for (const [province, , amphoes] of (rawData as RawData).data) {
    for (const [amphoe, , districts] of amphoes) {
      for (const [district, , zipcode] of districts) {
        rows.push({ district, amphoe, province, zipcode: String(zipcode) });
      }
    }
  }
  return rows;
})();

type FieldKey = "district" | "amphoe" | "province" | "zipcode";

const FIELD_LABEL: Record<FieldKey, string> = {
  district: "ตำบล/แขวง",
  amphoe: "อำเภอ/เขต",
  province: "จังหวัด",
  zipcode: "รหัสไปรษณีย์",
};

const MAX_RESULTS = 100;

type Ctx = {
  subDistrict: string;
  district: string;
  province: string;
  postal: string;
};

function getOptions(fieldKey: FieldKey, query: string, ctx: Ctx): AddressResult[] {
  const q = query.trim().toLowerCase();
  const seen = new Set<string>();
  const results: AddressResult[] = [];

  for (const row of DB) {
    // Context filtering — narrow the list based on other fields already chosen.
    // (Only apply for fields other than the one we're populating.)
    if (fieldKey !== "province" && ctx.province && row.province !== ctx.province) continue;
    if (fieldKey !== "amphoe"   && ctx.district && row.amphoe !== ctx.district) continue;
    if (fieldKey !== "district" && ctx.subDistrict && row.district !== ctx.subDistrict) continue;
    if (fieldKey !== "zipcode"  && ctx.postal && row.zipcode !== ctx.postal) continue;

    // Query filter — startsWith on the current field
    if (q && !row[fieldKey].toLowerCase().startsWith(q)) continue;

    // Dedupe key appropriate to the field
    let key: string;
    if (fieldKey === "province") key = row.province;
    else if (fieldKey === "amphoe") key = `${row.amphoe}|${row.province}`;
    else if (fieldKey === "zipcode") key = `${row.zipcode}|${row.amphoe}|${row.province}`;
    else key = `${row.district}|${row.amphoe}|${row.province}|${row.zipcode}`;

    if (seen.has(key)) continue;
    seen.add(key);
    results.push(row);
    if (results.length >= MAX_RESULTS) break;
  }
  return results;
}

interface FieldProps {
  fieldKey: FieldKey;
  value: string;
  ctx: Ctx;
  onChange: (v: string) => void;
  onSelect: (r: AddressResult) => void;
}

function ThaiAddressField({ fieldKey, value, ctx, onChange, onSelect }: FieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const results = useMemo(
    () => (open ? getOptions(fieldKey, query, ctx) : []),
    [open, fieldKey, query, ctx]
  );

  const handleSelect = (r: AddressResult) => {
    onSelect(r);
    setOpen(false);
    setQuery("");
  };

  const displayLabel = (r: AddressResult) => {
    if (fieldKey === "district") return `${r.district} › ${r.amphoe} › ${r.province} ${r.zipcode}`;
    if (fieldKey === "amphoe") return `${r.amphoe} › ${r.province}`;
    if (fieldKey === "province") return r.province;
    return `${r.zipcode} › ${r.district}, ${r.amphoe}, ${r.province}`;
  };

  return (
    <div ref={wrapRef}>
      <label className="mb-1 block text-sm text-white/90">{FIELD_LABEL[fieldKey]}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type={fieldKey === "zipcode" ? "tel" : "text"}
          inputMode={fieldKey === "zipcode" ? "numeric" : undefined}
          value={value}
          onFocus={() => { setQuery(""); setOpen(true); }}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v);
            setQuery(v);
            setOpen(true);
          }}
          placeholder={FIELD_LABEL[fieldKey]}
          autoComplete="off"
          className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          type="button"
          aria-label="toggle dropdown"
          onMouseDown={(e) => {
            e.preventDefault();
            if (open) {
              setOpen(false);
              setQuery("");
            } else {
              setQuery("");
              setOpen(true);
              inputRef.current?.focus();
            }
          }}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open && (
          <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl bg-white shadow-xl border border-slate-200">
            {results.length > 0 ? (
              results.map((r, i) => (
                <li
                  key={i}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(r);
                  }}
                  className="px-4 py-2.5 text-sm text-slate-800 cursor-pointer hover:bg-violet-50 border-b last:border-b-0 border-slate-100"
                >
                  {displayLabel(r)}
                </li>
              ))
            ) : (
              <li className="px-4 py-2.5 text-sm text-slate-500">ไม่พบข้อมูล</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

interface ThaiAddressFieldsProps {
  subDistrict: string;
  district: string;
  province: string;
  postal: string;
  onChange: (fields: { subDistrict: string; district: string; province: string; postal: string }) => void;
}

export default function ThaiAddressFields({
  subDistrict,
  district,
  province,
  postal,
  onChange,
}: ThaiAddressFieldsProps) {
  const ctx: Ctx = { subDistrict, district, province, postal };

  // Selecting any item auto-fills all four fields with the matching row.
  const handleSelect = (r: AddressResult) => {
    onChange({
      subDistrict: r.district,
      district: r.amphoe,
      province: r.province,
      postal: r.zipcode,
    });
  };

  return (
    <div className="space-y-3">
      <ThaiAddressField
        fieldKey="district"
        value={subDistrict}
        ctx={ctx}
        onChange={(v) => onChange({ subDistrict: v, district, province, postal })}
        onSelect={handleSelect}
      />
      <ThaiAddressField
        fieldKey="amphoe"
        value={district}
        ctx={ctx}
        onChange={(v) => onChange({ subDistrict, district: v, province, postal })}
        onSelect={handleSelect}
      />
      <ThaiAddressField
        fieldKey="province"
        value={province}
        ctx={ctx}
        onChange={(v) => onChange({ subDistrict, district, province: v, postal })}
        onSelect={handleSelect}
      />
      <ThaiAddressField
        fieldKey="zipcode"
        value={postal}
        ctx={ctx}
        onChange={(v) => onChange({ subDistrict, district, province, postal: v })}
        onSelect={handleSelect}
      />
    </div>
  );
}
