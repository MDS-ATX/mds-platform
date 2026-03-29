import Link from "next/link";
import buildings from "@/data/buildings.json";
import units from "@/data/units.json";

const building = buildings.find((b) => b.slug === "iris")!;
const irisUnits = units.filter((u) => u.building === "iris");

const floors = [2, 3, 4];

export default function IrisFloorPlansPage() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
          {building.name} Floor Plans
        </h1>
        <p className="text-gray-600 mb-2">
          {building.totalUnits} residences across {floors.length} residential floors.
        </p>
        <p className="text-sm text-gray-500 mb-12">
          {building.address}
        </p>

        {floors.map((floor) => {
          const floorUnits = irisUnits.filter((u) => u.floor === floor);
          return (
            <div key={floor} className="mb-16">
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Floor {floor}
                <span className="text-sm font-normal text-gray-500 ml-3">
                  {floorUnits.length} units
                </span>
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {floorUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-baseline justify-between mb-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        Unit {unit.number}
                      </h3>
                      <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded-full">
                        {unit.bedrooms} Bed / {unit.bathrooms} Bath
                      </span>
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Size</span>
                        <span className="font-medium text-gray-900">
                          {unit.sqft?.toLocaleString()} sq ft
                        </span>
                      </div>
                    </div>

                    {unit.features && unit.features.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {unit.features.map((feature) => (
                          <span
                            key={feature}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link
                      href={`/contact?unit=${unit.number}&building=iris`}
                      className="mt-4 block text-center text-sm text-brand-600 hover:text-brand-700 font-medium py-2 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors"
                    >
                      Inquire About Unit {unit.number}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
