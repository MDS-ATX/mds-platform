import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import buildings from "@/data/buildings.json";
import units from "@/data/units.json";

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

export function generateStaticParams() {
  return units.map((u) => ({ building: u.building, unit: u.number }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ building: string; unit: string }>;
}) {
  const { building: slug, unit: number } = await params;
  const building = buildings.find((b) => b.slug === slug);
  const unit = units.find((u) => u.building === slug && u.number === number);
  if (!building || !unit) return {};

  const layout =
    unit.bedrooms != null
      ? `${unit.bedrooms} Bed / ${unit.bathrooms} Bath${unit.sqft ? ` · ${unit.sqft.toLocaleString()} sq ft` : ""}`
      : "Floor plan";

  return {
    title: `Unit ${unit.number} · ${building.name} | Condos at Mueller, Austin`,
    description: `Floor plan and details for Unit ${unit.number} at ${building.name} — ${layout}.`,
    openGraph: {
      title: `Unit ${unit.number} · ${building.name}`,
      description: layout,
      images: [`/images/floor-plans/${unit.building}-${unit.number}.png`],
    },
  };
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ building: string; unit: string }>;
}) {
  const { building: slug, unit: number } = await params;
  const building = buildings.find((b) => b.slug === slug);
  if (!building) notFound();

  const unit = units.find((u) => u.building === slug && u.number === number);
  if (!unit) notFound();

  const floorPlanSrc = `/images/floor-plans/${unit.building}-${unit.number}.png`;
  const designation = (unit as { designation?: string }).designation;
  const features = (unit as { features?: string[] }).features;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8">
          <Link href={`/${building.slug}/residences`} className="hover:text-black">
            {building.name} Residences
          </Link>
          <span className="mx-2">/</span>
          <span className="text-black">Unit {unit.number}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Floor plan */}
          <div>
            <div className="relative w-full aspect-[3/4] bg-gray-50 overflow-hidden border border-gray-200">
              <Image
                src={floorPlanSrc}
                alt={`Floor plan for Unit ${unit.number} at ${building.name}`}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                unoptimized
              />
            </div>
            <a
              href={floorPlanSrc}
              download={`${unit.building}-unit-${unit.number}-floor-plan.png`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download floor plan
            </a>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-heading font-bold text-black">
                Unit {unit.number}
              </h1>
              {designation && (
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${designationStyles[designation] || ""}`}
                >
                  {designationLabels[designation]}
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-1">{building.name}</p>
            <p className="text-sm text-gray-500 mb-8">{building.address}</p>

            {unit.bedrooms != null ? (
              <dl className="divide-y divide-gray-100 border-y border-gray-100 mb-8">
                <div className="flex justify-between py-3">
                  <dt className="text-gray-500">Layout</dt>
                  <dd className="font-medium text-black">
                    {unit.bedrooms} Bed / {unit.bathrooms} Bath
                  </dd>
                </div>
                {unit.sqft && (
                  <div className="flex justify-between py-3">
                    <dt className="text-gray-500">Size</dt>
                    <dd className="font-medium text-black">
                      {unit.sqft.toLocaleString()} sq ft
                    </dd>
                  </div>
                )}
                <div className="flex justify-between py-3">
                  <dt className="text-gray-500">Floor</dt>
                  <dd className="font-medium text-black">{unit.floor}</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-gray-400 italic mb-8">
                Floor plan details coming soon
              </p>
            )}

            {features && features.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-3">
                  Features
                </h2>
                <ul className="space-y-1.5">
                  {features.map((f) => (
                    <li key={f} className="text-sm text-black flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-black" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              href={`/contact?unit=${unit.number}&building=${building.slug}`}
              className="inline-block text-center bg-black text-white text-sm font-medium px-8 py-3 hover:bg-gray-800 transition-colors"
            >
              Inquire About Unit {unit.number}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
