import Image from "next/image";
import galleryData from "@/data/gallery.json";

export default function GalleryPage() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
          Gallery
        </h1>
        <p className="text-gray-600 mb-12">
          Photos of Iris & Concourse residences at Mueller.
        </p>

        {galleryData.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryData.map((photo, i) => (
              <div
                key={i}
                className="aspect-[4/3] relative rounded-xl overflow-hidden bg-gray-100"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-gray-100 rounded-xl flex items-center justify-center"
              >
                <span className="text-gray-400 text-sm">Coming soon</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
