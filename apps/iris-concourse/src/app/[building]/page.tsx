import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import buildings from "@/data/buildings.json";
import MapSection from "@/components/map-section";
import PhotoCarousel from "@/components/photo-carousel";

export function generateStaticParams() {
  return buildings.map((b) => ({ building: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ building: string }>;
}) {
  const { building: slug } = await params;
  const building = buildings.find((b) => b.slug === slug);
  if (!building) return {};
  return {
    title: `${building.name} | Condos at Mueller, Austin`,
    description: building.description,
  };
}

export default async function BuildingPage({
  params,
}: {
  params: Promise<{ building: string }>;
}) {
  const { building: slug } = await params;
  const building = buildings.find((b) => b.slug === slug);
  if (!building) notFound();

  const mapBuildings = buildings.map((b) => ({
    lat: b.coordinates.lat,
    lng: b.coordinates.lng,
    label: b.name,
    href: `/${b.slug}`,
  }));

  const amenityCarouselImages = building.amenityImages.map((src) => ({
    src,
    alt: `${building.name} amenities`,
  }));

  return (
    <>
      {/* Page header — photo left, title right */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 order-2 md:order-1">
              <Image
                src={building.heroImage}
                alt={`${building.name} at Mueller`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="order-1 md:order-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                Mueller, Austin
              </p>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-3">
                {building.name}
              </h1>
              <p className="text-gray-400 text-sm mb-4">{building.address}</p>
              <p className="text-gray-600 leading-relaxed mb-6">
                {building.description}
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href={`/${building.slug}/residences`}
                  className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  View Residences
                </Link>
                <Link
                  href={`/contact?building=${building.slug}`}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Inquire
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">
                {building.totalUnits}
              </p>
              <p className="text-gray-500 mt-1 text-sm">Residences</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">
                {building.stories}
              </p>
              <p className="text-gray-500 mt-1 text-sm">Stories</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">
                {building.unitTypes.length}
              </p>
              <p className="text-gray-500 mt-1 text-sm">Floor Plan Types</p>
            </div>
          </div>

          {/* Amenities */}
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Building Amenities
          </h2>
          <div
            className={`mb-16 ${amenityCarouselImages.length > 0 ? "grid md:grid-cols-2 gap-10 items-start" : ""}`}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {building.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-brand-500 rounded-full shrink-0" />
                  <span className="text-gray-700 text-sm">{amenity}</span>
                </div>
              ))}
            </div>
            {amenityCarouselImages.length > 0 && (
              <PhotoCarousel images={amenityCarouselImages} />
            )}
          </div>

          {/* Residence Features */}
          {building.featureCategories.length > 0 && (
            <>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Residence Features
              </h2>
              <div className="space-y-8 mb-16">
                {building.featureCategories.map((cat, i) => (
                  <div
                    key={cat.title}
                    className="grid md:grid-cols-2 gap-8 items-center"
                  >
                    <div className={i % 2 === 1 ? "md:order-2" : ""}>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 mb-3">
                          {cat.title}
                        </h3>
                        <ul className="space-y-2">
                          {cat.items.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <div className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {cat.image ? (
                      <div
                        className={`relative aspect-[4/3] rounded-xl overflow-hidden ${
                          i % 2 === 1 ? "md:order-1" : ""
                        }`}
                      >
                        <Image
                          src={cat.image}
                          alt={cat.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    ) : (
                      <div
                        className={
                          i % 2 === 1 ? "md:order-1 hidden md:block" : "hidden md:block"
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Special Features */}
          {building.specialFeatures.map((sf) => (
            <div
              key={sf.title}
              className="bg-gray-900 rounded-xl p-8 mb-16 text-white"
            >
              <h3 className="text-xl font-heading font-bold mb-3">{sf.title}</h3>
              <p className="text-gray-300">{sf.description}</p>
            </div>
          ))}

          {/* Unit Types */}
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Residences
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {building.unitTypes.map((unitType) => (
              <div
                key={unitType.name}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {unitType.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {unitType.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bedrooms</span>
                    <span className="font-medium">{unitType.bedrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bathrooms</span>
                    <span className="font-medium">{unitType.bathrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size</span>
                    <span className="font-medium">
                      {unitType.sqftRange.min.toLocaleString()}
                      {unitType.sqftRange.min !== unitType.sqftRange.max
                        ? ` – ${unitType.sqftRange.max.toLocaleString()}`
                        : ""}{" "}
                      sq ft
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Location
          </h2>
          <div className="mb-4">
            <MapSection
              center={building.coordinates}
              zoom={16}
              buildings={mapBuildings}
            />
          </div>
        </div>
      </section>
    </>
  );
}
