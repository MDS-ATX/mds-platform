import type { Metadata } from "next";
import LandingNav from "@/components/landing-nav";

export const metadata: Metadata = {
  title: "Preferred Lenders | Concourse & Iris, Austin",
  description:
    "Preferred lenders for financing your new home at Concourse & Iris in Austin's Mueller neighborhood.",
};

type Lender = {
  name: string;
  contact: string;
  phones: { label: string; number: string }[];
  email: string;
  website: { label: string; href: string };
};

const lenders: Lender[] = [
  {
    name: "Rate Advantage",
    contact: "Justin Hrabovsky",
    phones: [
      { label: "Cell", number: "512-665-8353" },
      { label: "Office", number: "737-260-0099" },
    ],
    email: "justin@rate-advantage.com",
    website: { label: "Rate-Advantage.com", href: "https://www.Rate-Advantage.com" },
  },
  {
    name: "Leaman Team",
    contact: "LoanPeople",
    phones: [
      { label: "Office", number: "512-710-1400" },
      { label: "Cell", number: "512-293-1239" },
    ],
    email: "LeamanTeam@LoanPeople.com",
    website: { label: "MaxLeaman.com", href: "https://www.MaxLeaman.com" },
  },
  {
    name: "The Medrano Team",
    contact: "David Medrano",
    phones: [{ label: "Phone", number: "512-593-1684" }],
    email: "David.Medrano@53.com",
    website: { label: "MedranoTeam.com", href: "https://www.MedranoTeam.com" },
  },
];

function telHref(number: string) {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}

export default function PreferredLendersPage() {
  return (
    <>
      <LandingNav />

      {/* Page header */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-heading font-bold text-black mb-2">
            Preferred Lenders
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Our preferred lenders know Concourse &amp; Iris and are ready to help
            you find the right financing for your new home. Reach out to any of
            them to get started.
          </p>
        </div>
      </section>

      {/* Lender cards */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lenders.map((lender) => (
              <div
                key={lender.name}
                className="p-6 bg-white border border-gray-200 flex flex-col"
              >
                <h2 className="text-xl font-heading font-bold text-black">
                  {lender.name}
                </h2>
                <p className="text-gray-700 font-medium mb-4">{lender.contact}</p>

                <dl className="space-y-2 text-sm flex-1">
                  {lender.phones.map((phone) => (
                    <div key={phone.label} className="flex gap-2">
                      <dt className="text-gray-500 w-14 shrink-0">
                        {phone.label}
                      </dt>
                      <dd>
                        <a
                          href={telHref(phone.number)}
                          className="text-gray-800 hover:text-brand-600"
                        >
                          {phone.number}
                        </a>
                      </dd>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <dt className="text-gray-500 w-14 shrink-0">Email</dt>
                    <dd className="min-w-0 break-words">
                      <a
                        href={`mailto:${lender.email}`}
                        className="text-gray-800 hover:text-brand-600"
                      >
                        {lender.email}
                      </a>
                    </dd>
                  </div>
                </dl>

                <a
                  href={lender.website.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-brand-600 underline hover:text-brand-700 text-sm"
                >
                  {lender.website.label}
                </a>
              </div>
            ))}
          </div>

          <p className="text-gray-400 text-xs max-w-2xl mt-10">
            These lenders are provided as a convenience. You are free to choose
            any lender you wish. Concourse &amp; Iris and MODUS Real Estate do
            not require you to use any particular lender and make no
            representation regarding the rates, terms, or services offered.
          </p>
        </div>
      </section>
    </>
  );
}
