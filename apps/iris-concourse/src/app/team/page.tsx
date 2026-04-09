import type { Metadata } from "next";
import Image from "next/image";
import LandingNav from "@/components/landing-nav";
import projectData from "@/data/project.json";

export const metadata: Metadata = {
  title: "Team | Concourse & Iris, Austin",
  description:
    "Meet the team behind Concourse & Iris — developed by InTown Homes and sold by MODUS Development Services in Austin's Mueller neighborhood.",
};

function TeamHeadshot({ name, image, objectPosition = "center" }: { name: string; image?: string; objectPosition?: string }) {
  if (image) {
    return (
      <div className="w-28 h-28 rounded-full overflow-hidden bg-brand-200">
        <Image
          src={image}
          alt={name}
          width={224}
          height={224}
          className="w-full h-full object-cover"
          style={{ objectPosition }}
        />
      </div>
    );
  }
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");
  return (
    <div className="w-28 h-28 rounded-full bg-brand-200 flex items-center justify-center">
      <span className="text-2xl font-heading font-bold text-brand-700">
        {initials}
      </span>
    </div>
  );
}

export default function TeamPage() {
  return (
    <>
      <LandingNav />

      {/* Page header */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-heading font-bold text-black mb-2">
            The Team
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Concourse &amp; Iris is brought to you by an experienced team of
            builders and new-home specialists dedicated to connecting buyers
            with exceptional urban living in Mueller.
          </p>
        </div>
      </section>

      {/* Developed by InTown Homes */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-[200px_1fr] gap-10 items-start">
            <a href="https://www.intownhomes.com" target="_blank" rel="noopener noreferrer" className="flex items-start justify-center pt-2">
              <Image
                src="/images/logos/intown-logo.svg"
                alt="InTown Homes"
                width={200}
                height={38}
                className="w-full max-w-[200px]"
              />
            </a>
            <div>
              <p className="text-sm font-medium text-brand-600 uppercase tracking-wide mb-2">
                Developer
              </p>
              <h2 className="text-3xl font-heading font-bold text-black mb-6">
                InTown Homes
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 1980 by Frank Liu, InTown Homes is an award-winning
                  luxury home builder active across Houston, Austin, and Dallas.
                  The company specializes in contemporary urban residences that
                  blend smart design, sustainable building practices, and prime
                  walkable locations.
                </p>
                <p>
                  InTown Homes assembles visionary teams of architects, builders,
                  and designers to develop distinct, design-driven communities in
                  vibrant locations. Their philosophy centers on bringing premier
                  luxe design and amenity-rich urban living within reach through
                  timeless architecture, innovative &ldquo;Smart Green
                  Healthy&rdquo; construction, and upscale finishes.
                </p>
              </div>
              <a
                href="https://www.intownhomes.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Visit InTown Homes
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sales by MODUS Development Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-[200px_1fr] gap-10 items-start">
            <a href="https://modusdevelopmentservices.com" target="_blank" rel="noopener noreferrer" className="flex items-start justify-center pt-2">
              <Image
                src="/images/logos/mds-logo.png"
                alt="MODUS Development Services"
                width={200}
                height={44}
                className="w-full max-w-[200px] invert"
              />
            </a>
            <div>
              <p className="text-sm font-medium text-brand-600 uppercase tracking-wide mb-2">
                Sales &amp; Marketing
              </p>
              <h2 className="text-3xl font-heading font-bold text-black mb-6">
                MODUS Development Services
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <a href="https://modusdevelopmentservices.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 transition-colors">MODUS Development Services</a>{" "}
                  (MDS) is Austin&apos;s new home infill source &mdash;
                  connecting homebuyers with the most vibrant new construction
                  infill communities coming to market. From first-time buyers to
                  seasoned homeowners, MDS guides every step of the new-home
                  journey with deep local expertise and a hands-on, concierge
                  approach.
                </p>
                <p>
                  As a dedicated division of{" "}
                  <a href="https://modusdevelopmentservices.com" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 transition-colors">MODUS Real Estate</a>,
                  MDS brings the full resources of a leading Austin brokerage to
                  every new residential development it represents &mdash;
                  bringing the most vibrant infill communities to market and
                  ensuring buyers feel informed, supported, and confident from
                  first visit to closing day.
                </p>
              </div>
              <a
                href="https://modusdevelopmentservices.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Visit MODUS Development Services
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sales Team */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-black mb-2">
            Your Sales Team
          </h2>
          <p className="text-gray-600 mb-10">
            Have questions or ready to schedule a tour? Our on-site team is here
            to help.
          </p>

          <div className="grid sm:grid-cols-3 gap-8 mb-10">
            {projectData.salesTeam.map((member) => (
              <div key={member.name} className="flex flex-col items-center text-center">
                <TeamHeadshot name={member.name} image={member.image} objectPosition={(member as Record<string, string>).imagePosition} />
                <h3 className="mt-4 text-lg font-semibold text-black">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-500">{member.title}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-600">
            <a
              href="mailto:IRISCC@modusrealestate.com"
              className="hover:text-black transition-colors"
            >
              IRISCC@modusrealestate.com
            </a>
            <span className="hidden sm:inline text-gray-300">|</span>
            <a
              href="tel:+17373992309"
              className="hover:text-black transition-colors"
            >
              (737) 399-2309
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
