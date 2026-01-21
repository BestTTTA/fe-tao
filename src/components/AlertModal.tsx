"use client";

import React from "react";

export type AlertType = "warning" | "success" | "error";

export interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  body: string;
  type?: AlertType;
}

export default function AlertModal({
  open,
  onClose,
  title,
  body,
  type = "warning",
}: AlertModalProps) {
  if (!open) return null;

  const isSuccess = type === "success";
  const iconBgColor = isSuccess ? "bg-green-100" : "bg-amber-100";
  const iconColor = isSuccess ? "text-green-600" : "text-amber-600";

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
        aria-labelledby="alert-title"
        aria-describedby="alert-body"
        className="relative z-10 w-[300px] animate-scale-in"
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          {/* Content */}
          <div className="p-5 text-center">
            {/* Icon */}
            <div
              className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${iconBgColor}`}
            >
              {isSuccess ? (
                <svg
                  className={`h-6 w-6 ${iconColor}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              ) : (
                <svg
                  className={`h-6 w-6 ${iconColor}`}
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
              )}
            </div>

            <h2
              id="alert-title"
              className="text-lg font-semibold text-slate-900"
            >
              {title}
            </h2>
            <p id="alert-body" className="mt-2 text-sm text-slate-600">
              {body}
            </p>
          </div>

          {/* Button */}
          <div className="border-t border-slate-200 px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-violet-800"
            >
              ตกลง
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
