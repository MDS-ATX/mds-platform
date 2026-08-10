// ─── Team-log "CC Contracts" tab (Google Sheets) ─────────────────────────────
// Reads the link-shared sheet as CSV (no auth) and maps rows to the report's
// Offers / Under Contract sections. Status drives the bucket:
//   Offer → offers, Pending/Under Contract → under contract, Closed → closed.

import type { DealDetail, ContractActivity } from "./report";

const SHEET_ID = process.env.CONTRACTS_SHEET_ID;
const SHEET_GID = process.env.CONTRACTS_SHEET_GID;

/** Minimal RFC-4180 CSV parser (handles quoted fields with commas/quotes). */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (ch === "\r") { /* skip */ }
    else field += ch;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function num(s: string | undefined): number | null {
  if (!s) return null;
  const cleaned = s.replace(/[$,\s]/g, "");
  if (cleaned === "" || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function dateISO(s: string | undefined): string | null {
  if (!s || !s.trim()) return null;
  const t = Date.parse(s.trim());
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

function bucketOf(status: string): "offers" | "underContract" | "closed" | "hold" | null {
  const s = status.toLowerCase();
  // Dead deals never count toward any bucket — checked first so a status like
  // "Offer - Rejected" can't slip into offers.
  if (/reject|rescind|denied|declined|withdraw|cancel|dead|lost/.test(s)) return null;
  if (/closed|sold/.test(s)) return "closed";
  if (/pending|under\s*contract|executed/.test(s)) return "underContract";
  // "Offer" and "Waiting for Approval" are both live, submitted offers.
  if (/offer|waiting|approval/.test(s)) return "offers";
  if (/hold/.test(s)) return "hold";
  return null;
}

const EMPTY: ContractActivity = {
  offers: [],
  underContract: [],
  closed: { count: 0, volume: null },
  closedDeals: [],
  hold: { count: 0 },
};

export async function getSheetContracts(): Promise<ContractActivity> {
  if (!SHEET_ID || !SHEET_GID) return EMPTY;
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

  let rows: string[][];
  try {
    const res = await fetch(url, { redirect: "follow", cache: "no-store" });
    if (!res.ok) return EMPTY;
    rows = parseCSV(await res.text());
  } catch {
    return EMPTY;
  }
  if (rows.length < 2) return EMPTY;

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.findIndex((h) => h === name.toLowerCase());
  const idx = {
    unit: col("Unit Number"),
    status: col("Status"),
    base: col("Base Price"),
    offer: col("Offer Price"),
    net: col("Sales Price (net)"),
    parking: col("Parking Cost"),
    storage: col("Storage Cost"),
    incentive: col("Incentive"),
    offerDate: col("Offer Date"),
    executedDate: col("Executed Date"),
  };

  // A unit can have several rows as a deal progresses (offer → pending →
  // closed) or falls through (offer → rejected). Only the most-recent row per
  // unit counts, so stale rows don't double-count. Recency = the latest date on
  // the row. Dead rows (rejected/rescinded) still participate in the recency
  // race — so if a unit's LATEST row is dead, the unit drops out entirely.
  const recencyOf = (d: DealDetail) =>
    Math.max(Date.parse(d.executedDate ?? "") || 0, Date.parse(d.offerDate ?? "") || 0);

  const latest = new Map<
    string,
    { deal: DealDetail; bucket: ReturnType<typeof bucketOf>; rank: number }
  >();
  for (const r of rows.slice(1)) {
    const unit = (r[idx.unit] ?? "").trim();
    if (!unit) continue;
    const bucket = bucketOf(r[idx.status] ?? "");

    const deal: DealDetail = {
      building: "concourse",
      unit,
      basePrice: num(r[idx.base]),
      offerPrice: num(r[idx.offer]),
      net: num(r[idx.net]),
      incentive: (r[idx.incentive] ?? "").trim() || null,
      parking: num(r[idx.parking]),
      storage: num(r[idx.storage]),
      offerDate: dateISO(r[idx.offerDate]),
      executedDate: dateISO(r[idx.executedDate]),
      status: (r[idx.status] ?? "").trim() || null,
    };

    const rank = recencyOf(deal);
    const prev = latest.get(unit);
    // >= so that on a date tie the later sheet row (added below) wins.
    if (!prev || rank >= prev.rank) latest.set(unit, { deal, bucket, rank });
  }

  const offers: DealDetail[] = [];
  const underContract: DealDetail[] = [];
  const closedDeals: DealDetail[] = [];
  let holdCount = 0;
  for (const { deal, bucket } of latest.values()) {
    if (bucket === "offers") offers.push(deal);
    else if (bucket === "underContract") underContract.push(deal);
    else if (bucket === "closed") closedDeals.push(deal);
    else if (bucket === "hold") holdCount++;
    // bucket null (dead/unrecognized latest row) → unit intentionally omitted.
  }
  const closedCount = closedDeals.length;
  const closedVolume = closedDeals.reduce((s, d) => s + (d.net ?? 0), 0);

  return {
    offers,
    underContract,
    closed: { count: closedCount, volume: closedCount > 0 ? closedVolume : null },
    closedDeals,
    hold: { count: holdCount },
  };
}
