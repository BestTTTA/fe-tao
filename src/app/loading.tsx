export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white" />
        <p className="text-white text-sm">กำลังโหลด...</p>
      </div>
    </div>
  );
}
