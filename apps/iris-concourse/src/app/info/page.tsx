import type { Metadata } from "next";
import LandingNav from "@/components/landing-nav";

export const metadata: Metadata = {
  title: "Info | Concourse & Iris, Austin",
  description:
    "HOA fees, tax rates, lending incentives, and brokerage details for Concourse & Iris condos in Austin's Mueller neighborhood.",
};

export default function InfoPage() {
  return (
    <>
      <LandingNav />

      {/* Page header */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-heading font-bold text-black mb-2">
            Info
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Key details about ownership, fees, and financing at Concourse &amp;
            Iris.
          </p>
        </div>
      </section>

      {/* HOA Fees */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-black mb-6">
            HOA Fees
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-2">
                Concourse
              </h3>
              <p className="text-gray-500 text-sm">Details coming soon</p>
            </div>
            <div className="p-6 bg-white border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-2">Iris</h3>
              <p className="text-gray-500 text-sm">Details coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Management Company */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-black mb-6">
            Management Company
          </h2>
          <div className="space-y-3">
            <p className="font-semibold text-black">Goodwin &amp; Company</p>
            <p className="text-gray-700">
              At Goodwin &amp; Company, we specialize in providing comprehensive
              condominium property management in Texas, Louisiana, and Colorado.
              Our goal is to ensure that every condo thrives by offering
              customized solutions designed to meet the unique needs of each
              association.
            </p>
            <p className="text-gray-700">
              With over 45 years of experience and a dedicated team of
              condominium association property managers, we strive to enhance the
              quality of life for all residents while ensuring the efficient
              operation of the association.
            </p>
            <a
              href="https://goodwin-co.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-brand-600 underline hover:text-brand-700 text-sm"
            >
              goodwin-co.com
            </a>
          </div>
        </div>
      </section>

      {/* Tax Rates */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-black mb-4">
            Tax Rates
          </h2>
          <p className="text-gray-500">Details coming soon</p>
        </div>
      </section>

      {/* Lending Incentives */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-black mb-4">
            Lending Incentives
          </h2>
          <p className="text-gray-500">Details coming soon</p>
        </div>
      </section>

      {/* Brokerage Details */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-black mb-6">
            Brokerage Details
          </h2>
          <div className="space-y-3 text-gray-700">
            <p className="font-semibold text-black">MODUS Real Estate</p>
            <p>2400 Webberville Road C100, Austin, TX 78702</p>
            <p>(737) 399-2309</p>
            <p>TREC #9013412</p>
            <a
              href="https://modusdevelopmentservices.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-brand-600 underline hover:text-brand-700 text-sm"
            >
              MODUS Development Services
            </a>
          </div>
        </div>
      </section>

      {/* Agent Compensation */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-black mb-4">
            Agent Compensation
          </h2>
          <p className="text-gray-700">
            3% co-op commission offered to cooperating brokerages.
          </p>
        </div>
      </section>
    </>
  );
}
