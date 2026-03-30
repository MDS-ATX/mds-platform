"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BuildingSubNavProps {
  slug: string;
  buildingName: string;
}

export default function BuildingSubNav({ slug, buildingName }: BuildingSubNavProps) {
  const pathname = usePathname();

  const links = [
    { label: "Overview", href: `/${slug}` },
    { label: "Residences", href: `/${slug}/residences` },
    { label: "Gallery", href: `/${slug}/gallery` },
    { label: "Map", href: `/${slug}#map` },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="sticky top-16 z-30 bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 h-11">
          <span className="text-xs font-medium text-gray-400 mr-3 uppercase tracking-wider hidden sm:block">
            {buildingName}
          </span>
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isActive(link.href)
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-900 hover:bg-white/60"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
