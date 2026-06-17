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
import {
  readStatusOverrides,
  sheetsConfigured,
  readConcourseUnits,
  readConcourseParking,
  readConcourseStorage,
} from "@/lib/inventory/sheets";

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

  // ── Concourse: source of truth is the official sheet (3 tabs). ──
  try {
    const [units, parking, storage] = await Promise.all([
      readConcourseUnits(),
      readConcourseParking(),
      readConcourseStorage(),
    ]);
    if (units.length) seed.concourse.units = units;
    if (parking.length) seed.concourse.parking = parking;
    if (storage.length) seed.concourse.storage = storage;
  } catch {
    // leave Concourse on seed if the live read fails
  }

  // ── Iris: still seed + the legacy "Admin Status" overlay. ──
  try {
    const overrides = await readStatusOverrides();
    const key = (type: string, id: string) => `iris:${type}:${id}`;
    const inv = seed.iris;
    inv.units = inv.units.map((u) => {
      const o = overrides.get(key("unit", u.unitNumber));
      return o ? { ...u, ...(o.status ? { status: o.status } : {}), ...(o.notes !== undefined ? { notes: o.notes } : {}) } : u;
    });
    inv.parking = inv.parking.map((p) => {
      const o = overrides.get(key("parking", p.number));
      return o && o.status ? { ...p, status: o.status } : p;
    });
    inv.storage = inv.storage.map((s) => {
      const o = overrides.get(key("storage", s.number));
      return o && o.status ? { ...s, status: o.status } : s;
    });
  } catch {
    // leave Iris on seed
  }

  return seed;
}
