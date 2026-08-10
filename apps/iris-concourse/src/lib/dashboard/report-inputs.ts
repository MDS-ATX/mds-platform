// ─── Weekly manual report inputs ─────────────────────────────────────────────
// Figures not available from FUB. Edit src/data/report-inputs.json each week.
// Base (approved) price for offers/contracts is auto-resolved from the team log.

import inputs from "@/data/report-inputs.json";
import type { Building } from "@/lib/inventory/types";

export interface DealInput {
  building: Building;
  unit: string;
  offerPrice: number | null;
  incentive: number | null;
  parking: number | null;
  storage: number | null;
  /** Offers only: date the offer was received (YYYY-MM-DD). */
  offerDate?: string | null;
  /** Under-contract only: when the contract was executed (YYYY-MM-DD). */
  executedDate?: string | null;
}

export interface ReportInputs {
  weekOf: string;
  offers: DealInput[];
  underContract: DealInput[];
  closed: { count: number; volume: number | null };
  hold: { count: number };
}

export function getReportInputs(): ReportInputs {
  const i = inputs as unknown as Partial<ReportInputs> & { weekOf: string };
  return {
    weekOf: i.weekOf,
    offers: i.offers ?? [],
    underContract: i.underContract ?? [],
    closed: i.closed ?? { count: 0, volume: null },
    hold: i.hold ?? { count: 0 },
  };
}
