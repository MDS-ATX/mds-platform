import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import buildings from "@/data/buildings.json";
import MapSection from "@/components/map-section";

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

  return (
    <>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
        {building.heroImage && (
          <Image
            src={building.heroImage}
            alt={`${building.name} at Mueller`}
            fill
            className="object-cover opacity-30"
            priority
          />
        )}
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4">
            {building.name}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-2">
            {building.description}
          </p>
          <p className="text-gray-400">{building.address}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">
                {building.totalUnits}
              </p>
              <p className="text-gray-600 mt-1">Residences</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">
                {building.stories}
              </p>
              <p className="text-gray-600 mt-1">Stories</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">
                {building.unitTypes.length}
              </p>
              <p className="text-gray-600 mt-1">Floor Plan Types</p>
            </div>
          </div>

          {/* Amenities with photos */}
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Building Amenities
          </h2>
          <div
            className={`mb-16 ${building.amenityImages.length > 0 ? "grid md:grid-cols-2 gap-8 items-start" : ""}`}
          >
            <div className="grid sm:grid-cols-2 gap-4">
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
            {building.amenityImages.length > 0 && (
              <div className="space-y-4 mt-6 md:mt-0">
                {building.amenityImages.slice(0, 2).map((img) => (
                  <div
                    key={img}
                    className="relative aspect-[16/10] rounded-xl overflow-hidden"
                  >
                    <Image
                      src={img}
                      alt={`${building.name} amenities`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Residence Features with photos */}
          {building.featureCategories.length > 0 && (
            <>
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Residence Features
              </h2>
              <div className="space-y-8 mb-16">
                {building.featureCategories.map((cat, i) => (
                  <div
                    key={cat.title}
                    className={`grid md:grid-cols-2 gap-8 items-center ${
                      i % 2 === 1 ? "md:direction-rtl" : ""
                    }`}
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
              <h3 className="text-xl font-heading font-bold mb-3">
                {sf.title}
              </h3>
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
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
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
                        ? ` - ${unitType.sqftRange.max.toLocaleString()}`
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
          <div className="mb-12">
            <MapSection
              center={building.coordinates}
              zoom={16}
              buildings={mapBuildings}
            />
          </div>

          {/* CTAs */}
          <div className="flex gap-4">
            <Link
              href={`/${building.slug}/residences`}
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              View Residences
            </Link>
            <Link
              href={`/contact?building=${building.slug}`}
              className="px-6 py-3 border-2 border-gray-900 text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Inquire
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
