"use client";

import { useState, useMemo } from "react";

interface PointOfInterest {
  name: string;
  category: string;
  distance: string;
  walkTime?: string;
  description: string;
  coordinates?: { lat: number; lng: number };
}

interface PoiCategorySectionProps {
  pointsOfInterest: PointOfInterest[];
}

export default function PoiCategorySection({
  pointsOfInterest,
}: PoiCategorySectionProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(pointsOfInterest.map((poi) => poi.category))
    );
    return ["all", ...cats];
  }, [pointsOfInterest]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return pointsOfInterest;
    return pointsOfInterest.filter((poi) => poi.category === activeCategory);
  }, [pointsOfInterest, activeCategory]);

  return (
    <section id="nearby" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
          Nearby
        </h2>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                activeCategory === cat
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((poi) => (
            <div
              key={poi.name}
              className="p-5 bg-white border border-gray-200 rounded-xl"
            >
              <p className="font-medium text-gray-900">{poi.name}</p>
              {poi.description && (
                <p className="text-sm text-gray-500 mt-1">{poi.description}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                {poi.distance && (
                  <span className="text-xs font-medium text-brand-600">
                    {poi.distance}
                  </span>
                )}
                {poi.walkTime && (
                  <span className="text-xs text-gray-400">
                    {poi.walkTime} walk
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
