import Link from "next/link";
import buildings from "@/data/buildings.json";
import units from "@/data/units.json";

const building = buildings.find((b) => b.slug === "concourse")!;
const concourseUnits = units.filter((u) => u.building === "concourse");

const floors = [2, 3];

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

export default function ConcourseFloorPlansPage() {
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
          const floorUnits = concourseUnits.filter((u) => u.floor === floor);
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
                      {unit.designation && (
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${designationStyles[unit.designation] || ""}`}
                        >
                          {designationLabels[unit.designation]}
                        </span>
                      )}
                    </div>

                    {unit.bedrooms != null && unit.sqft ? (
                      <div className="space-y-1.5 text-sm">
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
                      <p className="text-sm text-gray-400 italic">
                        Floor plan details coming soon
                      </p>
                    )}

                    <Link
                      href={`/contact?unit=${unit.number}&building=concourse`}
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
