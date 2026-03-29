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

      {/* Split-screen hero */}
      <section className="relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="text-center">
            <p className="text-white/90 text-sm font-medium tracking-widest uppercase mb-1 drop-shadow-lg">
              Mueller&apos;s Two Newest
            </p>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white drop-shadow-lg">
              Condominiums
            </h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 min-h-[80vh]">
          {buildings.map((building) => (
            <Link
              key={building.slug}
              href={`/${building.slug}`}
              className="relative min-h-[50vh] md:min-h-[80vh] flex items-end group overflow-hidden"
            >
              <Image
                src={building.heroImage}
                alt={`${building.name} at Mueller`}
                fill
                className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-75 brightness-[0.6]"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="relative z-10 p-8 md:p-12 w-full">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">
                  {building.name}
                </h2>
                <p className="text-white/80 text-sm mb-4 max-w-sm">
                  {building.tagline}
                </p>
                <span className="inline-block px-6 py-2.5 bg-white text-gray-900 text-sm font-medium rounded-lg group-hover:bg-gray-100 transition-colors">
                  Explore {building.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Map */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2 text-center">
            Mueller, Austin
          </h2>
          <p className="text-gray-600 text-center mb-8 max-w-xl mx-auto">
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
