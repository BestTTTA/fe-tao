"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface AvatarCropModalProps {
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

export default function AvatarCropModal({
  imageSrc,
  onConfirm,
  onCancel,
}: AvatarCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Offset of image center relative to crop circle center
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [loaded, setLoaded] = useState(false);

  const CANVAS_SIZE = 320; // display size px
  const CROP_RADIUS = 140; // crop circle radius px

  // Drag state
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // ---- draw ----
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !loaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const x = cx + offset.x - drawW / 2;
    const y = cy + offset.y - drawH / 2;

    // Draw image
    ctx.save();
    ctx.drawImage(img, x, y, drawW, drawH);
    ctx.restore();

    // Darken outside circle
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.rect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.arc(cx, cy, CROP_RADIUS, 0, Math.PI * 2, true);
    ctx.fill("evenodd");
    ctx.restore();

    // Circle border
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, CROP_RADIUS, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, [offset, scale, loaded]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // Fit image to fill crop circle initially
      const minDim = Math.min(img.naturalWidth, img.naturalHeight);
      const initialScale = (CROP_RADIUS * 2) / minDim;
      setScale(initialScale);
      setOffset({ x: 0, y: 0 });
      setLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // ---- pointer events ----
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e) {
      const t = e.touches[0];
      const rect = canvasRef.current!.getBoundingClientRect();
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).nativeEvent.offsetX, y: (e as React.MouseEvent).nativeEvent.offsetY };
  };

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    dragging.current = true;
    lastPos.current = getPos(e);
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging.current) return;
    const pos = getPos(e);
    const dx = pos.x - lastPos.current.x;
    const dy = pos.y - lastPos.current.y;
    lastPos.current = pos;
    setOffset((prev) => clampOffset({ x: prev.x + dx, y: prev.y + dy }, scale));
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  // Wheel zoom
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => {
      const img = imgRef.current;
      if (!img) return prev;
      const minDim = Math.min(img.naturalWidth, img.naturalHeight);
      const minScale = (CROP_RADIUS * 2) / minDim;
      const next = Math.max(minScale, Math.min(prev * delta, minScale * 5));
      setOffset((o) => clampOffset(o, next));
      return next;
    });
  };

  // Clamp so image always covers the crop circle
  const clampOffset = (o: { x: number; y: number }, s: number) => {
    const img = imgRef.current;
    if (!img) return o;
    const halfW = (img.naturalWidth * s) / 2;
    const halfH = (img.naturalHeight * s) / 2;
    const maxX = halfW - CROP_RADIUS;
    const maxY = halfH - CROP_RADIUS;
    return {
      x: Math.max(-maxX, Math.min(maxX, o.x)),
      y: Math.max(-maxY, Math.min(maxY, o.y)),
    };
  };

  // ---- confirm: export cropped square ----
  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;

    const exportSize = 400;
    const out = document.createElement("canvas");
    out.width = exportSize;
    out.height = exportSize;
    const ctx = out.getContext("2d");
    if (!ctx) return;

    // Clip circle
    ctx.beginPath();
    ctx.arc(exportSize / 2, exportSize / 2, exportSize / 2, 0, Math.PI * 2);
    ctx.clip();

    const displayScale = exportSize / (CROP_RADIUS * 2);
    const drawW = img.naturalWidth * scale * displayScale;
    const drawH = img.naturalHeight * scale * displayScale;
    const cx = exportSize / 2;
    const cy = exportSize / 2;
    const x = cx + offset.x * displayScale - drawW / 2;
    const y = cy + offset.y * displayScale - drawH / 2;

    ctx.drawImage(img, x, y, drawW, drawH);

    out.toBlob(
      (blob) => {
        if (blob) onConfirm(blob);
      },
      "image/webp",
      0.92
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#1a1030] p-5 shadow-2xl">
        <h2 className="mb-4 text-center text-base font-bold text-white">
          ปรับรูปโปรไฟล์
        </h2>

        {/* Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="cursor-grab rounded-xl touch-none"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            onMouseDown={onPointerDown}
            onMouseMove={onPointerMove}
            onMouseUp={onPointerUp}
            onMouseLeave={onPointerUp}
            onTouchStart={onPointerDown}
            onTouchMove={onPointerMove}
            onTouchEnd={onPointerUp}
            onWheel={onWheel}
          />
        </div>

        <p className="mt-3 text-center text-xs text-white/50">
          ลากเพื่อเลื่อน • เลื่อนล้อเมาส์เพื่อซูม
        </p>

        {/* Buttons */}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-white/20 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!loaded}
            className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-40"
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}
