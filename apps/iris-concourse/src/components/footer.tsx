import Image from "next/image";
import Link from "next/link";
import projectData from "@/data/project.json";
import buildings from "@/data/buildings.json";

export function Footer() {
  return (
    <footer className="bg-black text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Project info */}
          <div>
            <h3 className="text-white font-heading text-lg font-bold mb-2">
              {projectData.name}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {projectData.location.neighborhood},{" "}
              {projectData.location.city}, {projectData.location.state}
            </p>
            <p className="text-sm text-gray-400">
              Developed by {projectData.developer.name}
            </p>
          </div>

          {/* Building links */}
          {buildings.map((b) => (
            <div key={b.slug}>
              <h4 className="text-white font-medium mb-2">{b.name}</h4>
              <p className="text-xs text-gray-500 mb-4">{b.address}</p>
              <div className="flex flex-col gap-2">
                <Link href={`/${b.slug}`} className="text-sm hover:text-white transition-colors">
                  Overview
                </Link>
                <Link href={`/${b.slug}/residences`} className="text-sm hover:text-white transition-colors">
                  Residences
                </Link>
                <Link href={`/${b.slug}/gallery`} className="text-sm hover:text-white transition-colors">
                  Gallery
                </Link>
              </div>
            </div>
          ))}

          {/* Shared + Contact */}
          <div>
            <h4 className="text-white font-medium mb-4">Get in Touch</h4>
            <div className="flex flex-col gap-2 mb-4">
              <Link href="/neighborhood" className="text-sm hover:text-white transition-colors">
                Neighborhood
              </Link>
              <Link href="/info" className="text-sm hover:text-white transition-colors">
                Info
              </Link>
              <Link href="/team" className="text-sm hover:text-white transition-colors">
                Team
              </Link>
              <Link href="/contact" className="text-sm hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/affordable-housing" className="text-sm hover:text-white transition-colors">
                Affordable / Workforce Housing
              </Link>
            </div>
            <Link
              href="/contact"
              className="inline-block px-6 py-2 bg-white text-black text-sm font-medium  hover:bg-gray-100 transition-colors"
            >
              Schedule a Tour
            </Link>
          </div>
        </div>

        {/* Powered by + Contact */}
        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              Powered by
            </span>
            <a
              href="https://modusrealestate.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/logos/modus-logo-white.webp"
                alt="MODUS Real Estate"
                width={140}
                height={28}
                className="opacity-70 hover:opacity-100 transition-opacity"
              />
            </a>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-1 text-xs text-gray-400">
            <a
              href="mailto:IRISCC@modusrealestate.com"
              className="hover:text-white transition-colors"
            >
              IRISCC@modusrealestate.com
            </a>
            <a
              href="tel:+17373992309"
              className="hover:text-white transition-colors"
            >
              (737) 399-2309
            </a>
          </div>
        </div>

        {/* Legal + Equal Housing */}
        <div className="mt-6 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-gray-500" style={{ fontSize: "10pt" }}>
            <a
              href="https://www.dropbox.com/scl/fi/2gv81xmsabf06qr8wywbw/Phillip_-Information-About-Brokerage-Services-1.pdf?rlkey=sbehb8dikbocpy6nndpthsthn&e=4&st=8pbzylv3&dl=0"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              TREC Information About Brokerage Services
            </a>
            <span className="hidden sm:inline text-gray-700">|</span>
            <a
              href="https://www.dropbox.com/scl/fi/uat42pcnn90mtk0ao6vrm/TREC-CPN.pdf?rlkey=wnsqw1nktda4la577im1oodug&e=4&st=6041hrkh&dl=0"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              TREC Consumer Protection Notice
            </a>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} {projectData.brokerage}. A{" "}
              <a
                href="https://modusdevelopmentservices.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                MODUS Development Services
              </a>{" "}
              Project.
            </p>
            <Image
              src="/images/logos/equal-housing-white.webp"
              alt="Equal Housing Opportunity"
              width={24}
              height={24}
              className="opacity-60"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
