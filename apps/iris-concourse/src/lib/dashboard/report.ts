// ─── Weekly developer report data ────────────────────────────────────────────
// Shapes FUB leads into the developer's "Weekly Report" template (prospect-
// focused). Construction/inventory-stage columns from their sheet are omitted.

import type { DashLead, InventorySummary } from "./types";
import { BUILDING_LABELS, type Building } from "./types";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function parse(iso: string | null): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : t;
}

export interface ProspectRow {
  id: number;
  name: string;
  community: string;
  moveDate: string | null;
  source: string;
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

export interface WeeklyReport {
  weekOf: string; // ISO date the report covers (the `now`)
  totalProspects: number;
  newProspects: number;
  returnProspects: number;
  /** Open-house attendees (in-person visits), buyers only. */
  openHouseTotal: number;
  openHouseThisWeek: number;
  newProspectRows: ProspectRow[];
  topProspectRows: ProspectRow[];
  salesByCommunity: CommunitySales[];
}

function toRow(l: DashLead): ProspectRow {
  return {
    id: l.id,
    name: l.name,
    community: BUILDING_LABELS[l.building],
    moveDate: l.moveDate,
    source: l.source,
    lastActivity: l.lastActivity,
    appt: l.isOpenHouseAttendee,
  };
}

export function buildWeeklyReport(
  leads: DashLead[],
  inventory: InventorySummary,
  now: Date = new Date()
): WeeklyReport {
  const nowMs = now.getTime();
  const weekStart = nowMs - WEEK_MS;

  // Buyers only — exclude cooperating-agent / BD contacts.
  const buyers = leads.filter((l) => !l.isAgentContact);

  // New = created this week. Return = created earlier but active this week.
  const newProspects: DashLead[] = [];
  const returnProspects: DashLead[] = [];
  for (const l of buyers) {
    const created = parse(l.created);
    const active = parse(l.lastActivity);
    if (created !== null && created >= weekStart) {
      newProspects.push(l);
    } else if (active !== null && active >= weekStart) {
      returnProspects.push(l);
    }
  }

  const byCreatedDesc = (a: DashLead, b: DashLead) =>
    (parse(b.created) ?? 0) - (parse(a.created) ?? 0);
  const byActivityDesc = (a: DashLead, b: DashLead) =>
    (parse(b.lastActivity) ?? 0) - (parse(a.lastActivity) ?? 0);

  // Top prospects: buyers active in the past 7 days who aren't brand-new this
  // week, most-recently-active first.
  const newIds = new Set(newProspects.map((l) => l.id));
  const topProspects = buyers
    .filter((l) => {
      if (newIds.has(l.id)) return false;
      const active = parse(l.lastActivity);
      return active !== null && active >= weekStart;
    })
    .sort(byActivityDesc)
    .slice(0, 10);

  // Open-house attendees (in-person visits), buyers only.
  const attendees = buyers.filter((l) => l.isOpenHouseAttendee);
  const openHouseThisWeek = attendees.filter((l) => {
    const created = parse(l.created);
    return created !== null && created >= weekStart;
  }).length;

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

  return {
    weekOf: now.toISOString(),
    totalProspects: newProspects.length + returnProspects.length,
    newProspects: newProspects.length,
    returnProspects: returnProspects.length,
    openHouseTotal: attendees.length,
    openHouseThisWeek,
    newProspectRows: [...newProspects].sort(byCreatedDesc).map(toRow),
    topProspectRows: topProspects.map(toRow),
    salesByCommunity,
  };
}
