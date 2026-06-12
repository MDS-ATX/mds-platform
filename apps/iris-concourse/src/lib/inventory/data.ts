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
