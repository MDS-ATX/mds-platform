import neighborhoodData from "@/data/neighborhood.json";

export default function NeighborhoodPage() {
  // Group POIs by category
  const categories = neighborhoodData.pointsOfInterest.reduce(
    (acc, poi) => {
      if (!acc[poi.category]) acc[poi.category] = [];
      acc[poi.category].push(poi);
      return acc;
    },
    {} as Record<string, typeof neighborhoodData.pointsOfInterest>
  );

  return (
    <>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white mb-4">
            {neighborhoodData.name}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            {neighborhoodData.description}
          </p>
        </div>
      </section>

      {/* Scores */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {neighborhoodData.walkScore && (
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <p className="text-4xl font-bold text-brand-600">
                  {neighborhoodData.walkScore}
                </p>
                <p className="text-gray-600 mt-1">Walk Score</p>
              </div>
            )}
            {neighborhoodData.bikeScore && (
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <p className="text-4xl font-bold text-brand-600">
                  {neighborhoodData.bikeScore}
                </p>
                <p className="text-gray-600 mt-1">Bike Score</p>
              </div>
            )}
            {neighborhoodData.transitScore && (
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <p className="text-4xl font-bold text-brand-600">
                  {neighborhoodData.transitScore}
                </p>
                <p className="text-gray-600 mt-1">Transit Score</p>
              </div>
            )}
          </div>

          {/* Highlights */}
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Neighborhood Highlights
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-16">
            {neighborhoodData.highlights.map((highlight) => (
              <div
                key={highlight}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-brand-500 rounded-full shrink-0" />
                <span className="text-gray-700">{highlight}</span>
              </div>
            ))}
          </div>

          {/* Points of Interest */}
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
            Nearby
          </h2>
          <div className="space-y-8">
            {Object.entries(categories).map(([category, pois]) => (
              <div key={category}>
                <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                  {category}
                </h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {pois.map((poi) => (
                    <div
                      key={poi.name}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <p className="font-medium text-gray-900">{poi.name}</p>
                      {poi.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {poi.description}
                        </p>
                      )}
                      {poi.distance && (
                        <p className="text-xs text-brand-600 mt-2">
                          {poi.distance}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
