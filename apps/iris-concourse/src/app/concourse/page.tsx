import Link from "next/link";
import Image from "next/image";
import buildings from "@/data/buildings.json";

const building = buildings.find((b) => b.slug === "concourse")!;

const featureCategories = [
  {
    title: "Interior Finishes",
    items: [
      "Luxury vinyl plank & designer tile flooring throughout",
      "Soaring 10-foot ceilings with recessed lighting",
      "Paneled interior doors with premium fixtures",
      "Double-paned, low-emission windows",
      "Modern bathroom fixtures with elegant tile surrounds",
    ],
  },
  {
    title: "Kitchen Excellence",
    items: [
      "Elegant natural stone countertops",
      "Complete stainless steel appliance suite",
      "Shaker-style cabinetry with designer tile backsplashes",
      "Undermounted sink with gooseneck faucets",
      "Kitchen islands designed for gathering and entertaining",
    ],
  },
  {
    title: "Outdoor Living",
    items: [
      "Private residence balconies with sleek glass enclosures",
      "Glass patio doors for seamless indoor-outdoor flow",
      "Views of the iconic Mueller control tower or city skyline",
      "Open-air corridors with fresh-air access",
    ],
  },
  {
    title: "Every Home Includes",
    items: [
      "In-unit washer and dryer",
      "Stainless steel refrigerator",
      "Tankless hot water heater",
      "Individually sub-metered water and gas service",
      "Ample storage thoughtfully integrated throughout",
    ],
  },
];

export default function ConcoursePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
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
              <p className="text-gray-600 mt-1">Floor Plan Types</p>
            </div>
          </div>

          {building.pricingMessage && (
            <p className="text-center text-lg font-medium text-brand-600 mb-12">
              {building.pricingMessage}
            </p>
          )}

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

          {/* Residence Features */}
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Residence Features
          </h2>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {featureCategories.map((cat) => (
              <div key={cat.title} className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-3">{cat.title}</h3>
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
            ))}
          </div>

          {/* The Flight Deck */}
          <div className="bg-gray-900 rounded-xl p-8 mb-16 text-white">
            <h3 className="text-xl font-heading font-bold mb-3">
              The Flight Deck
            </h3>
            <p className="text-gray-300 mb-4">
              An expansive resident mezzanine lounge with views of the iconic
              Mueller airport control tower. The Flight Deck offers a
              comfortable relaxation area with BBQ facilities for gathering with
              neighbors and guests.
            </p>
          </div>

          {/* Unit Types */}
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Residences
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
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
