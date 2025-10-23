"use client";

import React from "react";

interface StatusModalProps {
  status: string | null;
  purchasedPlan?: string | null;
}

export default function StatusModal({
  status,
  purchasedPlan,
}: StatusModalProps) {
  // ✅ กรองเฉพาะ status ที่ต้องใช้จริง
  const allowedStatuses = ["success", "cancel"];
  if (!status || !allowedStatuses.includes(status)) return null;

  console.log("StatusModal:", status);

  const color =
    status === "success"
      ? "bg-green-500"
      : "bg-amber-500";

  const message =
    status === "success"
      ? `✅ ซื้อ ${purchasedPlan ?? "แพ็คเกจ"} สำเร็จแล้ว!`
      : "⚠️ ยกเลิกการชำระเงิน";

  return (
    <div
      className={`fixed top-4 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 rounded-xl p-3 text-white shadow-lg transition-all animate-slide-down ${color}`}
    >
      <p className="text-center text-sm font-semibold">{message}</p>

      <style jsx>{`
        @keyframes slide-down {
          0% {
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
