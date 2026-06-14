import Link from "next/link";
import { OpenHouseForm } from "@/components/admin/open-house-form";

export const metadata = {
  title: "Open House Sign-In | Concourse & Iris Admin",
};

export default function OpenHousePage() {
  return (
    <div className="min-h-screen bg-brand-50">
      <header className="border-b border-brand-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="font-heading text-xl font-bold text-black">Open House Sign-In</h1>
            <p className="text-xs uppercase tracking-widest text-brand-600">Concourse &amp; Iris — Admin</p>
          </div>
          <Link
            href="/admin"
            className="rounded-md border border-brand-200 px-3 py-1.5 text-sm text-brand-700 hover:bg-brand-50"
          >
            ← Inventory
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-6 py-8">
        <OpenHouseForm />
      </main>
    </div>
  );
}
