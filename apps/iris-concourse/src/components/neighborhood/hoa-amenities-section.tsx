import NeighborhoodImage from "./neighborhood-image";

interface HoaAmenity {
  name: string;
  description: string;
  icon: string;
  image: string;
  imageAlt: string;
}

interface HoaAmenitiesSectionProps {
  title: string;
  description: string;
  items: HoaAmenity[];
}

export default function HoaAmenitiesSection({
  title,
  description,
  items,
}: HoaAmenitiesSectionProps) {
  return (
    <section id="community" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-xl p-8 mb-10 text-white">
          <h2 className="text-xl font-heading font-bold mb-3">{title}</h2>
          <p className="text-gray-300">{description}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.name}
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                <NeighborhoodImage
                  src={item.image}
                  alt={item.imageAlt}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
