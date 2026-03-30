"use client";

import { useState } from "react";
import Image from "next/image";

interface NeighborhoodImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  fill?: boolean;
  priority?: boolean;
}

export default function NeighborhoodImage({
  src,
  alt,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  fill = true,
  priority = false,
}: NeighborhoodImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-brand-50 to-brand-100 flex flex-col items-center justify-center gap-2 ${className}`}
        style={{ position: fill ? "absolute" : "relative", inset: fill ? 0 : undefined }}
      >
        <svg
          className="w-8 h-8 text-brand-300"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
          />
        </svg>
        <span className="text-xs text-brand-400 text-center px-4">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={`object-cover ${className}`}
      sizes={sizes}
      priority={priority}
      onError={() => setHasError(true)}
    />
  );
}
