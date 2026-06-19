import projectData from "@/data/project.json";
import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";
import { buildWeeklyReport, type ProspectRow } from "@/lib/dashboard/report";
import { PrintButton } from "@/components/dashboard/print-button";
import { NotConnectedBanner } from "@/components/dashboard/not-connected";

export const revalidate = 600;

const PROJECT_NAME = projectData.name;
const DEVELOPER = projectData.developer.name;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });
}

function fmtActivity(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ProspectTable({
  rows,
  showActivity,
  emptyText,
}: {
  rows: ProspectRow[];
  showActivity?: boolean;
  emptyText: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-gray-400 mb-6">{emptyText}</p>;
  }
  return (
    <table className="w-full text-sm border border-gray-200 mb-6">
      <thead>
        <tr className="bg-gray-50 text-left text-xs font-bold text-gray-500 uppercase">
          <th className="px-3 py-2">Name</th>
          <th className="px-3 py-2">Community</th>
          <th className="px-3 py-2">Move Date</th>
          <th className="px-3 py-2">Source</th>
          {showActivity && <th className="px-3 py-2">Last Activity</th>}
          <th className="px-3 py-2">Grade</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="px-3 py-2 font-medium text-gray-900">
              {r.name}
              {r.appt && (
                <span className="ml-2 inline-block text-[10px] font-semibold text-gray-600 bg-gray-100 rounded px-1.5 py-0.5 align-middle">
                  APPT
                </span>
              )}
            </td>
            <td className="px-3 py-2 text-gray-700">{r.community}</td>
            <td className="px-3 py-2 text-gray-500">{r.moveDate ?? "—"}</td>
            <td className="px-3 py-2 text-gray-700">{r.source}</td>
            {showActivity && (
              <td className="px-3 py-2 text-gray-500">{fmtActivity(r.lastActivity)}</td>
            )}
            <td className="px-3 py-2 text-gray-300">—</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function WeeklyReportPage() {
  const data = await getDashboardData();
  const report = buildWeeklyReport(data.leads, data.inventory);
  const reportDate = fmtDate(report.weekOf);
  const periodStart = fmtDate(
    new Date(Date.parse(report.weekOf) - 7 * 24 * 60 * 60 * 1000).toISOString()
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 print:py-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="tracking-[0.3em] text-xl font-light text-gray-900">MODUS</div>
          <div className="tracking-[0.15em] text-[10px] text-gray-400 uppercase">
            Development Services
          </div>
        </div>
        <PrintButton />
      </div>

      {/* Title */}
      <div className="border-b-2 border-gray-900 pb-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Weekly Report</h1>
        <p className="text-gray-700 mt-1">
          {PROJECT_NAME} — {reportDate}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Reporting period: {periodStart} – {reportDate} · Prepared for {DEVELOPER}
        </p>
      </div>

      {!data.connected && (
        <div className="mb-8">
          <NotConnectedBanner error={data.error} />
        </div>
      )}

      {/* Prospect summary */}
      <section className="mb-8">
        <div className="grid grid-cols-3 gap-4 max-w-md">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{report.newProspects}</p>
            <p className="text-xs text-gray-500 uppercase mt-1">New Prospects</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{report.returnProspects}</p>
            <p className="text-xs text-gray-500 uppercase mt-1">Return Prospects</p>
          </div>
          <div className="border border-gray-900 bg-gray-900 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-white">{report.totalProspects}</p>
            <p className="text-xs text-gray-300 uppercase mt-1">Total</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Prospect activity for the past 7 days.</p>
      </section>

      {/* Appointments (in-person visits) */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">
          Appointments
        </h2>
        <div className="grid grid-cols-3 gap-4 max-w-md">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{report.openHouseThisWeek}</p>
            <p className="text-xs text-gray-500 uppercase mt-1">Past 7 Days</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          In-person visits in the past 7 days. A prospect can be counted as both an
          appointment and a new prospect. Buyers only.
        </p>
      </section>

      {/* Sales by community */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">
          Sales by Community
        </h2>
        <table className="w-full text-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
              <th className="px-3 py-2 text-left">Community</th>
              <th className="px-3 py-2 text-center">Total Sales</th>
              <th className="px-3 py-2 text-center">Last Week</th>
              <th className="px-3 py-2 text-center">This Month</th>
              <th className="px-3 py-2 text-center">This Year</th>
              <th className="px-3 py-2 text-right">Unsold Inventory</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {report.salesByCommunity.map((c) => (
              <tr key={c.community}>
                <td className="px-3 py-2 font-medium text-gray-900">{c.community}</td>
                <td className="px-3 py-2 text-center text-gray-700">{c.totalSales}</td>
                <td className="px-3 py-2 text-center text-gray-700">{c.lastWeek}</td>
                <td className="px-3 py-2 text-center text-gray-700">{c.thisMonth}</td>
                <td className="px-3 py-2 text-center text-gray-700">{c.thisYear}</td>
                <td className="px-3 py-2 text-right text-gray-700">{c.unsoldInventory}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-400 mt-2">
          Pre-launch — sales tracking begins at launch.
        </p>
      </section>

      {/* New prospects */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">
          New Prospects
        </h2>
        <ProspectTable rows={report.newProspectRows} emptyText="No new prospects this week." />
      </section>

      {/* Top prospects */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide">
          Top Prospects
        </h2>
        <ProspectTable
          rows={report.topProspectRows}
          showActivity
          emptyText="No active prospects to highlight."
        />
      </section>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 mt-12 text-xs text-gray-500">
        <p>Confidential — Prepared by MODUS Development Services for {DEVELOPER}</p>
        <p className="mt-1">For questions, contact the MODUS sales team.</p>
      </div>
    </div>
  );
}
