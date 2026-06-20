import Link from "next/link";

export const metadata = {
  title: "Admin | Concourse & Iris",
};

const CARDS: { href: string; title: string; desc: string }[] = [
  {
    href: "/admin/inventory",
    title: "Sales Inventory",
    desc: "Units, parking, and storage for Concourse & Iris — live from the official sales sheet. Edit status/notes and copy units to email.",
  },
  {
    href: "/admin/open-house/jacob",
    title: "Jacob — Open House Form",
    desc: "Open house sign-in sheet for Jacob's showings.",
  },
  {
    href: "/admin/open-house/carson",
    title: "Carson — Open House Form",
    desc: "Open house sign-in sheet for Carson's showings.",
  },
];

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-brand-50">
      <header className="border-b border-brand-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-heading text-xl font-bold text-black">Concourse &amp; Iris — Admin</h1>
            <p className="text-xs uppercase tracking-widest text-brand-600">Sales Tools</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CARDS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="block rounded-lg border border-brand-200 bg-white p-6 transition-colors hover:border-black"
            >
              <h2 className="mb-2 text-lg font-semibold text-black">{c.title}</h2>
              <p className="text-sm text-brand-600">{c.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
