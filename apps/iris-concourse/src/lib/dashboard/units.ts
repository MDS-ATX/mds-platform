// ─── Static unit inventory rollup ────────────────────────────────────────────
// FUB has no unit data; inventory comes from the project's static JSON.

import unitsData from "@/data/units.json";
import type { InventorySummary } from "./types";

interface RawUnit {
  id: string;
  building: string;
  number: string;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: string;
}

export function getInventorySummary(): InventorySummary {
  const units = unitsData as RawUnit[];
  const byBuilding: InventorySummary["byBuilding"] = {};

  for (const u of units) {
    if (!byBuilding[u.building]) {
      byBuilding[u.building] = { total: 0, byBedrooms: {} };
    }
    const b = byBuilding[u.building];
    b.total += 1;
    b.byBedrooms[u.bedrooms] = (b.byBedrooms[u.bedrooms] ?? 0) + 1;
  }

  return { totalUnits: units.length, byBuilding };
}
