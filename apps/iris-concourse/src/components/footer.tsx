import Link from "next/link";
import projectData from "@/data/project.json";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
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

          {/* Iris links */}
          <div>
            <h4 className="text-white font-medium mb-4">Iris</h4>
            <div className="flex flex-col gap-2">
              <Link href="/iris" className="text-sm hover:text-white transition-colors">
                Overview
              </Link>
              <Link href="/iris/residences" className="text-sm hover:text-white transition-colors">
                Residences
              </Link>
              <Link href="/iris/gallery" className="text-sm hover:text-white transition-colors">
                Gallery
              </Link>
            </div>
          </div>

          {/* Concourse links */}
          <div>
            <h4 className="text-white font-medium mb-4">Concourse</h4>
            <div className="flex flex-col gap-2">
              <Link href="/concourse" className="text-sm hover:text-white transition-colors">
                Overview
              </Link>
              <Link href="/concourse/residences" className="text-sm hover:text-white transition-colors">
                Residences
              </Link>
              <Link href="/concourse/gallery" className="text-sm hover:text-white transition-colors">
                Gallery
              </Link>
            </div>
          </div>

          {/* Shared + Contact */}
          <div>
            <h4 className="text-white font-medium mb-4">Get in Touch</h4>
            <div className="flex flex-col gap-2 mb-4">
              <Link href="/neighborhood" className="text-sm hover:text-white transition-colors">
                Neighborhood
              </Link>
              <Link href="/team" className="text-sm hover:text-white transition-colors">
                Team
              </Link>
              <Link href="/contact" className="text-sm hover:text-white transition-colors">
                Contact
              </Link>
            </div>
            <Link
              href="/contact"
              className="inline-block px-6 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Schedule a Tour
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {projectData.brokerage}. All
            rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            A MODUS Development Services Project
          </p>
        </div>
      </div>
    </footer>
  );
}
