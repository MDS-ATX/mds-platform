import type { Building, ParkingSpace } from "@/lib/inventory/types";

// ─── Parking ─────────────────────────────────────────────────────────────────
// Concourse: real layout from the Concourse Parking Map. Spaces 1–47, EXCLUDING
// retail spaces 7–13 and 43–45. Covered = 17–22 and 37–42; everything else is
// uncovered. Covered = $15,000, Uncovered = $10,000.
// Iris: placeholder mock until real data is provided.

const RETAIL = new Set([7, 8, 9, 10, 11, 12, 13, 43, 44, 45]);
const COVERED = new Set([17, 18, 19, 20, 21, 22, 37, 38, 39, 40, 41, 42]);

function buildConcourseParking(): ParkingSpace[] {
  const spaces: ParkingSpace[] = [];
  for (let n = 1; n <= 47; n++) {
    if (RETAIL.has(n)) continue; // retail — not part of our for-sale inventory
    const type = COVERED.has(n) ? "covered" : "uncovered";
    spaces.push({
      building: "concourse",
      number: String(n),
      type,
      price: type === "covered" ? 15000 : 10000,
      status: "active",
    });
  }
  return spaces;
}

function buildIrisParkingPlaceholder(): ParkingSpace[] {
  // Placeholder — replace with the real Iris parking map when available.
  return Array.from({ length: 30 }, (_, i) => {
    const n = i + 1;
    const type = n <= 18 ? "covered" : "uncovered";
    return {
      building: "iris" as const,
      number: String(n),
      type,
      price: type === "covered" ? 15000 : 10000,
      status: "active" as const,
    };
  });
}

export const concourseParking: ParkingSpace[] = buildConcourseParking();
export const irisParking: ParkingSpace[] = buildIrisParkingPlaceholder();
