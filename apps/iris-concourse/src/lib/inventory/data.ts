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
import { sheetsConfigured, readUnits, readParking, readStorage } from "@/lib/inventory/sheets";

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

// ─── Live inventory (official sheet = source of truth) ───────────────────────
// Both buildings read units/parking/storage live from the sheet. Each section
// falls back to its seed if that tab read fails or is empty.
export async function getLiveInventory(): Promise<Record<Building, BuildingInventory>> {
  const seed = getFullInventory();
  if (!sheetsConfigured()) return seed;

  for (const building of ["concourse", "iris"] as Building[]) {
    try {
      const [units, parking, storage] = await Promise.all([
        readUnits(building),
        readParking(building),
        readStorage(building),
      ]);
      if (units.length) seed[building].units = units;
      if (parking.length) seed[building].parking = parking;
      if (storage.length) seed[building].storage = storage;
    } catch {
      // leave this building on seed if the live read fails
    }
  }

  return seed;
}
