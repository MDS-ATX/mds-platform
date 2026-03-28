import Link from "next/link";
import projectData from "@/data/project.json";
import buildings from "@/data/buildings.json";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <p className="text-brand-400 font-medium tracking-wide uppercase text-sm mb-4">
              New Condos in {projectData.location.neighborhood},{" "}
              {projectData.location.city}
            </p>
            <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6">
              {projectData.name}
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              {projectData.tagline}
            </p>
            <p className="text-gray-400 mb-8 max-w-2xl">
              {projectData.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/pricing"
                className="px-8 py-4 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                View Pricing
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                Schedule a Tour
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Buildings Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              Two Communities, One Vision
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover your ideal home in one of two distinctive residences by{" "}
              {projectData.developer.name}.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {buildings.map((building) => (
              <Link
                key={building.slug}
                href={`/${building.slug}`}
                className="group block bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[16/10] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">
                    Rendering coming soon
                  </span>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {building.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{building.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>{building.totalUnits} Residences</span>
                    <span>{building.stories} Stories</span>
                    <span>
                      From $
                      {Math.min(
                        ...building.unitTypes.map((u) => u.priceRange.min)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Location Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
            Live in {projectData.location.neighborhood}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            One of Austin&apos;s most walkable and vibrant neighborhoods. Parks,
            dining, shopping, and entertainment — all at your doorstep.
          </p>
          <Link
            href="/neighborhood"
            className="inline-block px-8 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Explore the Neighborhood
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Interested?
          </h2>
          <p className="text-brand-100 max-w-xl mx-auto mb-8">
            Join our interest list to receive updates on pricing, availability,
            and exclusive early access opportunities.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-brand-700 font-medium rounded-lg hover:bg-brand-50 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
