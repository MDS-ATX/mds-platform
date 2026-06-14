"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";
type Building = "concourse" | "iris";
type VisitorType = "buyer" | "agent";
type YesNo = "no" | "yes";

const BUILDINGS: { key: Building; label: string; sub: string }[] = [
  { key: "concourse", label: "Concourse", sub: "3900 Berkman" },
  { key: "iris", label: "Iris", sub: "5025 Mueller Blvd" },
];

const VISITOR_TYPES: { key: VisitorType; label: string }[] = [
  { key: "buyer", label: "Buyer" },
  { key: "agent", label: "Agent" },
];

export function OpenHouseForm() {
  const [building, setBuilding] = useState<Building>("concourse");
  const [visitorType, setVisitorType] = useState<VisitorType>("buyer");
  const [workingWithAgent, setWorkingWithAgent] = useState<YesNo>("no");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement).value.trim(),
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
      building,
      visitorType,
      workingWithAgent: visitorType === "buyer" ? workingWithAgent : undefined,
    };

    try {
      const res = await fetch("/api/admin/open-house", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => null);
        throw new Error(b?.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-brand-200 bg-white p-10 text-center">
        <div className="mb-2 text-2xl font-heading font-bold text-black">Thanks — you&apos;re signed in!</div>
        <p className="text-brand-600">The lead was sent to our team.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-md bg-black px-6 py-2.5 font-medium text-white transition-colors hover:bg-brand-800"
        >
          Sign in another visitor
        </button>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-md border border-brand-200 px-4 py-3 text-black outline-none focus:border-black";
  const labelCls = "mb-1.5 block text-sm font-medium text-brand-800";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-brand-200 bg-white p-6 sm:p-8">
      {/* Building toggle — which one we're sitting at */}
      <div>
        <div className={labelCls}>Open house at</div>
        <div className="grid grid-cols-2 gap-2">
          {BUILDINGS.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => setBuilding(b.key)}
              className={`rounded-md border px-4 py-3 text-left transition-colors ${
                building === b.key
                  ? "border-black bg-black text-white"
                  : "border-brand-200 text-brand-700 hover:border-brand-400"
              }`}
            >
              <div className="text-base font-semibold">{b.label}</div>
              <div className={`text-xs ${building === b.key ? "text-brand-300" : "text-brand-500"}`}>{b.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Buyer vs Agent */}
      <div>
        <div className={labelCls}>Visitor is a</div>
        <div className="grid grid-cols-2 gap-2">
          {VISITOR_TYPES.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setVisitorType(v.key)}
              className={`rounded-md border px-4 py-3 text-base font-semibold transition-colors ${
                visitorType === v.key
                  ? "border-black bg-black text-white"
                  : "border-brand-200 text-brand-700 hover:border-brand-400"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Only relevant for buyers — are they already working with an agent? */}
      {visitorType === "buyer" && (
        <div>
          <div className={labelCls}>Working with an agent?</div>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: "no", label: "No" },
              { key: "yes", label: "Yes" },
            ] as const).map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setWorkingWithAgent(o.key)}
                className={`rounded-md border px-4 py-3 text-base font-semibold transition-colors ${
                  workingWithAgent === o.key
                    ? "border-black bg-black text-white"
                    : "border-brand-200 text-brand-700 hover:border-brand-400"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className={labelCls}>First name *</label>
          <input id="firstName" name="firstName" type="text" required autoComplete="off" className={inputCls} />
        </div>
        <div>
          <label htmlFor="lastName" className={labelCls}>Last name *</label>
          <input id="lastName" name="lastName" type="text" required autoComplete="off" className={inputCls} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelCls}>Email *</label>
          <input id="email" name="email" type="email" required autoComplete="off" className={inputCls} />
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>Phone *</label>
          <input id="phone" name="phone" type="tel" required autoComplete="off" className={inputCls} />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelCls}>Notes</label>
        <textarea id="message" name="message" rows={3} className={`${inputCls} resize-none`} />
      </div>

      {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-md bg-black px-6 py-4 text-base font-medium text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "submitting" ? "Submitting…" : "Sign in visitor"}
      </button>
    </form>
  );
}
