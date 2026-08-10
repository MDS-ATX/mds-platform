// ─── Touch points + re-engagement (FUB activity) ─────────────────────────────
// Touch points = calls + texts + emails the team sent this week (notes excluded).
// Re-engaged = contacts who reached back out (inbound call or inbound text).
// Calls list globally; texts/emails must be queried per person, so those run
// through one low-concurrency queue, capped to the most-active contacts.

import {
  listCallsSince,
  listPersonActivitySince,
  FUBNotConnectedError,
} from "@/lib/crm";
import type { DashLead } from "./types";
import { TEAM_USER_ID_SET } from "./team";

export interface TouchPoints {
  total: number;
  calls: number;
  texts: number;
  emails: number;
}

export const EMPTY_TOUCHPOINTS: TouchPoints = { total: 0, calls: 0, texts: 0, emails: 0 };

export interface TouchPointResult {
  touchPoints: TouchPoints;
  /** Person ids who reached out to us this week (inbound call/text). */
  reengagedIds: number[];
}

export const EMPTY_TOUCHPOINT_RESULT: TouchPointResult = {
  touchPoints: EMPTY_TOUCHPOINTS,
  reengagedIds: [],
};

const PERSON_CONCURRENCY = 3;

interface PersonStats {
  texts: number; // team-sent texts
  emails: number; // team-sent emails
  inbound: boolean; // contact sent us a text
  id: number;
}

async function gatherPerPerson(
  ids: number[],
  task: (id: number) => Promise<PersonStats>
): Promise<PersonStats[]> {
  const out: PersonStats[] = [];
  let i = 0;
  async function worker() {
    while (i < ids.length) {
      out.push(await task(ids[i++]));
    }
  }
  await Promise.all(Array.from({ length: Math.min(PERSON_CONCURRENCY, ids.length) }, worker));
  return out;
}

export async function getTouchPoints(
  leads: DashLead[],
  contactIds: number[],
  sinceISO: string,
  untilISO: string
): Promise<TouchPointResult> {
  try {
    const team = TEAM_USER_ID_SET;
    const since = Date.parse(sinceISO);
    const until = Date.parse(untilISO);
    const inWindow = (iso?: string) => {
      const t = iso ? Date.parse(iso) : NaN;
      return !Number.isNaN(t) && t >= since && t <= until;
    };

    // Calls: team calls within the week; inbound calls mark re-engagement.
    const callRecords = (await listCallsSince(sinceISO)).filter((c) => inWindow(c.created));
    const calls = callRecords.filter((c) => c.userId != null && team.has(c.userId)).length;
    const reengaged = new Set<number>();
    for (const c of callRecords) {
      if (c.isIncoming && c.personId != null) reengaged.add(c.personId);
    }

    // Texts + emails per person — every contact active since the window start
    // (uncapped, for an exact count; slower, run weekly not live).
    const activeIds = leads
      .filter((l) => {
        const t = l.lastActivity ? Date.parse(l.lastActivity) : NaN;
        return !Number.isNaN(t) && t >= since;
      })
      .map((l) => l.id);
    const ids = [...new Set([...activeIds, ...contactIds])];

    const stats = await gatherPerPerson(ids, async (id) => {
      const textRecs = await listPersonActivitySince("textMessages", "textmessages", id, sinceISO, untilISO);
      const emailRecs = await listPersonActivitySince("emails", "emails", id, sinceISO, untilISO);
      return {
        id,
        texts: textRecs.filter((r) => r.userId != null && team.has(r.userId)).length,
        // Personal emails only — automated drips are counted as marketing emails,
        // so excluding them here avoids double-counting and matches FUB's report.
        emails: emailRecs.filter(
          (r) =>
            r.userId != null &&
            team.has(r.userId) &&
            r.actionPlanId == null &&
            r.emailTemplateId == null
        ).length,
        inbound: textRecs.some((r) => r.isIncoming),
      };
    });

    let texts = 0;
    let emails = 0;
    for (const s of stats) {
      texts += s.texts;
      emails += s.emails;
      if (s.inbound) reengaged.add(s.id);
    }

    return {
      touchPoints: { total: calls + texts + emails, calls, texts, emails },
      reengagedIds: [...reengaged],
    };
  } catch (err) {
    if (err instanceof FUBNotConnectedError) return EMPTY_TOUCHPOINT_RESULT;
    throw err;
  }
}
