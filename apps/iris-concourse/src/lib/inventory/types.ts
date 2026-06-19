// ─── Inventory Admin Types ───────────────────────────────────────────────────
// Shared types for the /admin sales inventory tool. Data is currently seeded
// from a static mock (copied from the team Google Sheet). See lib/inventory/data.ts
// for the single accessor seam that will later be swapped for a live Sheets fetch.

export type Building = "concourse" | "iris";

export type InventoryStatus = "active" | "sold" | "pending" | "hold";

export type Designation = "market" | "affordable" | "workforce";

export interface ResidentialUnit {
  building: Building;
  unitNumber: string;
  floor: number;
  beds: number;
  baths: number;
  designation: Designation;
  sqft: number;
  /** Sales price in whole dollars. Concourse: Approved Pricing (Apr 30). Iris: Jervis / Approved Pricing. */
  price: number;
  /** Monthly HOA fee in whole dollars. Estimated for Iris (no HOA column in the sheet yet). */
  hoaFee?: number;
  hoaEstimated?: boolean;
  status: InventoryStatus;
  // Finish / detail columns (from the sheet). Display + filter only; not copied to email.
  views?: string;
  appliances?: string;
  cabinetSize?: string;
  cabinetColor?: string;
  kitchenBacksplash?: string;
  kitchenCountertop?: string;
  bathroomTile?: string;
  bathroomCabinet?: string;
  bathroomCountertop?: string;
  /** Editable comments/notes. */
  notes?: string;
}

/** Finish attributes that are both displayed as columns and filterable. */
export const FINISH_FIELDS: { key: keyof ResidentialUnit; label: string }[] = [
  { key: "views", label: "Views" },
  { key: "appliances", label: "Appliances" },
  { key: "cabinetSize", label: "Cabinet Size" },
  { key: "cabinetColor", label: "Cabinet Color" },
  { key: "kitchenBacksplash", label: "Kitchen Backsplash" },
  { key: "kitchenCountertop", label: "Kitchen Countertop" },
  { key: "bathroomTile", label: "Bathroom Tile" },
  { key: "bathroomCabinet", label: "Bathroom Cabinet" },
  { key: "bathroomCountertop", label: "Bathroom Countertop" },
];

/** Live public residence URL for a unit (the site is adding these routes). */
export function unitUrl(building: Building, unitNumber: string): string {
  return `https://concourseiris.com/${building}/residences/${unitNumber}`;
}

export type ParkingType = "covered" | "uncovered";

export interface ParkingSpace {
  building: Building;
  number: string;
  type: ParkingType;
  price: number;
  status: InventoryStatus;
}

export interface StorageUnit {
  building: Building;
  number: string;
  price: number;
  status: InventoryStatus;
  /** e.g. "Not for sale" for the HOA-owned unit. */
  note?: string;
}

// ─── Display helpers ─────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<InventoryStatus, string> = {
  active: "Active",
  sold: "Sold",
  pending: "Pending",
  hold: "Hold",
};

/** Tailwind classes for status badges. */
export const STATUS_BADGE: Record<InventoryStatus, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  hold: "bg-gray-200 text-gray-700 border-gray-300",
  sold: "bg-black text-white border-black",
};

export const DESIGNATION_LABELS: Record<Designation, string> = {
  market: "Market",
  affordable: "Affordable",
  workforce: "Workforce",
};

export const DESIGNATION_BADGE: Record<Designation, string> = {
  market: "bg-brand-100 text-brand-800 border-brand-200",
  affordable: "bg-emerald-50 text-emerald-700 border-emerald-200",
  workforce: "bg-amber-50 text-amber-700 border-amber-200",
};

export const ALL_STATUSES: InventoryStatus[] = ["active", "pending", "hold", "sold"];
export const ALL_DESIGNATIONS: Designation[] = ["market", "affordable", "workforce"];
