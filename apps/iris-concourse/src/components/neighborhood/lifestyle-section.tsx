import NeighborhoodImage from "./neighborhood-image";

interface LifestyleFeature {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}

interface LifestyleSectionProps {
  title: string;
  description: string;
  features: LifestyleFeature[];
}

export default function LifestyleSection({
  title,
  description,
  features,
}: LifestyleSectionProps) {
  return (
    <section id="lifestyle" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-gray-600 mb-10 max-w-2xl">{description}</p>

        <div className="space-y-8">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="grid md:grid-cols-2 gap-8 items-center"
            >
              <div className={i % 2 === 1 ? "md:order-2" : ""}>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              <div
                className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 ${
                  i % 2 === 1 ? "md:order-1" : ""
                }`}
              >
                <NeighborhoodImage
                  src={feature.image}
                  alt={feature.imageAlt}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
