import { notFound } from "next/navigation";
import Image from "next/image";
import buildings from "@/data/buildings.json";
import galleryData from "@/data/gallery.json";
import GalleryGrid from "@/components/gallery-grid";

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
    title: `${building.name} Gallery | Photos at Mueller, Austin`,
    description: `Photo gallery for ${building.name} residences at Mueller.`,
  };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ building: string }>;
}) {
  const { building: slug } = await params;
  const building = buildings.find((b) => b.slug === slug);
  if (!building) notFound();

  const photos = galleryData.filter((p) => p.building === slug);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
          {building.name} Gallery
        </h1>
        <p className="text-gray-600 mb-10">
          Photos of {building.name} residences at Mueller.
        </p>

        {photos.length > 0 ? (
          <GalleryGrid images={photos} />
        ) : (
          <div className="text-center py-16">
            <div className="relative w-full max-w-lg mx-auto aspect-[16/9] rounded-xl overflow-hidden mb-6">
              <Image
                src={building.heroImage}
                alt={`${building.name} rendering`}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
            <p className="text-gray-500">
              Photos coming soon. Check back for updates.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
