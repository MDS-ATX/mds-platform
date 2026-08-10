// ─── Dashboard data entry point (server-only) ────────────────────────────────
// Pulls live leads from FUB, maps + aggregates them, and merges static units.
// Returns a `connected: false` shape (never throws) so the UI can degrade
// gracefully when FUB isn't configured.

import { listAllPeople, FUBNotConnectedError } from "@/lib/crm";
import { mapPersonToLead } from "./map-fub";
import { computeMetrics } from "./metrics";
import { getInventorySummary } from "./units";
import type { DashboardData, DashLead } from "./types";

function emptyMetrics(): DashboardData["metrics"] {
  return computeMetrics([]);
}

/**
 * Fetch + assemble everything the dashboard and report pages need.
 * Safe to call from server components; never throws.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const inventory = getInventorySummary();
  const generatedAt = new Date().toISOString();

  try {
    // All FUB contacts are treated as this project (no tag filter).
    const people = await listAllPeople({ maxPages: 30 });
    const leads: DashLead[] = people.map(mapPersonToLead);
    return {
      connected: true,
      leads,
      metrics: computeMetrics(leads),
      inventory,
      generatedAt,
    };
  } catch (err) {
    const message =
      err instanceof FUBNotConnectedError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Unknown error fetching FUB data";
    return {
      connected: false,
      error: message,
      leads: [],
      metrics: emptyMetrics(),
      inventory,
      generatedAt,
    };
  }
}
