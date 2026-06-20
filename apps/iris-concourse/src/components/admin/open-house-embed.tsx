import Link from "next/link";

// Embeds a JotForm open-house sign-in form full-page, with a back link.
export function OpenHouseEmbed({ agent, formId }: { agent: string; formId: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-50">
      <header className="border-b border-brand-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <h1 className="font-heading text-lg font-bold text-black">{agent} — Open House Sign-In</h1>
          <Link href="/admin" className="rounded-md border border-brand-200 px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50">
            ← Admin home
          </Link>
        </div>
      </header>
      <iframe
        title={`${agent} Open House Form`}
        src={`https://form.jotform.com/${formId}`}
        className="w-full flex-1"
        style={{ border: "none", minHeight: "calc(100vh - 56px)" }}
        allow="geolocation; microphone; camera; fullscreen"
      />
    </div>
  );
}
