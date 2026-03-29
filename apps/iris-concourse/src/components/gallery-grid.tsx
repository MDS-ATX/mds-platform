"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "./lightbox";

interface GalleryImage {
  src: string;
  alt: string;
}

export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, i) => (
          <button
            key={image.src}
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          currentIndex={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
