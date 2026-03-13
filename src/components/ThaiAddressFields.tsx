// components/ThaiAddressFields.tsx
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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

function searchDB(field: FieldKey, query: string): AddressResult[] {
  if (!query) return [];
  const q = query.toLowerCase();
  const seen = new Set<string>();
  const results: AddressResult[] = [];
  for (const row of DB) {
    if (results.length >= 10) break;
    if (!row[field].toLowerCase().startsWith(q)) continue;
    const key = `${row.district}|${row.amphoe}|${row.province}|${row.zipcode}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(row);
    }
  }
  return results;
}

interface FieldProps {
  fieldKey: FieldKey;
  value: string;
  onChange: (v: string) => void;
  onSelect: (r: AddressResult) => void;
}

function ThaiAddressField({ fieldKey, value, onChange, onSelect }: FieldProps) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<AddressResult[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const handleChange = useCallback(
    (v: string) => {
      onChange(v);
      const res = searchDB(fieldKey, v);
      setResults(res);
      setOpen(res.length > 0);
    },
    [fieldKey, onChange]
  );

  const handleSelect = (r: AddressResult) => {
    onSelect(r);
    setOpen(false);
    setResults([]);
  };

  const displayLabel = (r: AddressResult) => {
    if (fieldKey === "district") return `${r.district} › ${r.amphoe} › ${r.province} ${r.zipcode}`;
    if (fieldKey === "amphoe") return `${r.amphoe} › ${r.province} ${r.zipcode}`;
    if (fieldKey === "province") return `${r.province}`;
    return `${r.zipcode} › ${r.district}, ${r.amphoe}, ${r.province}`;
  };

  return (
    <div ref={wrapRef}>
      <label className="mb-1 block text-sm text-white/90">{FIELD_LABEL[fieldKey]}</label>
      <div className="relative">
        <input
          type={fieldKey === "zipcode" ? "tel" : "text"}
          inputMode={fieldKey === "zipcode" ? "numeric" : undefined}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={FIELD_LABEL[fieldKey]}
          autoComplete="off"
          className="w-full rounded-xl border border-white/20 bg-white text-slate-900 placeholder-slate-400 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        {open && results.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl bg-white shadow-xl border border-slate-200">
            {results.map((r, i) => (
              <li
                key={i}
                onMouseDown={() => handleSelect(r)}
                className="px-4 py-2.5 text-sm text-slate-800 cursor-pointer hover:bg-violet-50 border-b last:border-b-0 border-slate-100"
              >
                {displayLabel(r)}
              </li>
            ))}
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
  const handleSelect = (r: AddressResult) => {
    onChange({ subDistrict: r.district, district: r.amphoe, province: r.province, postal: r.zipcode });
  };

  return (
    <div className="space-y-3">
      <ThaiAddressField
        fieldKey="district"
        value={subDistrict}
        onChange={(v) => onChange({ subDistrict: v, district, province, postal })}
        onSelect={handleSelect}
      />
      <ThaiAddressField
        fieldKey="amphoe"
        value={district}
        onChange={(v) => onChange({ subDistrict, district: v, province, postal })}
        onSelect={handleSelect}
      />
      <ThaiAddressField
        fieldKey="province"
        value={province}
        onChange={(v) => onChange({ subDistrict, district, province: v, postal })}
        onSelect={handleSelect}
      />
      <ThaiAddressField
        fieldKey="zipcode"
        value={postal}
        onChange={(v) => onChange({ subDistrict, district, province, postal: v })}
        onSelect={handleSelect}
      />
    </div>
  );
}
