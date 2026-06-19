// ─── Dashboard domain types ──────────────────────────────────────────────────
// Lead-centric view of FUB data for the Concourse & Iris internal dashboard.
// Stage vocabulary mirrors the MDS dashboard so the two read the same way.

export type PipelineStage =
  | "new-lead"
  | "prospect-hot"
  | "prospect-warm"
  | "prospect-cold"
  | "toured"
  | "offer-submitted"
  | "under-contract"
  | "closed"
  | "lost";

export const PIPELINE_STAGES: PipelineStage[] = [
  "new-lead",
  "prospect-hot",
  "prospect-warm",
  "prospect-cold",
  "toured",
  "offer-submitted",
  "under-contract",
  "closed",
  "lost",
];

export const STAGE_LABELS: Record<PipelineStage, string> = {
  "new-lead": "New Lead",
  "prospect-hot": "Prospect — Hot",
  "prospect-warm": "Prospect — Warm",
  "prospect-cold": "Prospect — Cold",
  toured: "Toured",
  "offer-submitted": "Offer Submitted",
  "under-contract": "Under Contract",
  closed: "Closed",
  lost: "Lost",
};

/** Hex colors (charts need raw values, not Tailwind classes). */
export const STAGE_COLORS: Record<PipelineStage, string> = {
  "new-lead": "#6b7280",
  "prospect-hot": "#ef4444",
  "prospect-warm": "#f59e0b",
  "prospect-cold": "#3b82f6",
  toured: "#8b5cf6",
  "offer-submitted": "#f97316",
  "under-contract": "#2563eb",
  closed: "#22c55e",
  lost: "#9ca3af",
};

/** Active = somewhere in the funnel, not closed/lost. */
export const ACTIVE_STAGES: PipelineStage[] = [
  "new-lead",
  "prospect-hot",
  "prospect-warm",
  "prospect-cold",
  "toured",
  "offer-submitted",
  "under-contract",
];

export type Building = "iris" | "concourse" | "both" | "unknown";

export const BUILDING_LABELS: Record<Building, string> = {
  iris: "Iris",
  concourse: "Concourse",
  both: "Both",
  unknown: "Unspecified",
};

/** Normalized lead derived from a FUB person record. */
export interface DashLead {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  stage: PipelineStage;
  /** Raw FUB stage name, kept for debugging / display. */
  fubStage: string | null;
  source: string;
  building: Building;
  tags: string[];
  assignedAgent: string | null;
  /** Buyer / Seller / Agent (FUB person type). */
  type: string | null;
  /** Move/buying timeframe, if the team filled it in (usually blank). */
  moveDate: string | null;
  lastActivity: string | null;
  created: string | null;
  updated: string | null;
  /** True for cooperating-agent / business-development contacts (not buyers). */
  isAgentContact: boolean;
  /** True when source/tags mark them as an open-house attendee (in-person visit). */
  isOpenHouseAttendee: boolean;
}

export interface SourceCount {
  source: string;
  count: number;
}

export interface StageCount {
  stage: PipelineStage;
  count: number;
}

export interface DashboardMetrics {
  totalLeads: number;
  activeLeads: number;
  newThisWeek: number;
  newLastWeek: number;
  /** Percent change week-over-week (null when last week was zero). */
  wowPercent: number | null;
  tours: number;
  underContract: number;
  closed: number;
  byStage: StageCount[];
  bySource: SourceCount[];
  byBuilding: Record<Building, number>;
}

/** Static unit inventory rollup (from src/data/units.json). */
export interface InventorySummary {
  totalUnits: number;
  byBuilding: Record<string, { total: number; byBedrooms: Record<number, number> }>;
}

export interface DashboardData {
  connected: boolean;
  /** Populated when connected === false. */
  error?: string;
  leads: DashLead[];
  metrics: DashboardMetrics;
  inventory: InventorySummary;
  generatedAt: string;
}
