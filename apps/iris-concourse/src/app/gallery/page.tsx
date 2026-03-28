export default function GalleryPage() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
          Gallery
        </h1>
        <p className="text-gray-600 mb-12">
          Photos and renderings of Iris & Concourse.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Placeholder gallery grid */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-gray-100 rounded-xl flex items-center justify-center"
            >
              <span className="text-gray-400 text-sm">Coming soon</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
