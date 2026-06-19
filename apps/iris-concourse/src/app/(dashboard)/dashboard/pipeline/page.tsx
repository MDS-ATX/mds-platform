import { getDashboardData } from "@/lib/dashboard/get-dashboard-data";
import {
  PIPELINE_STAGES,
  STAGE_COLORS,
  STAGE_LABELS,
  BUILDING_LABELS,
  type DashLead,
} from "@/lib/dashboard/types";
import { NotConnectedBanner } from "@/components/dashboard/not-connected";

export const revalidate = 600;

export default async function PipelinePage() {
  const data = await getDashboardData();

  const byStage = new Map<string, DashLead[]>();
  for (const s of PIPELINE_STAGES) byStage.set(s, []);
  for (const l of data.leads) byStage.get(l.stage)?.push(l);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">
          {data.metrics.totalLeads} leads across {PIPELINE_STAGES.length} stages
        </p>
      </div>

      {!data.connected && <NotConnectedBanner error={data.error} />}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const leads = byStage.get(stage) ?? [];
          return (
            <div key={stage} className="flex-shrink-0 w-64">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: STAGE_COLORS[stage] }}
                />
                <h2 className="text-sm font-semibold text-gray-900">{STAGE_LABELS[stage]}</h2>
                <span className="text-xs text-gray-400">{leads.length}</span>
              </div>
              <div className="space-y-2">
                {leads.map((l) => (
                  <div
                    key={l.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 text-sm"
                  >
                    <p className="font-medium text-gray-900">{l.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {BUILDING_LABELS[l.building]} · {l.source}
                    </p>
                    {l.assignedAgent && (
                      <p className="text-xs text-gray-400 mt-1">{l.assignedAgent}</p>
                    )}
                  </div>
                ))}
                {leads.length === 0 && (
                  <p className="text-xs text-gray-300 italic">Empty</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
