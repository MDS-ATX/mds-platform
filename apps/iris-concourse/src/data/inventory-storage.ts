import type { Building, StorageUnit } from "@/lib/inventory/types";

// ─── Storage ─────────────────────────────────────────────────────────────────
// Concourse: real units + pricing from "Storage and Pricing.pdf" (page 2).
// Unit 2 is HOA-owned and NOT for sale → marked Hold.
// Iris: placeholder mock until real data is provided.

// [unitNumber, price] — price 0 means not for sale.
const CONCOURSE_RAW: [number, number, boolean?][] = [
  [1, 2500],
  [2, 0, true], // HOA — not for sale
  [3, 6000],
  [4, 5000],
  [5, 5000],
  [6, 5000],
  [7, 5000],
  [8, 5000],
  [9, 5000],
  [10, 5000],
  [11, 5000],
  [12, 5000],
  [13, 5000],
  [14, 5000],
  [15, 5000],
  [16, 5000],
  [17, 10000],
  [18, 12000],
  [19, 5000],
  [20, 5000],
  [21, 10000],
  [22, 7000],
  [23, 6000],
  [24, 6000],
  [25, 5000],
  [26, 5000],
  [27, 3000],
];

export const concourseStorage: StorageUnit[] = CONCOURSE_RAW.map(([n, price, notForSale]) => ({
  building: "concourse",
  number: String(n),
  price,
  status: notForSale ? "hold" : "active",
  note: notForSale ? "HOA — not for sale" : undefined,
}));

// Placeholder — replace with the real Iris storage list when available.
export const irisStorage: StorageUnit[] = Array.from({ length: 24 }, (_, i) => ({
  building: "iris" as const,
  number: String(i + 1),
  price: 5000,
  status: "active" as const,
}));
