import type { Metadata } from "next";
import LandingNav from "@/components/landing-nav";

export const metadata: Metadata = {
  title: "Team | Iris & Concourse, Austin",
  description:
    "Meet the team behind Iris & Concourse — developed by InTown Homes and sold by MODUS Real Estate in Austin's Mueller neighborhood.",
};

export default function TeamPage() {
  return (
    <>
      <LandingNav />

      {/* Page header */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
            The Team
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Iris &amp; Concourse is brought to life by an experienced team of
            developers and real estate professionals dedicated to creating
            exceptional urban living in Mueller.
          </p>
        </div>
      </section>

      {/* Developed by InTown Homes */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-brand-600 uppercase tracking-wide mb-2">
              Developer
            </p>
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
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
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
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
      </section>

      {/* Sold by MODUS Real Estate */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-brand-600 uppercase tracking-wide mb-2">
              Sales
            </p>
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
              MODUS Real Estate
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                MODUS Real Estate is an Austin-based brokerage that combines
                marketing, technology, and personalized attention to deliver a
                client-centric real estate experience. Known for their
                innovative approach and entrepreneurial spirit, the MODUS team
                operates on a distinctive &ldquo;MODUS Operandi&rdquo; that
                sets them apart from traditional agencies.
              </p>
              <p>
                Serving neighborhoods across Austin including Mueller, East
                Austin, Zilker, and beyond, MODUS offers full-service
                residential and commercial real estate with a focus on new
                construction and community building.
              </p>
            </div>
            <a
              href="https://modusatx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              Visit MODUS Real Estate
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
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
              Get in Touch
            </h2>
            <p className="text-gray-600 mb-10">
              Interested in learning more about Iris &amp; Concourse? Fill out
              the form below and a member of our team will be in touch.
            </p>

            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full px-8 py-4 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
              >
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
