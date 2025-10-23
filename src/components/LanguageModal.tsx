"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  selected: string;
  onSelect: (lang: string) => void;
}

export default function LanguageModal({ open, onClose, selected, onSelect }: Props) {
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
              เลือกภาษาของระบบ
            </div>

            <div className="divide-y divide-gray-200">
              <button
                onClick={() => {
                  onSelect("ไทย");
                  onClose();
                }}
                className="flex w-full items-center justify-between px-5 py-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Image src="/flags/th.png" alt="Thai" width={24} height={24} />
                  <span>ไทย</span>
                </div>
                {selected === "ไทย" && (
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

              <button
                onClick={() => {
                  onSelect("English");
                  onClose();
                }}
                className="flex w-full items-center justify-between px-5 py-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Image src="/flags/gb.png" alt="English" width={24} height={24} />
                  <span>English</span>
                </div>
                {selected === "English" && (
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
            </div>

            <div className="p-3 text-center">
              <button
                onClick={onClose}
                className="text-blue-500 font-medium hover:underline"
              >
                ปิด
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
