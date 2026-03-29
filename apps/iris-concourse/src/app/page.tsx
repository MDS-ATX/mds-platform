import Link from "next/link";
import Image from "next/image";
import buildings from "@/data/buildings.json";
import LandingNav from "@/components/landing-nav";
import MapSection from "@/components/map-section";

export default function HomePage() {
  const mapBuildings = buildings.map((b) => ({
    lat: b.coordinates.lat,
    lng: b.coordinates.lng,
    label: b.name,
    href: `/${b.slug}`,
  }));

  return (
    <>
      <LandingNav />

      {/* Intro heading */}
      <section className="py-14 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
            Mueller, Austin
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900">
            Mueller&apos;s Two Newest Condominiums
          </h1>
        </div>
      </section>

      {/* Two building tiles */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {buildings.map((building) => (
              <div key={building.slug} className="group">
                <Link href={`/${building.slug}`} className="block">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-5">
                    <Image
                      src={building.heroImage}
                      alt={`${building.name} at Mueller`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>
                </Link>
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-1">
                  {building.name}
                </h2>
                <p className="text-gray-500 text-sm mb-4">{building.tagline}</p>
                <Link
                  href={`/${building.slug}`}
                  className="inline-block px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Explore {building.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            Mueller, Austin
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-xl">
            Two distinctive residences in one of Austin&apos;s most walkable
            and vibrant neighborhoods.
          </p>
          <MapSection buildings={mapBuildings} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Interested?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Join our interest list for updates on availability and exclusive
            early access.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
