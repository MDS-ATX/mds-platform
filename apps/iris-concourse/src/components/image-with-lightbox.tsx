"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "./lightbox";

interface ImageWithLightboxProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}

export default function ImageWithLightbox({
  src,
  alt,
  className = "",
  sizes = "100vw",
}: ImageWithLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`relative cursor-pointer ${className}`}
      >
        <Image src={src} alt={alt} fill className="object-contain" sizes={sizes} quality={95} />
      </button>

      {isOpen && (
        <Lightbox
          images={[{ src, alt }]}
          initialIndex={0}
          currentIndex={0}
          onIndexChange={() => {}}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
