"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BuildingNavProps {
  building: { name: string; slug: string };
  otherBuilding: { name: string; slug: string };
}

export default function BuildingNav({
  building,
  otherBuilding,
}: BuildingNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { label: "Overview", href: `/${building.slug}` },
    { label: "Residences", href: `/${building.slug}/residences` },
    { label: "Gallery", href: `/${building.slug}/gallery` },
    { label: "Neighborhood", href: "/neighborhood" },
    { label: "Contact", href: `/contact?building=${building.slug}` },
  ];

  const isActive = (href: string) => {
    if (href.includes("?")) return pathname === href.split("?")[0];
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Building name */}
          <Link
            href={`/${building.slug}`}
            className="flex flex-col"
          >
            <span className="text-xl font-heading font-bold text-gray-900">
              {building.name}
            </span>
            <span className="text-xs text-gray-500 -mt-0.5">at Mueller</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Building switcher + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              href={`/${otherBuilding.slug}`}
              className="hidden sm:inline-flex text-xs font-medium px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Switch to {otherBuilding.name}
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2"
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-100 pt-3 space-y-2">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block py-2 text-sm font-medium ${
                  isActive(link.href)
                    ? "text-gray-900"
                    : "text-gray-500"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={`/${otherBuilding.slug}`}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium text-brand-600"
            >
              Switch to {otherBuilding.name}
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
