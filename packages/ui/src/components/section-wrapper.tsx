import type { ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: "white" | "light" | "dark";
}

export function SectionWrapper({
  children,
  className = "",
  id,
  background = "white",
}: SectionWrapperProps) {
  const bgClasses = {
    white: "bg-white",
    light: "bg-gray-50",
    dark: "bg-modus-dark text-white",
  };

  return (
    <section id={id} className={`py-16 md:py-24 ${bgClasses[background]} ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
