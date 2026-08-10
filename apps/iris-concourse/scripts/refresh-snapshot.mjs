// Generate the weekly report snapshot: logs in, calls the live data route
// (the slow FUB + sheet pull, no timeout here), and writes the result to
// src/data/report-snapshot.json. Run against a locally-started app in CI.
import fs from "node:fs";

// Load .env.local (so this works locally with no extra setup).
try {
  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {}

const BASE = process.env.BASE_URL || "http://localhost:3000";
const PASS = process.env.ADMIN_PASSWORD;
if (!PASS) throw new Error("ADMIN_PASSWORD is required");

const login = await fetch(`${BASE}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ password: PASS }),
});
if (!login.ok) throw new Error(`login failed: ${login.status}`);
const cookie = (login.headers.get("set-cookie") || "").split(";")[0];

console.log("Pulling report data (this can take a couple minutes)…");
const res = await fetch(`${BASE}/api/admin/report-data`, { headers: { cookie } });
if (!res.ok) throw new Error(`report-data failed: ${res.status} ${await res.text()}`);
const data = await res.json();
if (!data?.report?.periodStart) throw new Error("report-data returned no report");

const json = JSON.stringify(data, null, 2);
fs.writeFileSync("src/data/report-snapshot.json", json);

// Archive this week under report-history/<week-ending-Sunday>.json so past
// reports stay linkable. Keyed by weekOf (ISO) → YYYY-MM-DD; re-running the same
// week overwrites its own archive, so history has exactly one entry per week.
const week = (data.report.weekOf || "").slice(0, 10);
if (/^\d{4}-\d{2}-\d{2}$/.test(week)) {
  fs.mkdirSync("src/data/report-history", { recursive: true });
  fs.writeFileSync(`src/data/report-history/${week}.json`, json);
}

console.log(
  `Snapshot written for ${data.report.periodStart} – ${data.report.periodEnd} ` +
    `(${data.report.newProspects} new prospects, ${data.report.touchPoints.total} touch points)` +
    (week ? ` · archived ${week}` : "") + "."
);
