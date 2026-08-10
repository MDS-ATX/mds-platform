// ─── Marketing emails (automated / drip sends) ───────────────────────────────
// Counts automated emails (action-plan / template drips) sent in the reporting
// window. Drips only go to contacts enrolled in an action plan, so we only need
// to query the enrolled set — not the whole database. Per-person email reads are
// slow (FUB has no aggregate), but this report runs weekly, not live.

import {
  listActionPlanEnrollments,
  listPersonActivitySince,
  FUBNotConnectedError,
} from "@/lib/crm";

const CONCURRENCY = 3;

export async function getMarketingEmailCount(
  startISO: string,
  endISO: string
): Promise<number> {
  try {
    const enrollments = await listActionPlanEnrollments();
    const ids = [...new Set(enrollments.filter((e) => e.personId != null).map((e) => e.personId!))];

    let total = 0;
    let i = 0;
    async function worker() {
      while (i < ids.length) {
        const id = ids[i++];
        const emails = await listPersonActivitySince("emails", "emails", id, startISO, endISO);
        total += emails.filter((e) => e.actionPlanId != null || e.emailTemplateId != null).length;
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, ids.length) }, worker));
    return total;
  } catch (err) {
    if (err instanceof FUBNotConnectedError) return 0;
    throw err;
  }
}
