"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, type Locale } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
}

const languages: { key: Locale; label: string; flag: string; alt: string }[] = [
  { key: "th", label: "ไทย", flag: "/flags/th.png", alt: "Thai" },
  { key: "en", label: "English", flag: "/flags/gb.png", alt: "English" },
];

export default function LanguageModal({ open, onClose }: Props) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Background overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          {/* Bottom sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-lg"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="p-4 border-b border-gray-200 text-center font-semibold text-gray-800">
              {t.languageModal.title}
            </div>

            <div className="divide-y divide-gray-200">
              {languages.map((lang) => (
                <button
                  key={lang.key}
                  onClick={() => {
                    setLocale(lang.key);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between px-5 py-3 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Image src={lang.flag} alt={lang.alt} width={24} height={24} />
                    <span>{lang.label}</span>
                  </div>
                  {locale === lang.key && (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="green"
                      strokeWidth="3"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="p-3 text-center">
              <button
                onClick={onClose}
                className="text-blue-500 font-medium hover:underline"
              >
                {t.common.close}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
