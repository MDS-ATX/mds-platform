import type {
  Building,
  ResidentialUnit,
  ParkingSpace,
  StorageUnit,
} from "@/lib/inventory/types";
import { concourseUnits } from "@/data/inventory-concourse";
import { irisUnits } from "@/data/inventory-iris";
import { concourseParking, irisParking } from "@/data/inventory-parking";
import { concourseStorage, irisStorage } from "@/data/inventory-storage";
import { readStatusOverrides, sheetsConfigured } from "@/lib/inventory/sheets";

// ─── Inventory Data Seam ─────────────────────────────────────────────────────
// Single source of inventory data for the /admin tool. Today these return the
// static mock arrays. To go live with Google Sheets later, replace the bodies of
// these accessors with a Sheets fetch (read) — the UI/types stay unchanged.

export interface BuildingInventory {
  units: ResidentialUnit[];
  parking: ParkingSpace[];
  storage: StorageUnit[];
}

export function getBuildingInventory(building: Building): BuildingInventory {
  if (building === "concourse") {
    return { units: concourseUnits, parking: concourseParking, storage: concourseStorage };
  }
  return { units: irisUnits, parking: irisParking, storage: irisStorage };
}

export function getFullInventory(): Record<Building, BuildingInventory> {
  return {
    concourse: getBuildingInventory("concourse"),
    iris: getBuildingInventory("iris"),
  };
}

// ─── Live inventory (seed + saved status/notes overrides) ────────────────────
// Reads the "Admin Status" tab and overlays saved status/notes onto the seed.
// Falls back to the plain seed if Sheets isn't configured or the read fails.
export async function getLiveInventory(): Promise<Record<Building, BuildingInventory>> {
  const seed = getFullInventory();
  if (!sheetsConfigured()) return seed;

  let overrides;
  try {
    overrides = await readStatusOverrides();
  } catch {
    return seed; // graceful fallback — never hard-fail the page
  }

  const key = (building: string, type: string, id: string) => `${building}:${type}:${id}`;

  for (const building of ["concourse", "iris"] as Building[]) {
    const inv = seed[building];
    inv.units = inv.units.map((u) => {
      const o = overrides.get(key(building, "unit", u.unitNumber));
      return o ? { ...u, ...(o.status ? { status: o.status } : {}), ...(o.notes !== undefined ? { notes: o.notes } : {}) } : u;
    });
    inv.parking = inv.parking.map((p) => {
      const o = overrides.get(key(building, "parking", p.number));
      return o && o.status ? { ...p, status: o.status } : p;
    });
    inv.storage = inv.storage.map((s) => {
      const o = overrides.get(key(building, "storage", s.number));
      return o && o.status ? { ...s, status: o.status } : s;
    });
  }
  return seed;
}
