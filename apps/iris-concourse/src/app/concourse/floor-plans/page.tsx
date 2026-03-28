import buildings from "@/data/buildings.json";

const building = buildings.find((b) => b.slug === "concourse")!;

export default function ConcourseFloorPlansPage() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
          {building.name} Floor Plans
        </h1>
        <p className="text-gray-600 mb-12">
          Explore the available floor plans at {building.name}.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {building.unitTypes.map((unitType) => (
            <div
              key={unitType.name}
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">
                  Floor plan image coming soon
                </span>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {unitType.name}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {unitType.bedrooms} Bed / {unitType.bathrooms} Bath
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {unitType.sqftRange.min.toLocaleString()} - {unitType.sqftRange.max.toLocaleString()} sq ft
                  </span>
                  <span className="font-bold text-brand-600">
                    From ${unitType.priceRange.min.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
