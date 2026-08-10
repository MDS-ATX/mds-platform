// ─── Weekly developer report data ────────────────────────────────────────────
// Shapes FUB leads into the developer's "Weekly Report" template (prospect-
// focused). Construction/inventory-stage columns from their sheet are omitted.

import type { DashLead, InventorySummary } from "./types";
import { BUILDING_LABELS, type Building } from "./types";
import type { ReportInputs } from "./report-inputs";
import type { TouchPoints } from "./touchpoints";
import { EMPTY_TOUCHPOINTS } from "./touchpoints";
import type { Visits, VisitItem } from "./visits";
import { EMPTY_VISITS } from "./visits";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function parse(iso: string | null): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

export interface ProspectRow {
  id: number;
  name: string;
  leadType: string;
  community: string;
  moveDate: string | null;
  source: string;
  created: string | null;
  lastActivity: string | null;
  appt: boolean;
}

export interface CommunitySales {
  community: string;
  totalSales: number;
  lastWeek: number;
  thisMonth: number;
  thisYear: number;
  unsoldInventory: number;
}

export interface DealDetail {
  building: Building;
  unit: string;
  /** Base price from the team log. */
  basePrice: number | null;
  offerPrice: number | null;
  /** Net sales price from the team log. */
  net: number | null;
  /** Incentive as written in the sheet (e.g. "2%"). */
  incentive: string | null;
  parking: number | null;
  storage: number | null;
  offerDate: string | null;
  executedDate: string | null;
  /** Raw status from the team log (e.g. "Offer", "Waiting for Approval"). */
  status: string | null;
}

export interface ContractActivity {
  offers: DealDetail[];
  underContract: DealDetail[];
  closed: { count: number; volume: number | null };
  /** Closed deals, kept so the report can break Closed out by community. */
  closedDeals: DealDetail[];
  hold: { count: number };
}

/** Broader outreach footprint: human touches + automated nurture + farm list. */
export interface Reach {
  touchPoints: number; // curated human touch points this week
  inNurture: number; // contacts in active drip campaigns
  agentList: number; // imported agent farm list
  total: number;
}

export const EMPTY_REACH: Reach = { touchPoints: 0, inNurture: 0, agentList: 0, total: 0 };

export interface WeeklyReport {
  weekOf: string; // ISO of the reporting week's end (Sunday)
  /** Display strings for the reporting week (e.g. "6/15/26"). */
  periodStart: string;
  periodEnd: string;
  totalProspects: number;
  newProspects: number;
  returnProspects: number;
  /** New leads added in the past 7 days (buyers). */
  newLeads: number;
  /** In-person visits this week (appointments ∪ walk-ins). */
  visits: Visits;
  /** Per-visit detail (name + date) for the visits table. */
  visitList: VisitItem[];
  touchPoints: TouchPoints;
  reach: Reach;
  /** Automated marketing (drip) emails sent this week. */
  marketingEmails: number;
  contract: ContractActivity;
  newProspectRows: ProspectRow[];
  returnProspectRows: ProspectRow[];
  salesByCommunity: CommunitySales[];
}

function toRow(l: DashLead): ProspectRow {
  return {
    id: l.id,
    name: l.name,
    leadType: l.leadType,
    // All contacts are treated as Concourse for now (tags to come later).
    community: "Concourse",
    moveDate: l.moveDate,
    source: l.source,
    created: l.created,
    lastActivity: l.lastActivity,
    appt: l.isOpenHouseAttendee,
  };
}

export function buildWeeklyReport(
  leads: DashLead[],
  inventory: InventorySummary,
  opts: {
    inputs?: ReportInputs;
    touchPoints?: TouchPoints;
    visits?: Visits;
    visitList?: VisitItem[];
    reach?: Reach;
    marketingEmails?: number;
    contract?: ContractActivity;
    reengagedIds?: number[];
    /** Fixed reporting week [startMs, endMs] (Mon 00:00 → Sun 23:59:59). */
    window?: { startMs: number; endMs: number };
  } = {}
): WeeklyReport {
  const weekStart = opts.window?.startMs ?? Date.now() - WEEK_MS;
  const weekEnd = opts.window?.endMs ?? Date.now();
  const fmt = (ms: number) =>
    new Date(ms).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
      timeZone: "America/Chicago",
    });

  // All FUB contacts are treated as project prospects.
  const buyers = leads;

  // New = created within the reporting week. Return = an existing contact who
  // reached back out (inbound call/text) — genuine two-way re-engagement.
  // Bulk-imported contacts (source contains "import") are excluded — a one-time
  // list load isn't real new-prospect traffic.
  const isBulkImport = (l: DashLead) => /import/i.test(l.source ?? "");
  const reengaged = new Set(opts.reengagedIds ?? []);
  const newProspects: DashLead[] = [];
  const returnProspects: DashLead[] = [];
  for (const l of buyers) {
    if (isBulkImport(l)) continue;
    const created = parse(l.created);
    if (created !== null && created >= weekStart && created <= weekEnd) {
      newProspects.push(l);
    } else if (reengaged.has(l.id)) {
      returnProspects.push(l);
    }
  }

  const byCreatedDesc = (a: DashLead, b: DashLead) =>
    (parse(b.created) ?? 0) - (parse(a.created) ?? 0);

  // Sales by community — pre-launch, so sales are zero; show inventory size.
  const communities: Building[] = ["iris", "concourse"];
  const salesByCommunity: CommunitySales[] = communities.map((b) => ({
    community: BUILDING_LABELS[b],
    totalSales: 0,
    lastWeek: 0,
    thisMonth: 0,
    thisYear: 0,
    unsoldInventory: inventory.byBuilding[b]?.total ?? 0,
  }));

  const inputs = opts.inputs;
  // Offers + under-contract come live from the team-log "CC Contracts" sheet
  // tab. Closed / hold counts are still manual inputs for now.
  const contract: ContractActivity = opts.contract ?? {
    offers: [],
    underContract: [],
    closed: inputs?.closed ?? { count: 0, volume: null },
    closedDeals: [],
    hold: inputs?.hold ?? { count: 0 },
  };

  return {
    weekOf: new Date(weekEnd).toISOString(),
    periodStart: fmt(weekStart),
    periodEnd: fmt(weekEnd),
    totalProspects: newProspects.length + returnProspects.length,
    newProspects: newProspects.length,
    returnProspects: returnProspects.length,
    newLeads: newProspects.length,
    visits: opts.visits ?? EMPTY_VISITS,
    visitList: opts.visitList ?? [],
    touchPoints: opts.touchPoints ?? EMPTY_TOUCHPOINTS,
    reach: opts.reach ?? EMPTY_REACH,
    marketingEmails: opts.marketingEmails ?? 0,
    contract,
    newProspectRows: [...newProspects].sort(byCreatedDesc).map(toRow),
    returnProspectRows: returnProspects.map(toRow),
    salesByCommunity,
  };
}
