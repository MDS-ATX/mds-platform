// ─── Weekly report data entry point (server-only) ────────────────────────────
// Assembles live leads + touch points (FUB) with the manual weekly inputs into
// a single WeeklyReport for the developer report page. Never throws.

import type { Reach } from "./report";
import { EMPTY_REACH } from "./report";
import { getDashboardData } from "./get-dashboard-data";
import { buildWeeklyReport, type WeeklyReport } from "./report";
import { getReportInputs } from "./report-inputs";
import { getTouchPoints, EMPTY_TOUCHPOINT_RESULT } from "./touchpoints";
import { getVisitData, EMPTY_VISIT_DATA } from "./visits";
import { getMarketingEmailCount } from "./marketing";
import { getSheetContracts } from "./contracts-sheet";
import type { DashboardData } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
// Austin is US Central. June = CDT (UTC−5). Week boundaries use this offset so a
// "Mon–Sun" week lines up with local days, not UTC.
const TZ = "-05:00";

/**
 * Resolve the report's ending Sunday. A pinned YYYY-MM-DD is used as-is;
 * "auto" (or anything else) resolves to the most recent completed Sunday in
 * Central time — so a Monday run reports the week that just ended.
 */
export function resolveWeekOf(pinned: string, now: Date = new Date()): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(pinned)) return pinned;
  const central = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const dow = central.getDay(); // 0 = Sunday
  const back = dow === 0 ? 7 : dow; // Mon→1 … Sat→6, Sun→prior Sun
  central.setDate(central.getDate() - back);
  const y = central.getFullYear();
  const m = String(central.getMonth() + 1).padStart(2, "0");
  const d = String(central.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Fixed reporting week: Monday 00:00 → Sunday 23:59:59 (Central), where
 * `sundayStr` (YYYY-MM-DD) is the report's ending Sunday.
 */
function weekWindow(sundayStr: string): { startMs: number; endMs: number } {
  const endMs = Date.parse(`${sundayStr}T23:59:59${TZ}`);
  // Use noon to dodge any DST edge when stepping back 6 days, then floor to date.
  const monday = new Date(Date.parse(`${sundayStr}T12:00:00${TZ}`) - 6 * DAY_MS);
  const mondayStr = monday.toISOString().slice(0, 10);
  const startMs = Date.parse(`${mondayStr}T00:00:00${TZ}`);
  return { startMs, endMs };
}

export interface ReportData {
  connected: boolean;
  error?: string;
  report: WeeklyReport;
  generatedAt: string;
}

export async function getReportData(): Promise<ReportData> {
  const data: DashboardData = await getDashboardData();
  const inputs = getReportInputs();
  const { startMs, endMs } = weekWindow(resolveWeekOf(inputs.weekOf));
  const startISO = new Date(startMs).toISOString();
  const endISO = new Date(endMs).toISOString();

  const { visits, list: visitList, contactIds } = data.connected
    ? await getVisitData(data.leads, startMs, endMs)
    : EMPTY_VISIT_DATA;

  const { touchPoints, reengagedIds } = data.connected
    ? await getTouchPoints(data.leads, contactIds, startISO, endISO)
    : EMPTY_TOUCHPOINT_RESULT;

  const reach: Reach = data.connected
    ? { touchPoints: touchPoints.total, inNurture: 0, agentList: 0, total: data.leads.length }
    : EMPTY_REACH;

  // Automated marketing (drip) emails sent this week — queries the enrolled set.
  const marketingEmails = data.connected ? await getMarketingEmailCount(startISO, endISO) : 0;

  // Offers + under-contract live from the team-log "CC Contracts" sheet tab.
  const sheetContracts = await getSheetContracts();
  const contract = {
    offers: sheetContracts.offers,
    underContract: sheetContracts.underContract,
    // Closed/hold: prefer sheet if it has any, else manual inputs.
    closed: sheetContracts.closed.count > 0 ? sheetContracts.closed : inputs.closed,
    closedDeals: sheetContracts.closedDeals,
    hold: sheetContracts.hold.count > 0 ? sheetContracts.hold : inputs.hold,
  };

  const report = buildWeeklyReport(
    data.leads,
    data.inventory,
    {
      inputs,
      touchPoints,
      visits,
      visitList,
      reach,
      marketingEmails,
      contract,
      reengagedIds,
      window: { startMs, endMs },
    }
  );

  return {
    connected: data.connected,
    error: data.error,
    report,
    generatedAt: data.generatedAt,
  };
}
