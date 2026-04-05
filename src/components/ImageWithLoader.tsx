"use client";
import { useState, useCallback, useRef } from "react";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  draggable?: boolean;
  loading?: "lazy" | "eager";
};

export default function ImageWithLoader({
  src,
  alt = "",
  className = "",
  draggable,
  loading,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const refCallback = useCallback((el: HTMLImageElement | null) => {
    imgRef.current = el;
    if (el?.complete && el.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <div className="relative h-full w-full">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-3 border-gray-300 border-t-violet-500" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={refCallback}
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        draggable={draggable}
        loading={loading}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
