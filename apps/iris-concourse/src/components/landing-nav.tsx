import Link from "next/link";

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex flex-col">
            <span className="text-xl font-heading font-bold text-gray-900">
              Iris & Concourse
            </span>
            <span className="text-xs text-gray-500 -mt-0.5">
              by InTown Homes
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/neighborhood"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Neighborhood
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
