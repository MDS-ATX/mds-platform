"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ModelUnit {
  id: string;
  building: string;
  number: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  photos: string[];
}

export default function ModelUnitCard({
  unit,
  href,
}: {
  unit: ModelUnit;
  href: string;
}) {
  const [photoIndex, setPhotoIndex] = useState(0);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Photo carousel */}
      <div className="relative aspect-[4/3] bg-gray-100 group">
        <Image
          src={unit.photos[photoIndex]}
          alt={`Unit ${unit.number} photo ${photoIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={100}
        />
        <div className="absolute top-3 left-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-900 text-white">
            Model Unit
          </span>
        </div>
        {unit.photos.length > 1 && (
          <>
            <button
              onClick={() =>
                setPhotoIndex((i) => (i - 1 + unit.photos.length) % unit.photos.length)
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() =>
                setPhotoIndex((i) => (i + 1) % unit.photos.length)
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              {photoIndex + 1} / {unit.photos.length}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Unit {unit.number}</h3>
        {unit.bedrooms != null && unit.sqft && (
          <p className="text-sm text-gray-500 mb-4">
            {unit.bedrooms} Bed · {unit.bathrooms} Bath · {unit.sqft.toLocaleString()} sq ft
          </p>
        )}
        <Link
          href={href}
          className="block text-center text-sm text-brand-600 hover:text-brand-700 font-medium py-2 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors"
        >
          View Floor Plan & Inquire →
        </Link>
      </div>
    </div>
  );
}
