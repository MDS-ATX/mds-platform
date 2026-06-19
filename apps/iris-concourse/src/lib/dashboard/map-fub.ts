// ─── FUB person → DashLead mapping ───────────────────────────────────────────
// Single place to adjust once the live FUB account's exact stage/source names
// are confirmed (see plan blocker #3).

import type { FUBPersonRecord } from "@/lib/crm";
import type { Building, DashLead, PipelineStage } from "./types";

/**
 * Map a FUB stage name onto a dashboard pipeline stage.
 *
 * This account uses cadence-based stages (e.g. "Follow Up Daily",
 * "COLD Follow Up 90 Days") rather than a clean sales funnel, so the exact-name
 * table below is the source of truth. The regex rules are only a fallback for
 * stages that don't appear in the table (e.g. a newly-created FUB stage).
 *
 * Keys are matched case-insensitively against the trimmed FUB stage name.
 * Adjust here when the team adds/renames stages.
 */
const STAGE_EXACT: Record<string, PipelineStage> = {
  // Top of funnel
  lead: "new-lead",
  "attempting contact": "new-lead",
  // Active nurture (short cadence) → warm
  "follow up daily": "prospect-warm",
  "follow up 3 days": "prospect-warm",
  "follow up 7 days": "prospect-warm",
  "follow up 14 days": "prospect-warm",
  "follow up 21 days": "prospect-warm",
  // Long cadence → cold
  "follow up 30 days": "prospect-cold",
  "follow up 45 days": "prospect-cold",
  "cold follow up 90 days": "prospect-cold",
  // Business development outreach (not buyer leads) → cold bucket for now
  bd: "prospect-cold",
  "bd attempting contact": "prospect-cold",
  // Bottom of funnel
  pending: "under-contract",
  closed: "closed",
  trash: "lost",
};

const STAGE_RULES: Array<{ test: RegExp; stage: PipelineStage }> = [
  { test: /lost|trash|dead|unqualified/i, stage: "lost" },
  { test: /closed|won|sold|purchased/i, stage: "closed" },
  { test: /under\s*contract|pending|escrow/i, stage: "under-contract" },
  { test: /offer|application|reserved/i, stage: "offer-submitted" },
  { test: /tour|showing|visited|appointment/i, stage: "toured" },
  { test: /hot/i, stage: "prospect-hot" },
  { test: /cold|past|stale|90/i, stage: "prospect-cold" },
  { test: /warm|nurtur|follow\s*up/i, stage: "prospect-warm" },
  { test: /prospect|active|qualif|contact|engaged|bd/i, stage: "prospect-warm" },
  { test: /new|lead|inquir/i, stage: "new-lead" },
];

export function mapStage(fubStage: string | null | undefined): PipelineStage {
  if (!fubStage) return "new-lead";
  const exact = STAGE_EXACT[fubStage.trim().toLowerCase()];
  if (exact) return exact;
  for (const rule of STAGE_RULES) {
    if (rule.test.test(fubStage)) return rule.stage;
  }
  return "new-lead";
}

/** Pretty source label, preferring FUB's `source` then any `source:*` tag. */
const SOURCE_TAG_LABELS: Record<string, string> = {
  zillow: "Zillow",
  mls: "MLS",
  realtor: "Realtor.com",
  signs: "Signs",
  mailer: "Mailer",
  "word-of-mouth": "Word of Mouth",
  email: "Email",
  "open-house": "Walk-In",
  other: "Other",
};

/** Normalize a raw source string to a display label (no "open house" verbiage). */
function normalizeSourceLabel(raw: string): string {
  if (OPEN_HOUSE_RE.test(raw)) return "Walk-In";
  return raw;
}

export function mapSource(person: FUBPersonRecord): string {
  if (person.source && person.source.trim()) {
    return normalizeSourceLabel(person.source.trim());
  }
  const tag = (person.tags ?? []).find((t) => t.startsWith("source:"));
  if (tag) {
    const key = tag.slice("source:".length).toLowerCase();
    return SOURCE_TAG_LABELS[key] ?? titleCase(key);
  }
  return "Unknown";
}

/** Derive interested building from `building:*` tags. */
export function mapBuilding(tags: string[] = []): Building {
  const buildings = new Set<string>();
  for (const t of tags) {
    if (t === "building:iris" || t === "building:both") buildings.add("iris");
    if (t === "building:concourse" || t === "building:both") buildings.add("concourse");
  }
  const hasIris = buildings.has("iris");
  const hasConcourse = buildings.has("concourse");
  if (hasIris && hasConcourse) return "both";
  if (hasIris) return "iris";
  if (hasConcourse) return "concourse";
  return "unknown";
}

function fullName(p: FUBPersonRecord): string {
  if (p.name && p.name.trim()) return p.name.trim();
  const joined = [p.firstName, p.lastName].filter(Boolean).join(" ").trim();
  return joined || "Unknown";
}

function titleCase(s: string): string {
  return s.replace(/(^|[\s-])\w/g, (m) => m.toUpperCase()).replace(/-/g, " ");
}

/** Cooperating-agent / business-development contacts, not buyer prospects. */
function detectAgentContact(p: FUBPersonRecord, tags: string[]): boolean {
  if ((p.type ?? "").toLowerCase() === "agent") return true;
  if (/^bd\b/i.test(p.stage ?? "")) return true;
  return tags.some((t) => /agent/i.test(t));
}

/**
 * Open-house attendee = physically visited. Detected from either the FUB
 * `source` ("Open House") or an "Open House Attendee" tag. Read-only signal —
 * we treat these as in-person visits for reporting without writing FUB
 * appointments.
 */
const OPEN_HOUSE_RE = /open[\s-]*house/i;
function detectOpenHouse(p: FUBPersonRecord, tags: string[]): boolean {
  if (OPEN_HOUSE_RE.test(p.source ?? "")) return true;
  return tags.some((t) => OPEN_HOUSE_RE.test(t));
}

export function mapPersonToLead(p: FUBPersonRecord): DashLead {
  const tags = p.tags ?? [];
  const moveDate =
    p.timeframeDateRange && String(p.timeframeDateRange).trim()
      ? String(p.timeframeDateRange)
      : p.timeframeStatus && String(p.timeframeStatus).trim()
        ? String(p.timeframeStatus)
        : null;
  return {
    id: p.id,
    name: fullName(p),
    email: p.emails?.[0]?.value ?? null,
    phone: p.phones?.[0]?.value ?? null,
    stage: mapStage(p.stage),
    fubStage: p.stage ?? null,
    source: mapSource(p),
    building: mapBuilding(tags),
    tags,
    assignedAgent: p.assignedTo ?? null,
    type: p.type ?? null,
    moveDate,
    lastActivity: p.lastActivity ?? null,
    created: p.created ?? null,
    updated: p.updated ?? null,
    isAgentContact: detectAgentContact(p, tags),
    isOpenHouseAttendee: detectOpenHouse(p, tags),
  };
}
