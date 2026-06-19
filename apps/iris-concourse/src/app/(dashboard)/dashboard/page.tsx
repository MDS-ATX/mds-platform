import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";
import { leadsInWindow } from "@/lib/dashboard/metrics";
import {
  BUILDING_LABELS,
  STAGE_COLORS,
  STAGE_LABELS,
  type Building,
} from "@/lib/dashboard/types";
import { MetricCard } from "@/components/dashboard/metric-card";
import { BarChart } from "@/components/dashboard/bar-chart";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { NotConnectedBanner } from "@/components/dashboard/not-connected";

// Refresh live FUB data at most every 10 minutes.
export const revalidate = 600;

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const diff = Date.now() - t;
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default async function DashboardOverviewPage() {
  const data = await getDashboardData();
  const { metrics, inventory } = data;

  const wow =
    metrics.wowPercent === null
      ? undefined
      : {
          value: `${Math.abs(Math.round(metrics.wowPercent))}% vs last week`,
          positive: metrics.wowPercent >= 0,
        };

  const buildingOrder: Building[] = ["iris", "concourse", "both", "unknown"];
  const recent = leadsInWindow(data.leads, 14);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Concourse &amp; Iris — Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            Live leads from Follow Up Boss · {inventory.totalUnits} units across 2 buildings
          </p>
        </div>
      </div>

      {!data.connected && <NotConnectedBanner error={data.error} />}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Active Leads" value={String(metrics.activeLeads)} subtitle={`${metrics.totalLeads} total`} />
        <MetricCard label="New This Week" value={String(metrics.newThisWeek)} trend={wow} />
        <MetricCard label="Tours" value={String(metrics.tours)} subtitle="Toured stage" />
        <MetricCard
          label="Under Contract"
          value={String(metrics.underContract)}
          subtitle={`${metrics.closed} closed`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead sources */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
            Lead Sources
          </h2>
          {metrics.bySource.length > 0 ? (
            <BarChart
              data={metrics.bySource.slice(0, 8).map((s) => ({ label: s.source, value: s.count }))}
            />
          ) : (
            <p className="text-sm text-gray-400">No leads yet.</p>
          )}
        </section>

        {/* Pipeline */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
            Pipeline
          </h2>
          <div className="flex items-center gap-6">
            <DonutChart
              size={140}
              label={String(metrics.activeLeads)}
              sublabel="active"
              segments={metrics.byStage
                .filter((s) => s.count > 0)
                .map((s) => ({
                  value: s.count,
                  color: STAGE_COLORS[s.stage],
                  label: STAGE_LABELS[s.stage],
                }))}
            />
            <div className="flex-1 space-y-1.5">
              {metrics.byStage
                .filter((s) => s.count > 0)
                .map((s) => (
                  <div key={s.stage} className="flex items-center gap-2 text-sm">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: STAGE_COLORS[s.stage] }}
                    />
                    <span className="text-gray-600 flex-1">{STAGE_LABELS[s.stage]}</span>
                    <span className="font-medium text-gray-900">{s.count}</span>
                  </div>
                ))}
              {metrics.totalLeads === 0 && (
                <p className="text-sm text-gray-400">No leads yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Building split */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
          Interest by Building
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {buildingOrder.map((b) => (
            <div key={b} className="text-center border border-gray-100 rounded-lg p-4">
              <p className="text-2xl font-bold text-gray-900">{metrics.byBuilding[b]}</p>
              <p className="text-xs text-gray-500 uppercase mt-1">{BUILDING_LABELS[b]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent leads */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
          Recent Leads (14 days)
        </h2>
        {recent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Building</th>
                  <th className="py-2 pr-4 font-medium">Source</th>
                  <th className="py-2 pr-4 font-medium">Stage</th>
                  <th className="py-2 pr-4 font-medium">Agent</th>
                  <th className="py-2 font-medium text-right">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent.slice(0, 25).map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 pr-4 font-medium text-gray-900">{l.name}</td>
                    <td className="py-2 pr-4 text-gray-600">{BUILDING_LABELS[l.building]}</td>
                    <td className="py-2 pr-4 text-gray-600">{l.source}</td>
                    <td className="py-2 pr-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: STAGE_COLORS[l.stage] }}
                        />
                        <span className="text-gray-600">{STAGE_LABELS[l.stage]}</span>
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-600">{l.assignedAgent ?? "—"}</td>
                    <td className="py-2 text-gray-500 text-right">{formatRelative(l.created)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No leads added in the last 14 days.</p>
        )}
      </section>
    </div>
  );
}
