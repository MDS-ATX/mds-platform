import Link from "next/link";
import buildings from "@/data/buildings.json";

const building = buildings.find((b) => b.slug === "concourse")!;

export default function ConcoursePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4">
            {building.name}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            {building.description}
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">{building.totalUnits}</p>
              <p className="text-gray-600 mt-1">Residences</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">{building.stories}</p>
              <p className="text-gray-600 mt-1">Stories</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <p className="text-3xl font-bold text-gray-900">{building.unitTypes.length}</p>
              <p className="text-gray-600 mt-1">Floor Plans</p>
            </div>
          </div>

          {/* Amenities */}
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Building Amenities
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-16">
            {building.amenities.map((amenity) => (
              <div
                key={amenity}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-brand-500 rounded-full" />
                <span className="text-gray-700">{amenity}</span>
              </div>
            ))}
          </div>

          {/* Unit Types */}
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Residences
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
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
                      {unitType.sqftRange.min.toLocaleString()} - {unitType.sqftRange.max.toLocaleString()} sq ft
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-500">From</span>
                    <span className="font-bold text-brand-600">
                      ${unitType.priceRange.min.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex gap-4">
            <Link
              href="/concourse/floor-plans"
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              View Floor Plans
            </Link>
            <Link
              href="/contact"
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
