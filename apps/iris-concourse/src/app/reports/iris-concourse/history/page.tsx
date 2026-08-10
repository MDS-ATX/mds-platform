import type { Metadata } from "next";
import Link from "next/link";
import { listHistory } from "@/lib/dashboard/snapshot";

// Reads the committed report-history/ archive each request so newly-committed
// weeks show up without a rebuild.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "CC Iris Traffic Report - History" };

const TH = "text-xs font-bold text-gray-400 uppercase py-2 pr-4";
const TD = "py-2 pr-4 align-top";

export default function ReportHistoryPage() {
  const entries = listHistory();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 text-gray-900 text-sm">
      <div className="flex items-baseline justify-between border-b-2 border-gray-900 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Weekly Traffic Report</h1>
          <p className="text-gray-700 mt-1">Report history</p>
        </div>
        <Link href="/reports/iris-concourse" className="text-sm text-gray-500 hover:text-gray-900 underline">
          Latest report
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="text-gray-400">
          No archived reports yet. Each weekly refresh adds one here.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className={TH}>Week</th>
              <th className={`${TH} text-right`}>New Prospects</th>
              <th className={`${TH} text-right`}>Visits</th>
              <th className={`${TH} text-right`}>Touch Points</th>
              <th className={`${TH} text-right`}>Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((e) => (
              <tr key={e.week}>
                <td className={`${TD} font-medium text-gray-900 whitespace-nowrap`}>
                  {e.periodStart} – {e.periodEnd}
                </td>
                <td className={`${TD} text-right`}>{e.newProspects}</td>
                <td className={`${TD} text-right`}>{e.visits}</td>
                <td className={`${TD} text-right`}>{e.touchPoints}</td>
                <td className={`${TD} text-right`}>
                  <Link
                    href={`/reports/iris-concourse?week=${e.week}`}
                    className="text-blue-700 hover:text-blue-900 underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
