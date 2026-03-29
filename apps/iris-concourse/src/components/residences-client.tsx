"use client";

import { useState } from "react";
import Link from "next/link";
import BedroomFilter from "./bedroom-filter";
import ImageWithLightbox from "./image-with-lightbox";

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
}: {
  units: Unit[];
  building: BuildingData;
}) {
  const [bedroomFilter, setBedroomFilter] = useState<number | null>(null);

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

  return (
    <div>
      <div className="mb-8">
        <BedroomFilter
          options={filterOptions}
          selected={bedroomFilter}
          onChange={setBedroomFilter}
        />
      </div>

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
              {floorUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      Unit {unit.number}
                    </h3>
                    {unit.designation && (
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${designationStyles[unit.designation] || ""}`}
                      >
                        {designationLabels[unit.designation]}
                      </span>
                    )}
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

                  <ImageWithLightbox
                    src={`/images/floor-plans/${unit.building}-${unit.number}.png`}
                    alt={`Floor plan for Unit ${unit.number}`}
                    className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

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
              ))}
            </div>
          </div>
        );
      })}

      {filteredUnits.length === 0 && (
        <p className="text-gray-500 text-center py-12">
          No units match the selected filter.
        </p>
      )}
    </div>
  );
}
