// ─── Team-log base-price lookup ──────────────────────────────────────────────
// Resolves a unit's approved base price (and a few attributes) from the /admin
// inventory data, for offer/contract detail on the report.

import { getFullInventory } from "@/lib/inventory/data";
import type { Building } from "@/lib/inventory/types";

export interface UnitRef {
  building: Building;
  unitNumber: string;
  basePrice: number;
  beds: number;
  baths: number;
  designation: string;
}

let cache: Map<string, UnitRef> | null = null;

function index(): Map<string, UnitRef> {
  if (cache) return cache;
  const map = new Map<string, UnitRef>();
  const inv = getFullInventory();
  for (const building of ["concourse", "iris"] as Building[]) {
    for (const u of inv[building].units) {
      map.set(`${building}:${u.unitNumber}`, {
        building,
        unitNumber: u.unitNumber,
        basePrice: u.price,
        beds: u.beds,
        baths: u.baths,
        designation: u.designation,
      });
    }
  }
  cache = map;
  return map;
}

export function getUnitRef(building: Building, unitNumber: string): UnitRef | null {
  return index().get(`${building}:${unitNumber}`) ?? null;
}
