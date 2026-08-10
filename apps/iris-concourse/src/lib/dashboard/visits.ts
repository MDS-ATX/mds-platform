// ─── Visits (past 7 days) ────────────────────────────────────────────────────
// A "visit" = an in-person touch this week, from two signals, de-duplicated by
// person:
//   1. A FUB appointment for a Concourse/Iris property with a start in the
//      window. Matched by title/location keywords (the appointment contacts
//      aren't reliably tagged mds:iris-concourse), excluding FUB webinars.
//   2. An open-house-sourced lead added in the window (walk-in).

import { listAppointmentsSince, FUBNotConnectedError } from "@/lib/crm";
import type { FUBAppointment } from "@/lib/crm";
import type { DashLead } from "./types";

export interface Visits {
  total: number;
  scheduled: number; // unique people with a project appointment this week
  walkIns: number; // open-house attendees not already counted as scheduled
}

export const EMPTY_VISITS: Visits = { total: 0, scheduled: 0, walkIns: 0 };

export interface VisitItem {
  name: string;
  date: string | null; // ISO (visit date)
  leadType: string;
  community: string;
  source: string;
}

export interface VisitData {
  visits: Visits;
  /** Per-visit detail (name + date), newest first. */
  list: VisitItem[];
  /** Person ids on project appointments this week — identified Concourse contacts. */
  contactIds: number[];
}

export const EMPTY_VISIT_DATA: VisitData = { visits: EMPTY_VISITS, list: [], contactIds: [] };

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Concourse: 3900 Berkman / McCurdy. Iris: 5025 Mueller. Both in Mueller.
const PROJECT_RE = /concourse|iris|berkman|mccurdy|mueller/i;
const EXCLUDE_RE = /webinar|bootcamp|training/i;

function isProjectAppointment(a: FUBAppointment): boolean {
  const text = `${a.title ?? ""} ${a.location ?? ""}`;
  if (EXCLUDE_RE.test(text)) return false;
  return PROJECT_RE.test(text);
}

// Which building an appointment is for, from its title + location address.
// Concourse = 3900 Berkman / McCurdy; Iris = 5025 Mueller Blvd. "Mueller" alone
// is ambiguous (Concourse appts also say "in Mueller"), so Iris is keyed off
// "iris" / "5025" and everything else falls back to Concourse.
const IRIS_RE = /iris|5025/i;
function communityFor(a: FUBAppointment): string {
  const text = `${a.title ?? ""} ${a.location ?? ""}`;
  return IRIS_RE.test(text) ? "Iris" : "Concourse";
}

export async function getVisitData(
  leads: DashLead[],
  startMs: number,
  endMs: number
): Promise<VisitData> {
  const startISO = new Date(startMs).toISOString();

  // Scheduled: unique buyer person ids on project appointments whose start is
  // within the reporting week. Future-dated appointments are excluded (a visit
  // is something that already happened). Agent-only invitees don't count.
  const leadMap = new Map(leads.map((l) => [l.id, l]));
  const scheduledIds = new Set<number>();
  const list: VisitItem[] = [];
  try {
    const appts = await listAppointmentsSince(startISO);
    for (const a of appts) {
      if (!isProjectAppointment(a)) continue;
      const start = a.start ? Date.parse(a.start) : NaN;
      if (Number.isNaN(start) || start < startMs || start > endMs) continue;
      for (const inv of a.invitees ?? []) {
        if (inv.personId == null || scheduledIds.has(inv.personId)) continue;
        scheduledIds.add(inv.personId);
        const lead = leadMap.get(inv.personId);
        list.push({
          name: inv.name ?? "Unknown",
          date: a.start ?? null,
          leadType: lead?.leadType ?? "Buyer",
          community: communityFor(a),
          source: lead?.source ?? "—",
        });
      }
    }
  } catch (err) {
    if (!(err instanceof FUBNotConnectedError)) throw err;
  }

  // Walk-ins: open-house attendees added within the week, not already counted.
  const walkInIds = new Set<number>();
  for (const l of leads) {
    if (!l.isOpenHouseAttendee || scheduledIds.has(l.id)) continue;
    const created = l.created ? Date.parse(l.created) : NaN;
    if (Number.isNaN(created) || created < startMs || created > endMs) continue;
    walkInIds.add(l.id);
    list.push({
      name: l.name,
      date: l.created,
      leadType: l.leadType,
      // Walk-ins have no appointment (so no address) — default to Concourse
      // for now until a per-walk-in building signal exists.
      community: "Concourse",
      source: l.source,
    });
  }

  list.sort((a, b) => (Date.parse(b.date ?? "") || 0) - (Date.parse(a.date ?? "") || 0));

  return {
    visits: {
      total: scheduledIds.size + walkInIds.size,
      scheduled: scheduledIds.size,
      walkIns: walkInIds.size,
    },
    list,
    contactIds: [...scheduledIds],
  };
}
