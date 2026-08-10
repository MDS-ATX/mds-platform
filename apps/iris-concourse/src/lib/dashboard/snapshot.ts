// ─── Report snapshot ─────────────────────────────────────────────────────────
// The weekly GitHub Action computes the report (the slow FUB + sheet pull) and
// writes the result to report-snapshot.json. The page reads that snapshot so it
// loads instantly and shows the same numbers all week — never doing the heavy
// pull at request time (which would exceed Vercel's function timeout).

import fs from "node:fs";
import path from "node:path";
import type { ReportData } from "./get-report-data";

const DATA_DIR = path.join(process.cwd(), "src/data");
const SNAPSHOT_PATH = path.join(DATA_DIR, "report-snapshot.json");
const HISTORY_DIR = path.join(DATA_DIR, "report-history");

export function readSnapshot(): ReportData | null {
  try {
    const raw = fs.readFileSync(SNAPSHOT_PATH, "utf8");
    const data = JSON.parse(raw);
    return data && data.report ? (data as ReportData) : null;
  } catch {
    return null;
  }
}

export function writeSnapshot(data: ReportData): void {
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(data, null, 2));
}

const WEEK_RE = /^\d{4}-\d{2}-\d{2}$/;

/** One archived report, identified by its week-ending Sunday (YYYY-MM-DD). */
export interface HistoryEntry {
  week: string; // YYYY-MM-DD (week-ending Sunday)
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  newProspects: number;
  visits: number;
  touchPoints: number;
}

/** Read one archived week's report, or null if that week isn't archived. */
export function readSnapshotForWeek(week: string): ReportData | null {
  if (!WEEK_RE.test(week)) return null;
  try {
    const raw = fs.readFileSync(path.join(HISTORY_DIR, `${week}.json`), "utf8");
    const data = JSON.parse(raw);
    return data && data.report ? (data as ReportData) : null;
  } catch {
    return null;
  }
}

/** All archived weeks, newest first, as lightweight index entries. */
export function listHistory(): HistoryEntry[] {
  let files: string[];
  try {
    files = fs.readdirSync(HISTORY_DIR);
  } catch {
    return [];
  }
  const entries: HistoryEntry[] = [];
  for (const f of files) {
    const week = f.replace(/\.json$/, "");
    if (!f.endsWith(".json") || !WEEK_RE.test(week)) continue;
    try {
      const data = JSON.parse(fs.readFileSync(path.join(HISTORY_DIR, f), "utf8"));
      const r = data?.report;
      if (!r) continue;
      entries.push({
        week,
        periodStart: r.periodStart,
        periodEnd: r.periodEnd,
        generatedAt: data.generatedAt ?? "",
        newProspects: r.newProspects ?? 0,
        visits: r.visits?.total ?? 0,
        touchPoints: r.touchPoints?.total ?? 0,
      });
    } catch {
      // skip unreadable/partial archive files
    }
  }
  return entries.sort((a, b) => b.week.localeCompare(a.week));
}
