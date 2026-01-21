"use client";

import React from "react";

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  body: string;
  cancelText?: string;
  confirmText?: string;
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  body,
  cancelText = "ยกเลิก",
  confirmText = "ยืนยัน",
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={title ? "confirm-title" : undefined}
        aria-describedby="confirm-body"
        className="relative z-10 w-[320px] animate-scale-in"
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          {/* Content */}
          <div className="p-5 text-center">
            {/* Warning Icon */}
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </div>

            {title && (
              <h2
                id="confirm-title"
                className="text-lg font-semibold text-slate-900"
              >
                {title}
              </h2>
            )}
            <p
              id="confirm-body"
              className="mt-2 text-sm text-slate-600 whitespace-pre-line"
            >
              {body}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 border-r border-slate-200"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
