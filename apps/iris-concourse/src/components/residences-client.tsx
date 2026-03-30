"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BedroomFilter from "./bedroom-filter";
import Lightbox from "./lightbox";
import ModelUnitCard from "./model-unit-card";

interface Unit {
  id: string;
  building: string;
  number: string;
  floor: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  status: string;
  features?: string[];
  designation?: string;
  floorPlanImage?: string;
  photos?: string[];
}

interface BuildingData {
  slug: string;
  name: string;
}

const designationLabels: Record<string, string> = {
  market: "Market Rate",
  affordable: "Affordable Housing",
  workforce: "Workforce Housing",
};

const designationStyles: Record<string, string> = {
  market: "text-brand-600 bg-brand-50",
  affordable: "text-emerald-700 bg-emerald-50",
  workforce: "text-amber-700 bg-amber-50",
};

export default function ResidencesClient({
  units,
  building,
  initialFilter = null,
}: {
  units: Unit[];
  building: BuildingData;
  initialFilter?: number | null;
}) {
  const [bedroomFilter, setBedroomFilter] = useState<number | null>(initialFilter);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [unitPhotoIndices, setUnitPhotoIndices] = useState<Record<string, number>>({});

  const filterOptions = [
    { label: "All", value: null },
    { label: "One Bedroom", value: 1 },
    { label: "Two Bedroom", value: 2 },
  ];

  const filteredUnits =
    bedroomFilter === null
      ? units
      : units.filter((u) => u.bedrooms === bedroomFilter);

  const floors = [...new Set(filteredUnits.map((u) => u.floor))].sort();

  // Shared floor plan images for lightbox arrow navigation
  const floorPlanImages = filteredUnits.map((u) => ({
    src: `/images/floor-plans/${u.building}-${u.number}.png`,
    alt: `Floor plan for Unit ${u.number}`,
  }));

  const getUnitFloorPlanIndex = (unit: Unit) =>
    filteredUnits.findIndex((u) => u.id === unit.id);

  const setUnitPhoto = (unitId: string, index: number) => {
    setUnitPhotoIndices((prev) => ({ ...prev, [unitId]: index }));
  };

  const modelUnits = units.filter((u) => u.photos && u.photos.length > 0);

  return (
    <div>
      {/* Featured model units */}
      {modelUnits.length > 0 && (
        <div className="mb-14">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-5">
            Model Units — Available to Tour
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {modelUnits.map((unit) => (
              <ModelUnitCard
                key={unit.id}
                unit={{ ...unit, photos: unit.photos as string[] }}
                href={`/contact?unit=${unit.number}&building=${building.slug}`}
              />
            ))}
          </div>
          <div className="mt-10 border-t border-gray-100" />
        </div>
      )}

      <div className="mb-8">
        <BedroomFilter
          options={filterOptions}
          selected={bedroomFilter}
          onChange={setBedroomFilter}
        />
      </div>

      {floors.length > 1 && (
        <div className="flex gap-3 mb-8 text-sm text-gray-500 flex-wrap">
          {floors.map((f) => (
            <span key={f} className="bg-gray-100 px-3 py-1 rounded-full">
              Floor {f} · {filteredUnits.filter((u) => u.floor === f).length} units
            </span>
          ))}
        </div>
      )}

      {floors.map((floor) => {
        const floorUnits = filteredUnits.filter((u) => u.floor === floor);
        return (
          <div key={floor} className="mb-16">
            <h2 className="text-xl font-heading font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              Floor {floor}
              <span className="text-sm font-normal text-gray-500 ml-3">
                {floorUnits.length} unit{floorUnits.length !== 1 ? "s" : ""}
              </span>
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {floorUnits.map((unit) => {
                const photoIndex = unitPhotoIndices[unit.id] ?? 0;
                const hasPhotos = unit.photos && unit.photos.length > 0;

                return (
                  <div
                    key={unit.id}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-baseline justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        Unit {unit.number}
                      </h3>
                      <div className="flex items-center gap-2">
                        {hasPhotos && (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-900 text-white">
                            Model Unit
                          </span>
                        )}
                        {unit.designation && (
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full ${designationStyles[unit.designation] || ""}`}
                          >
                            {designationLabels[unit.designation]}
                          </span>
                        )}
                      </div>
                    </div>

                    {unit.bedrooms != null && unit.sqft ? (
                      <div className="space-y-1.5 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Layout</span>
                          <span className="font-medium text-gray-900">
                            {unit.bedrooms} Bed / {unit.bathrooms} Bath
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Size</span>
                          <span className="font-medium text-gray-900">
                            {unit.sqft.toLocaleString()} sq ft
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic mb-4">
                        Floor plan details coming soon
                      </p>
                    )}

                    {/* Model unit photo carousel */}
                    {hasPhotos && unit.photos && (
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-gray-100 group">
                        <Image
                          src={unit.photos[photoIndex]}
                          alt={`Unit ${unit.number} photo ${photoIndex + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          quality={100}
                        />
                        {unit.photos.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                setUnitPhoto(
                                  unit.id,
                                  (photoIndex - 1 + unit.photos!.length) % unit.photos!.length
                                )
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
                                setUnitPhoto(
                                  unit.id,
                                  (photoIndex + 1) % unit.photos!.length
                                )
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
                    )}

                    {/* Floor plan — click opens shared lightbox */}
                    <button
                      onClick={() => setLightboxIndex(getUnitFloorPlanIndex(unit))}
                      className="relative w-full aspect-[3/4] bg-gray-50 rounded-lg overflow-hidden mb-4 cursor-zoom-in"
                    >
                      <Image
                        src={`/images/floor-plans/${unit.building}-${unit.number}.png`}
                        alt={`Floor plan for Unit ${unit.number}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized
                      />
                    </button>

                    {unit.features && unit.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {unit.features.map((f) => (
                          <span
                            key={f}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link
                      href={`/contact?unit=${unit.number}&building=${building.slug}`}
                      className="block text-center text-sm text-brand-600 hover:text-brand-700 font-medium py-2 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors"
                    >
                      Inquire About Unit {unit.number}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {filteredUnits.length === 0 && (
        <p className="text-gray-500 text-center py-12">
          No units match the selected filter.
        </p>
      )}

      {/* Shared floor plan lightbox — arrow keys cycle through all filtered units */}
      {lightboxIndex !== null && (
        <Lightbox
          images={floorPlanImages}
          initialIndex={lightboxIndex}
          currentIndex={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
