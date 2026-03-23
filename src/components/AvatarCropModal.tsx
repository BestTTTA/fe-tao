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
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [canvasSize, setCanvasSize] = useState(320);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [loaded, setLoaded] = useState(false);

  // Crop radius = 43.75% of canvas size (140/320)
  const cropRadius = Math.round(canvasSize * 0.4375);

  // Measure container on mount to make canvas responsive
  useEffect(() => {
    const measure = () => {
      if (wrapperRef.current) {
        const available = wrapperRef.current.clientWidth;
        setCanvasSize(Math.min(320, available));
      }
    };
    measure();
  }, []);

  // Drag state
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  // Pinch state
  const lastPinchDist = useRef<number | null>(null);

  // ---- draw ----
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !loaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = canvasSize / 2;
    const cy = canvasSize / 2;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const x = cx + offset.x - drawW / 2;
    const y = cy + offset.y - drawH / 2;

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.drawImage(img, x, y, drawW, drawH);

    // Darken outside circle
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.rect(0, 0, canvasSize, canvasSize);
    ctx.arc(cx, cy, cropRadius, 0, Math.PI * 2, true);
    ctx.fill("evenodd");
    ctx.restore();

    // Circle border
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, cropRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, [offset, scale, loaded, canvasSize, cropRadius]);

  useEffect(() => { draw(); }, [draw]);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const minDim = Math.min(img.naturalWidth, img.naturalHeight);
      setScale((cropRadius * 2) / minDim);
      setOffset({ x: 0, y: 0 });
      setLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc, cropRadius]);

  // Clamp so image always covers crop circle
  const clampOffset = (o: { x: number; y: number }, s: number) => {
    const img = imgRef.current;
    if (!img) return o;
    const halfW = (img.naturalWidth * s) / 2;
    const halfH = (img.naturalHeight * s) / 2;
    return {
      x: Math.max(-(halfW - cropRadius), Math.min(halfW - cropRadius, o.x)),
      y: Math.max(-(halfH - cropRadius), Math.min(halfH - cropRadius, o.y)),
    };
  };

  const applyScale = (next: number) => {
    const img = imgRef.current;
    if (!img) return;
    const minDim = Math.min(img.naturalWidth, img.naturalHeight);
    const minScale = (cropRadius * 2) / minDim;
    const clamped = Math.max(minScale, Math.min(next, minScale * 5));
    setScale(clamped);
    setOffset((o) => clampOffset(o, clamped));
  };

  // ---- pointer helpers ----
  const getTouchPos = (t: { clientX: number; clientY: number }) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const displayToCanvas = canvasSize / rect.width;
    return {
      x: (t.clientX - rect.left) * displayToCanvas,
      y: (t.clientY - rect.top) * displayToCanvas,
    };
  };

  const getMousePos = (e: React.MouseEvent) => ({
    x: e.nativeEvent.offsetX,
    y: e.nativeEvent.offsetY,
  });

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = getMousePos(e);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const pos = getMousePos(e);
    const dx = pos.x - lastPos.current.x;
    const dy = pos.y - lastPos.current.y;
    lastPos.current = pos;
    setOffset((prev) => clampOffset({ x: prev.x + dx, y: prev.y + dy }, scale));
  };
  const onMouseUp = () => { dragging.current = false; };

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      dragging.current = true;
      lastPos.current = getTouchPos(e.touches[0]);
      lastPinchDist.current = null;
    } else if (e.touches.length === 2) {
      dragging.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.hypot(dx, dy);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      // Pinch to zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastPinchDist.current !== null) {
        const ratio = dist / lastPinchDist.current;
        applyScale(scale * ratio);
      }
      lastPinchDist.current = dist;
    } else if (e.touches.length === 1 && dragging.current) {
      const pos = getTouchPos(e.touches[0]);
      const dx = pos.x - lastPos.current.x;
      const dy = pos.y - lastPos.current.y;
      lastPos.current = pos;
      setOffset((prev) => clampOffset({ x: prev.x + dx, y: prev.y + dy }, scale));
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length < 2) lastPinchDist.current = null;
    if (e.touches.length === 0) dragging.current = false;
  };

  // Wheel zoom (desktop)
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    applyScale(scale * (e.deltaY > 0 ? 0.9 : 1.1));
  };

  // Slider zoom
  const onSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const img = imgRef.current;
    if (!img) return;
    const minDim = Math.min(img.naturalWidth, img.naturalHeight);
    const minScale = (cropRadius * 2) / minDim;
    applyScale(minScale * Number(e.target.value));
  };

  const sliderValue = (() => {
    const img = imgRef.current;
    if (!img) return 1;
    const minDim = Math.min(img.naturalWidth, img.naturalHeight);
    const minScale = (cropRadius * 2) / minDim;
    return scale / minScale;
  })();

  // ---- confirm ----
  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;
    const exportSize = 400;
    const out = document.createElement("canvas");
    out.width = exportSize;
    out.height = exportSize;
    const ctx = out.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(exportSize / 2, exportSize / 2, exportSize / 2, 0, Math.PI * 2);
    ctx.clip();

    const displayScale = exportSize / (cropRadius * 2);
    const drawW = img.naturalWidth * scale * displayScale;
    const drawH = img.naturalHeight * scale * displayScale;
    const cx = exportSize / 2;
    const cy = exportSize / 2;
    const x = cx + offset.x * displayScale - drawW / 2;
    const y = cy + offset.y * displayScale - drawH / 2;
    ctx.drawImage(img, x, y, drawW, drawH);

    out.toBlob((blob) => { if (blob) onConfirm(blob); }, "image/webp", 0.92);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#1a1030] p-5 shadow-2xl">
        <h2 className="mb-4 text-center text-base font-bold text-white">ปรับรูปโปรไฟล์</h2>

        <div ref={wrapperRef} className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className="cursor-grab rounded-xl touch-none"
            style={{ width: canvasSize, height: canvasSize }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onWheel={onWheel}
          />
        </div>

        {/* Zoom slider */}
        <div className="mt-3 flex items-center gap-2 px-1">
          <span className="text-lg text-white/60">−</span>
          <input
            type="range"
            min="1"
            max="5"
            step="0.01"
            value={sliderValue}
            onChange={onSliderChange}
            className="flex-1 accent-violet-500"
          />
          <span className="text-lg text-white/60">+</span>
        </div>

        <p className="mt-1 text-center text-xs text-white/40">
          ลากเพื่อเลื่อน • บีบนิ้วหรือเลื่อนแถบเพื่อซูม
        </p>

        <div className="mt-4 flex gap-3">
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
