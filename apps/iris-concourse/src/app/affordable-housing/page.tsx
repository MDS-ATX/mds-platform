import type { Metadata } from "next";
import LandingNav from "@/components/landing-nav";

export const metadata: Metadata = {
  title: "Affordable & Workforce Housing | Concourse & Iris, Austin",
  description:
    "Learn about affordable and workforce housing options and eligibility at Concourse & Iris in Austin's Mueller neighborhood.",
};

export default function AffordableHousingPage() {
  return (
    <>
      <LandingNav />

      {/* Page header */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-heading font-bold text-black mb-2">
            Affordable &amp; Workforce Housing
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Concourse &amp; Iris includes homes designated for affordable and
            workforce housing as part of Mueller&apos;s commitment to an
            inclusive, mixed-income community.
          </p>
        </div>
      </section>

      {/* Details + Homebase */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <p className="text-gray-600 leading-relaxed mb-6">
            Select homes within Concourse and Iris are offered at below-market
            pricing to qualifying buyers. Eligibility is based on household
            income limits set by the City of Austin. Buyers must also complete a
            HUD-certified homebuyer education course, obtain pre-qualification
            from a participating lender, and agree to resale restrictions
            including owner-occupancy and limited appreciation.
          </p>
          <p className="text-gray-600 leading-relaxed mb-8">
            The program is administered by{" "}
            <a
              href="https://www.homebasetexas.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:text-brand-700 transition-colors"
            >
              Homebase Texas
            </a>
            , a nonprofit dedicated to permanent affordable homeownership in
            Austin. Current eligibility criteria, income thresholds, and program
            details are available on their site.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
            <a
              href="https://www.homebasetexas.org/eligibility"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              Income eligibility
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
            <a
              href="https://www.homebasetexas.org/program-requirements"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
            >
              Program requirements
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
          <a
            href="https://www.homebasetexas.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Visit Homebase Texas
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
          <p className="mt-3 text-xs text-gray-400">
            You will be redirected to a third-party website. Concourse &amp; Iris
            is not responsible for the content of external sites.
          </p>
        </div>
      </section>
    </>
  );
}
