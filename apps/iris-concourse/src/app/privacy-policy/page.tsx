import LandingNav from "@/components/landing-nav";

export const metadata = {
  title: "Privacy Policy | Iris & Concourse",
  description:
    "Privacy Policy for the Iris & Concourse condominium communities in Mueller, Austin, TX.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <LandingNav />
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto prose prose-gray">
            <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              Effective Date: April 4, 2026
            </p>

            <p>
              This Privacy Policy describes how information is collected, used,
              and shared when you visit or interact with the Iris & Concourse
              website (the &ldquo;Site&rdquo;). Iris & Concourse is a
              residential condominium development by InTown Homes, marketed by
              MODUS Real Estate.
            </p>

            <h2>1. Information We Collect</h2>
            <p>
              We may collect the following types of information when you visit
              our Site or submit an inquiry:
            </p>
            <ul>
              <li>
                <strong>Personal Information You Provide:</strong> Name, email
                address, phone number, and any other information you voluntarily
                submit through our contact forms or other communications.
              </li>
              <li>
                <strong>Automatically Collected Information:</strong> IP address,
                browser type, operating system, referring URLs, pages visited,
                and the date and time of your visit. This information is
                collected through cookies, web beacons, and similar tracking
                technologies.
              </li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>
                Respond to your inquiries and provide information about Iris &
                Concourse residences.
              </li>
              <li>
                Send marketing communications, including emails, calls, and text
                messages, about the Iris & Concourse communities (with your
                consent).
              </li>
              <li>Improve our Site and marketing efforts.</li>
              <li>
                Comply with legal obligations and protect our rights.
              </li>
            </ul>

            <h2>3. How We Share Your Information</h2>
            <p>
              We may share your information with the following parties:
            </p>
            <ul>
              <li>
                <strong>Service Providers:</strong> Third-party companies that
                help us operate our Site, manage customer relationships, and
                deliver marketing communications (e.g., CRM platforms, email
                service providers).
              </li>
              <li>
                <strong>Development Partners:</strong> InTown Homes and MODUS
                Real Estate, as necessary to respond to your inquiries and
                provide information about the properties.
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law, court
                order, or governmental authority.
              </li>
            </ul>

            <h2>4. Links to Other Websites</h2>
            <p>
              Our Site may contain links to other websites that are not operated
              by us. We have no control over, and assume no responsibility for,
              the content, privacy policies, or practices of any third-party
              sites or services.
            </p>

            <h2>5. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to collect
              information about your browsing activity on our Site. Cookies are
              small data files stored on your device. You can instruct your
              browser to refuse all cookies or to indicate when a cookie is being
              sent. However, if you do not accept cookies, some parts of our Site
              may not function properly.
            </p>

            <h2>6. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to
              fulfill the purposes described in this Privacy Policy, unless a
              longer retention period is required or permitted by law.
            </p>

            <h2>7. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul>
              <li>
                Access the personal information we hold about you.
              </li>
              <li>
                Request correction of inaccurate or incomplete information.
              </li>
              <li>
                Request deletion of your personal information.
              </li>
              <li>
                Opt out of marketing communications at any time by replying
                &lsquo;stop&rsquo; to any text message, clicking the
                unsubscribe link in any email, or contacting us directly.
              </li>
            </ul>

            <h2>8. Security</h2>
            <p>
              We take reasonable measures to protect your personal information
              from unauthorized access, use, or disclosure. However, no method
              of transmission over the Internet or method of electronic storage
              is completely secure, and we cannot guarantee absolute security.
            </p>

            <h2>9. Children&apos;s Privacy</h2>
            <p>
              Our Site is not directed to individuals under the age of 13. We do
              not knowingly collect personal information from children under 13.
              If we become aware that we have collected personal information from
              a child under 13, we will take steps to delete such information.
            </p>

            <h2>10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with an updated effective date. We
              encourage you to review this Privacy Policy periodically.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or wish to
              exercise your rights, please contact us:
            </p>
            <ul>
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:mds@modusrealestate.com"
                  className="text-brand-600 underline hover:text-brand-700"
                >
                  mds@modusrealestate.com
                </a>
              </li>
              <li>
                <strong>Phone:</strong>{" "}
                <a
                  href="tel:5128837250"
                  className="text-brand-600 underline hover:text-brand-700"
                >
                  512.883.7250
                </a>
              </li>
              <li>
                <strong>Iris:</strong> 5025 Mueller Blvd, Austin, TX 78723
              </li>
              <li>
                <strong>Concourse:</strong> 3900 Berkman Dr, Austin, TX 78723
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
