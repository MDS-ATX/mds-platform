import Link from "next/link";
import buildings from "@/data/buildings.json";

export default function PricingPage() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
          Pricing & Availability
        </h1>
        <p className="text-gray-600 mb-12">
          Explore residences across both Iris and Concourse.
        </p>

        {buildings.map((building) => (
          <div key={building.slug} className="mb-16">
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
              {building.name}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="py-3 pr-6 text-sm font-medium text-gray-500">
                      Type
                    </th>
                    <th className="py-3 pr-6 text-sm font-medium text-gray-500">
                      Bed / Bath
                    </th>
                    <th className="py-3 pr-6 text-sm font-medium text-gray-500">
                      Size (sq ft)
                    </th>
                    <th className="py-3 pr-6 text-sm font-medium text-gray-500">
                      Price From
                    </th>
                    <th className="py-3 text-sm font-medium text-gray-500"></th>
                  </tr>
                </thead>
                <tbody>
                  {building.unitTypes.map((unitType) => (
                    <tr
                      key={unitType.name}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 pr-6 font-medium text-gray-900">
                        {unitType.name}
                      </td>
                      <td className="py-4 pr-6 text-gray-600">
                        {unitType.bedrooms === 0 ? "Studio" : unitType.bedrooms} / {unitType.bathrooms}
                      </td>
                      <td className="py-4 pr-6 text-gray-600">
                        {unitType.sqftRange.min.toLocaleString()} -{" "}
                        {unitType.sqftRange.max.toLocaleString()}
                      </td>
                      <td className="py-4 pr-6 font-bold text-brand-600">
                        ${unitType.priceRange.min.toLocaleString()}
                      </td>
                      <td className="py-4">
                        <Link
                          href="/contact"
                          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                        >
                          Inquire →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
