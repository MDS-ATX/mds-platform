import { notFound } from "next/navigation";
import buildings from "@/data/buildings.json";
import BuildingNav from "@/components/building-nav";

const validSlugs = buildings.map((b) => b.slug);

export function generateStaticParams() {
  return validSlugs.map((slug) => ({ building: slug }));
}

export default async function BuildingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ building: string }>;
}) {
  const { building: slug } = await params;

  if (!validSlugs.includes(slug)) {
    notFound();
  }

  const building = buildings.find((b) => b.slug === slug)!;
  const otherBuilding = buildings.find((b) => b.slug !== slug)!;

  return (
    <>
      <BuildingNav
        building={{ name: building.name, slug: building.slug }}
        otherBuilding={{
          name: otherBuilding.name,
          slug: otherBuilding.slug,
        }}
      />
      {children}
    </>
  );
}
