// ─── Dashboard metric computations ───────────────────────────────────────────
// Pure functions over DashLead[]. No I/O.

import {
  ACTIVE_STAGES,
  PIPELINE_STAGES,
  type Building,
  type DashLead,
  type DashboardMetrics,
  type SourceCount,
  type StageCount,
} from "./types";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function createdTime(lead: DashLead): number | null {
  if (!lead.created) return null;
  const t = Date.parse(lead.created);
  return Number.isNaN(t) ? null : t;
}

/**
 * Compute all dashboard metrics. `now` is injectable for deterministic tests;
 * defaults to the current time.
 */
export function computeMetrics(leads: DashLead[], now: Date = new Date()): DashboardMetrics {
  const nowMs = now.getTime();
  const thisWeekStart = nowMs - WEEK_MS;
  const lastWeekStart = nowMs - 2 * WEEK_MS;

  // By stage
  const stageMap = new Map<string, number>();
  for (const s of PIPELINE_STAGES) stageMap.set(s, 0);
  for (const l of leads) stageMap.set(l.stage, (stageMap.get(l.stage) ?? 0) + 1);
  const byStage: StageCount[] = PIPELINE_STAGES.map((stage) => ({
    stage,
    count: stageMap.get(stage) ?? 0,
  }));

  // By source (descending)
  const sourceMap = new Map<string, number>();
  for (const l of leads) sourceMap.set(l.source, (sourceMap.get(l.source) ?? 0) + 1);
  const bySource: SourceCount[] = [...sourceMap.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // By building
  const byBuilding: Record<Building, number> = {
    iris: 0,
    concourse: 0,
    both: 0,
    unknown: 0,
  };
  for (const l of leads) byBuilding[l.building] += 1;

  // New-lead windows (week-over-week)
  let newThisWeek = 0;
  let newLastWeek = 0;
  for (const l of leads) {
    const t = createdTime(l);
    if (t === null) continue;
    if (t >= thisWeekStart) newThisWeek += 1;
    else if (t >= lastWeekStart) newLastWeek += 1;
  }
  const wowPercent =
    newLastWeek === 0 ? null : ((newThisWeek - newLastWeek) / newLastWeek) * 100;

  const activeLeads = leads.filter((l) => ACTIVE_STAGES.includes(l.stage)).length;

  return {
    totalLeads: leads.length,
    activeLeads,
    newThisWeek,
    newLastWeek,
    wowPercent,
    tours: stageMap.get("toured") ?? 0,
    underContract: stageMap.get("under-contract") ?? 0,
    closed: stageMap.get("closed") ?? 0,
    byStage,
    bySource,
    byBuilding,
  };
}

/** Leads created within the trailing `days` window, newest first. */
export function leadsInWindow(
  leads: DashLead[],
  days: number,
  now: Date = new Date()
): DashLead[] {
  const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
  return leads
    .filter((l) => {
      const t = createdTime(l);
      return t !== null && t >= cutoff;
    })
    .sort((a, b) => (createdTime(b) ?? 0) - (createdTime(a) ?? 0));
}
