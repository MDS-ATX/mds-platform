"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LandingNav from "@/components/landing-nav";
import buildings from "@/data/buildings.json";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  return (
    <Suspense>
      <ContactPageInner />
    </Suspense>
  );
}

function ContactPageInner() {
  const searchParams = useSearchParams();
  const unitParam = searchParams.get("unit");
  const buildingParam = searchParams.get("building");

  const buildingName = buildingParam
    ? buildingParam.charAt(0).toUpperCase() + buildingParam.slice(1)
    : null;

  const defaultMessage = unitParam && buildingName
    ? `Interested in ${buildingName} unit ${unitParam}`
    : "";

  const defaultInterestedIn = buildingParam || "general";

  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement).value,
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      interestedIn: (form.elements.namedItem("interestedIn") as HTMLSelectElement).value,
      hearAbout: (form.elements.namedItem("hearAbout") as HTMLSelectElement).value,
      workingWithAgent: (form.elements.namedItem("workingWithAgent") as RadioNodeList).value,
      isAgent: (form.elements.namedItem("isAgent") as RadioNodeList).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  }

  if (status === "success") {
    return (
      <>
        <LandingNav />
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-4xl font-heading font-bold text-black mb-4">
                Thank You!
              </h1>
              <p className="text-gray-600 text-lg">
                We&apos;ve received your inquiry. A member of our sales team will
                be in touch soon.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <LandingNav />
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-heading font-bold text-black mb-2">
              Get in Touch
            </h1>
            <p className="text-gray-600 mb-6">
              Interested in learning more about Concourse & Iris? Fill out the
              form below and a member of our sales team will be in touch.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {buildings.map((b) => (
                <div key={b.slug} className="p-4 bg-gray-50 ">
                  <p className="font-medium text-black text-sm">{b.name}</p>
                  <p className="text-gray-500 text-sm">{b.address}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full px-4 py-3 border border-gray-300  focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
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
                    className="w-full px-4 py-3 border border-gray-300  focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
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
                  className="w-full px-4 py-3 border border-gray-300  focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="w-full px-4 py-3 border border-gray-300  focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="interestedIn"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Interested In
                </label>
                <select
                  id="interestedIn"
                  name="interestedIn"
                  defaultValue={defaultInterestedIn}
                  className="w-full px-4 py-3 border border-gray-300  focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                >
                  <option value="general">General Information</option>
                  <option value="iris">Iris</option>
                  <option value="concourse">Concourse</option>
                  <option value="both">Both Buildings</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="hearAbout"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  How did you hear about us? *
                </label>
                <select
                  id="hearAbout"
                  name="hearAbout"
                  required
                  defaultValue=""
                  className="w-full px-4 py-3 border border-gray-300  focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
                >
                  <option value="" disabled>
                    Select one...
                  </option>
                  <option value="zillow">Zillow/Trulia</option>
                  <option value="mls">MLS</option>
                  <option value="realtor">REALTOR&reg;</option>
                  <option value="signs">Signs/Walk By/Drive By</option>
                  <option value="mailer">Mailer</option>
                  <option value="word-of-mouth">Word of Mouth</option>
                  <option value="email">Email</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">
                  Are you working with a real estate agent? *
                </legend>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="workingWithAgent"
                      value="no"
                      required
                      className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    No
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="workingWithAgent"
                      value="yes"
                      className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    Yes
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">
                  Are you a real estate agent? *
                </legend>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="isAgent"
                      value="no"
                      required
                      className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    No
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="isAgent"
                      value="yes"
                      className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    Yes
                  </label>
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Comments or Questions
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  defaultValue={defaultMessage}
                  className="w-full px-4 py-3 border border-gray-300  focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="consent" className="text-sm text-gray-600">
                  By selecting &ldquo;Stay Informed&rdquo;, you agree to be
                  contacted by the Concourse & Iris Sales Team via call, email,
                  and text. To opt-out, you can reply &lsquo;stop&rsquo; at any
                  time or click the unsubscribe link in the emails. Message and
                  data rates may apply. Please refer to our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-brand-600 underline hover:text-brand-700"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {status === "error" && (
                <p className="text-red-600 text-sm">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full px-8 py-4 bg-brand-600 text-white font-medium  hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? "Submitting..." : "Stay Informed"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
