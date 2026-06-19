import Link from "next/link";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/pipeline", label: "Pipeline" },
  { href: "/reports/iris-concourse", label: "Weekly Report" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex flex-col leading-none">
              <span className="tracking-[0.3em] text-sm font-light text-gray-900">MODUS</span>
              <span className="tracking-[0.12em] text-[9px] text-gray-400 uppercase">
                Concourse &amp; Iris
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 text-sm text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
