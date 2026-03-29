import { notFound } from "next/navigation";
import buildings from "@/data/buildings.json";
import units from "@/data/units.json";
import ResidencesClient from "@/components/residences-client";

export function generateStaticParams() {
  return buildings.map((b) => ({ building: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ building: string }>;
}) {
  const { building: slug } = await params;
  const building = buildings.find((b) => b.slug === slug);
  if (!building) return {};
  return {
    title: `${building.name} Residences | Condos at Mueller, Austin`,
    description: `Browse ${building.totalUnits} residences at ${building.name}. Filter by bedroom count and view floor plans.`,
  };
}

export default async function ResidencesPage({
  params,
}: {
  params: Promise<{ building: string }>;
}) {
  const { building: slug } = await params;
  const building = buildings.find((b) => b.slug === slug);
  if (!building) notFound();

  const buildingUnits = units.filter((u) => u.building === slug);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
          {building.name} Residences
        </h1>
        <p className="text-gray-600 mb-2">
          {building.totalUnits} residences across{" "}
          {building.stories - 1} residential floor{building.stories - 1 > 1 ? "s" : ""}.
        </p>
        <p className="text-sm text-gray-500 mb-10">{building.address}</p>

        <ResidencesClient
          units={buildingUnits}
          building={{ slug: building.slug, name: building.name }}
        />
      </div>
    </section>
  );
}
