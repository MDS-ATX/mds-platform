import { notFound } from "next/navigation";
import buildings from "@/data/buildings.json";
import LandingNav from "@/components/landing-nav";
import BuildingSubNav from "@/components/building-sub-nav";

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

  return (
    <>
      <LandingNav />
      <BuildingSubNav slug={building.slug} buildingName={building.name} />
      {children}
    </>
  );
}
