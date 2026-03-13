// components/ThaiAddressFields.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
// @ts-expect-error – CJS module from react-thailand-address-typeahead-split
import { resolveResultbyField } from "react-thailand-address-typeahead-split/dist/finder";

export type AddressResult = {
  d: string; // ตำบล/แขวง
  a: string; // อำเภอ/เขต
  p: string; // จังหวัด
  z: number | string; // รหัสไปรษณีย์
};

type FieldKey = "d" | "a" | "p" | "z";

const FIELD_META: Record<FieldKey, string> = {
  d: "ตำบล/แขวง",
  a: "อำเภอ/เขต",
  p: "จังหวัด",
  z: "รหัสไปรษณีย์",
};

interface ThaiAddressFieldProps {
  fieldKey: FieldKey;
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: AddressResult) => void;
}

function ThaiAddressField({ fieldKey, value, onChange, onSelect }: ThaiAddressFieldProps) {
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
      if (v.length >= 1) {
        const res: AddressResult[] = (resolveResultbyField(fieldKey, v) as AddressResult[]).slice(0, 10);
        setResults(res);
        setOpen(res.length > 0);
      } else {
        setResults([]);
        setOpen(false);
      }
    },
    [fieldKey, onChange]
  );

  const handleSelect = (r: AddressResult) => {
    onSelect(r);
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={wrapRef}>
      <label className="mb-1 block text-sm text-white/90">{FIELD_META[fieldKey]}</label>
      <div className="relative">
        <input
          type={fieldKey === "z" ? "tel" : "text"}
          inputMode={fieldKey === "z" ? "numeric" : undefined}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={FIELD_META[fieldKey]}
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
                <span className="font-medium">
                  {fieldKey === "z" ? String(r.z) : r[fieldKey]}
                </span>
                <span className="ml-2 text-slate-400">
                  {r.d} › {r.a} › {r.p} {r.z}
                </span>
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
    onChange({
      subDistrict: r.d,
      district: r.a,
      province: r.p,
      postal: String(r.z),
    });
  };

  return (
    <div className="space-y-3">
      <ThaiAddressField
        fieldKey="d"
        value={subDistrict}
        onChange={(v) => onChange({ subDistrict: v, district, province, postal })}
        onSelect={handleSelect}
      />
      <ThaiAddressField
        fieldKey="a"
        value={district}
        onChange={(v) => onChange({ subDistrict, district: v, province, postal })}
        onSelect={handleSelect}
      />
      <ThaiAddressField
        fieldKey="p"
        value={province}
        onChange={(v) => onChange({ subDistrict, district, province: v, postal })}
        onSelect={handleSelect}
      />
      <ThaiAddressField
        fieldKey="z"
        value={postal}
        onChange={(v) => onChange({ subDistrict, district, province, postal: v })}
        onSelect={handleSelect}
      />
    </div>
  );
}
