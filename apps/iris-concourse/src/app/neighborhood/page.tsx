import Link from "next/link";
import type { Metadata } from "next";
import neighborhoodData from "@/data/neighborhood.json";
import buildings from "@/data/buildings.json";
import LandingNav from "@/components/landing-nav";
import MapSection from "@/components/map-section";
import GalleryGrid from "@/components/gallery-grid";
import NeighborhoodImage from "@/components/neighborhood/neighborhood-image";
import HoaAmenitiesSection from "@/components/neighborhood/hoa-amenities-section";
import PoiCategorySection from "@/components/neighborhood/poi-category-section";
import LifestyleSection from "@/components/neighborhood/lifestyle-section";

export const metadata: Metadata = {
  title: "Mueller Neighborhood | Iris & Concourse, Austin",
  description:
    "Explore Mueller — Austin's walkable, master-planned community with parks, trails, dining, and vibrant community amenities.",
};

export default function NeighborhoodPage() {
  const mapBuildings = buildings.map((b) => ({
    lat: b.coordinates.lat,
    lng: b.coordinates.lng,
    label: b.name,
    href: `/${b.slug}`,
  }));

  const mapPois = neighborhoodData.pointsOfInterest
    .filter((poi) => poi.coordinates)
    .map((poi) => ({
      lat: poi.coordinates.lat,
      lng: poi.coordinates.lng,
      label: poi.name,
      description: poi.description,
      distance: poi.distance,
    }));

  return (
    <>
      <LandingNav />

      {/* Page header — photo left, title right (matches building pages) */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 order-2 md:order-1">
              <NeighborhoodImage
                src={neighborhoodData.heroImage}
                alt={neighborhoodData.heroImageAlt}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="order-1 md:order-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                Mueller, Austin
              </p>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-3">
                {neighborhoodData.name}
              </h1>
              <p className="text-gray-600 leading-relaxed mb-6">
                {neighborhoodData.description}
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/iris/residences"
                  className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Explore Residences
                </Link>
                <Link
                  href="/contact"
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scores */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {neighborhoodData.walkScore && (
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-gray-900">
                  {neighborhoodData.walkScore}
                </p>
                <p className="text-gray-500 mt-1 text-sm">Walk Score</p>
              </div>
            )}
            {neighborhoodData.bikeScore && (
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-gray-900">
                  {neighborhoodData.bikeScore}
                </p>
                <p className="text-gray-500 mt-1 text-sm">Bike Score</p>
              </div>
            )}
            {neighborhoodData.transitScore && (
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-gray-900">
                  {neighborhoodData.transitScore}
                </p>
                <p className="text-gray-500 mt-1 text-sm">Transit Score</p>
              </div>
            )}
          </div>

          {/* Highlights */}
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Neighborhood Highlights
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {neighborhoodData.highlights.map((highlight) => (
              <div
                key={highlight.text}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-brand-500 rounded-full shrink-0" />
                <span className="text-gray-700 text-sm">{highlight.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOA Amenities */}
      <HoaAmenitiesSection
        title={neighborhoodData.hoaAmenities.title}
        description={neighborhoodData.hoaAmenities.description}
        items={neighborhoodData.hoaAmenities.items}
      />

      {/* Lifestyle */}
      <LifestyleSection
        title={neighborhoodData.lifestyle.title}
        description={neighborhoodData.lifestyle.description}
        features={neighborhoodData.lifestyle.features}
      />

      {/* Points of Interest */}
      <PoiCategorySection
        pointsOfInterest={neighborhoodData.pointsOfInterest}
      />

      {/* Gallery */}
      {neighborhoodData.gallery.length > 0 && (
        <section id="gallery" className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
              Neighborhood Gallery
            </h2>
            <GalleryGrid images={neighborhoodData.gallery} />
          </div>
        </section>
      )}

      {/* Map */}
      <section id="map" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Location
          </h2>
          <MapSection
            center={neighborhoodData.mapCenter}
            zoom={neighborhoodData.mapZoom}
            buildings={mapBuildings}
            pois={mapPois}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
            Interested in Mueller?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Discover modern living at Iris and Concourse — new condominiums in
            the heart of Mueller, Austin.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/iris"
              className="px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Explore Iris
            </Link>
            <Link
              href="/concourse"
              className="px-6 py-3 border border-gray-600 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Explore Concourse
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 border border-gray-600 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
