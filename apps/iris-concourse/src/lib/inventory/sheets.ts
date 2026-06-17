import { google } from "googleapis";
import type {
  InventoryStatus,
  ResidentialUnit,
  ParkingSpace,
  StorageUnit,
  Designation,
} from "@/lib/inventory/types";

// ─── Google Sheets integration ───────────────────────────────────────────────
// The "Iris & CC - Official Sales Sheet" is the source of truth. For Concourse
// we read units/parking/storage live from three tabs and write Status/Notes
// edits straight back into those tabs. Iris still uses the static seed + the
// "Admin Status" overlay tab (handled lower down) until its tabs are ready.
//
// Column mapping is by HEADER NAME (not position), so adding/reordering columns
// in the sheet won't break the tool.

// Tab titles in the official sheet (overridable via env if ever renamed).
const TAB_CONCOURSE_UNITS = process.env.SHEET_TAB_CONCOURSE_UNITS || "Concourse";
const TAB_CC_PARKING = process.env.SHEET_TAB_CC_PARKING || "CC Parking";
const TAB_CC_STORAGE = process.env.SHEET_TAB_CC_STORAGE || "CC Storage";

// Header row number (1-based) per tab — units have a banner in row 1.
const UNITS_HEADER_ROW = 2;
const PARKING_HEADER_ROW = 1;
const STORAGE_HEADER_ROW = 1;

export function sheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.INVENTORY_SHEET_ID
  );
}

function getSheets() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("Google service account env vars are not configured");
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function sheetId(): string {
  const id = process.env.INVENTORY_SHEET_ID;
  if (!id) throw new Error("INVENTORY_SHEET_ID is not configured");
  return id;
}

// ─── small parsers ───────────────────────────────────────────────────────────

function colLetter(index0: number): string {
  let n = index0 + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function parseMoney(v: string | undefined): number {
  if (!v) return 0;
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : 0;
}
function parseInt0(v: string | undefined): number {
  if (!v) return 0;
  const n = parseInt(String(v).replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}
function clean(v: string | undefined): string | undefined {
  const s = (v ?? "").trim();
  return s ? s : undefined;
}

function normalizeDesignation(raw: string | undefined): Designation {
  const s = (raw || "").trim().toUpperCase();
  if (s.startsWith("AH")) return "affordable";
  if (s.startsWith("WF")) return "workforce";
  return "market";
}

function statusFromSheet(raw: string | undefined): InventoryStatus {
  switch ((raw || "").trim().toLowerCase()) {
    case "sold":
    case "closed": return "sold"; // standardize "Closed" → Sold
    case "pending": return "pending";
    case "hold": return "hold";
    default: return "active";
  }
}
export function statusToSheet(s: InventoryStatus): string {
  return s.charAt(0).toUpperCase() + s.slice(1); // active→Active, etc.
}

/** Build a trimmed/lowercased header→index lookup. */
function headerIndex(headers: string[]): (name: string) => number {
  const map = new Map<string, number>();
  headers.forEach((h, i) => map.set((h || "").trim().toLowerCase(), i));
  return (name: string) => map.get(name.trim().toLowerCase()) ?? -1;
}

async function readTab(title: string, headerRow: number) {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId(),
    range: `${title}!A1:ZZ`,
  });
  const values = res.data.values || [];
  const headers = (values[headerRow - 1] || []).map((h) => String(h));
  const rows = values.slice(headerRow); // data rows after the header
  const firstDataRow = headerRow + 1; // 1-based sheet row of rows[0]
  return { headers, rows, firstDataRow };
}

// ─── Concourse live readers ──────────────────────────────────────────────────

export async function readConcourseUnits(): Promise<ResidentialUnit[]> {
  const { headers, rows } = await readTab(TAB_CONCOURSE_UNITS, UNITS_HEADER_ROW);
  const idx = headerIndex(headers);
  const cUnit = idx("Unit number");
  const out: ResidentialUnit[] = [];
  for (const r of rows) {
    const unitNumber = (r[cUnit] || "").trim();
    if (!unitNumber || !/^\d/.test(unitNumber)) continue; // skip blanks/footers
    out.push({
      building: "concourse",
      unitNumber,
      floor: Math.floor(Number(unitNumber) / 100) || 0,
      beds: parseInt0(r[idx("Bed")]),
      baths: parseInt0(r[idx("Bath")]),
      designation: normalizeDesignation(r[idx("Market / AH")]),
      sqft: parseInt0(r[idx("SQFT")]),
      price: parseMoney(r[idx("Approved Pricing - Apr 30")]),
      hoaFee: parseMoney(r[idx("HOA Fee")]) || undefined,
      status: statusFromSheet(r[idx("Status")]),
      notes: clean(r[idx("Notes")]),
      views: clean(r[idx("Unit Views")]),
      appliances: clean(r[idx("Appliances")]),
      cabinetSize: clean(r[idx("Cabinet Size")]),
      cabinetColor: clean(r[idx("Cabinet Color")]),
      kitchenBacksplash: clean(r[idx("Kitchen Backsplash")]),
      kitchenCountertop: clean(r[idx("Kitchen Countertop")]),
      bathroomTile: clean(r[idx("Bathroom Tile")]),
      bathroomCabinet: clean(r[idx("Bathroom cabinet")]),
      bathroomCountertop: clean(r[idx("Bathroom Countertop")]),
    });
  }
  return out;
}

export async function readConcourseParking(): Promise<ParkingSpace[]> {
  const { headers, rows } = await readTab(TAB_CC_PARKING, PARKING_HEADER_ROW);
  const idx = headerIndex(headers);
  const cSpot = idx("Parking Spot");
  const out: ParkingSpace[] = [];
  for (const r of rows) {
    const number = (r[cSpot] || "").trim();
    if (!number) continue;
    const typeRaw = (r[idx("Type")] || "").trim().toLowerCase();
    out.push({
      building: "concourse",
      number,
      type: typeRaw === "covered" ? "covered" : "uncovered",
      price: parseMoney(r[idx("Price")]),
      status: statusFromSheet(r[idx("Status")]),
      note: clean(r[idx("Notes")]),
    });
  }
  return out;
}

export async function readConcourseStorage(): Promise<StorageUnit[]> {
  const { headers, rows } = await readTab(TAB_CC_STORAGE, STORAGE_HEADER_ROW);
  const idx = headerIndex(headers);
  const cSpace = idx("Storage Space");
  const out: StorageUnit[] = [];
  for (const r of rows) {
    const number = (r[cSpace] || "").trim();
    if (!number) continue;
    out.push({
      building: "concourse",
      number,
      price: parseMoney(r[idx("Price")]),
      status: statusFromSheet(r[idx("Status")]),
      note: clean(r[idx("Notes")]),
    });
  }
  return out;
}

// ─── Concourse write-back ────────────────────────────────────────────────────

type ConcourseType = "unit" | "parking" | "storage";

const TAB_FOR: Record<ConcourseType, { title: string; headerRow: number; keyHeader: string }> = {
  unit: { title: TAB_CONCOURSE_UNITS, headerRow: UNITS_HEADER_ROW, keyHeader: "Unit number" },
  parking: { title: TAB_CC_PARKING, headerRow: PARKING_HEADER_ROW, keyHeader: "Parking Spot" },
  storage: { title: TAB_CC_STORAGE, headerRow: STORAGE_HEADER_ROW, keyHeader: "Storage Space" },
};

/** Update the Status and/or Notes cell for a Concourse item, by id. */
export async function writeConcourseEdit(params: {
  type: ConcourseType;
  id: string;
  status?: InventoryStatus;
  notes?: string;
}): Promise<void> {
  const { type, id } = params;
  const cfg = TAB_FOR[type];
  const sheets = getSheets();
  const spreadsheetId = sheetId();

  const { headers, rows, firstDataRow } = await readTab(cfg.title, cfg.headerRow);
  const idx = headerIndex(headers);
  const keyCol = idx(cfg.keyHeader);
  if (keyCol < 0) throw new Error(`Key column "${cfg.keyHeader}" not found in "${cfg.title}"`);

  let dataRow = -1;
  for (let i = 0; i < rows.length; i++) {
    if ((rows[i][keyCol] || "").trim() === id) {
      dataRow = i;
      break;
    }
  }
  if (dataRow < 0) throw new Error(`Row "${id}" not found in "${cfg.title}"`);
  const sheetRow = firstDataRow + dataRow; // 1-based

  const updates: { range: string; values: string[][] }[] = [];
  if (params.status !== undefined) {
    const c = idx("Status");
    if (c < 0) throw new Error(`"Status" column not found in "${cfg.title}"`);
    updates.push({
      range: `${cfg.title}!${colLetter(c)}${sheetRow}`,
      values: [[statusToSheet(params.status)]],
    });
  }
  if (params.notes !== undefined) {
    const c = idx("Notes");
    if (c < 0) throw new Error(`"Notes" column not found in "${cfg.title}"`);
    updates.push({
      range: `${cfg.title}!${colLetter(c)}${sheetRow}`,
      values: [[params.notes]],
    });
  }
  if (updates.length === 0) return;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: "USER_ENTERED", data: updates },
  });
}

// ─── Iris "Admin Status" overlay (legacy; kept until Iris tabs are wired) ─────

export type OverrideType = "unit" | "parking" | "storage";
export interface StatusOverride {
  status?: InventoryStatus;
  notes?: string;
}
const HEADER = ["building", "type", "id", "status", "notes", "updatedAt"];
function statusTabName(): string {
  return process.env.INVENTORY_STATUS_TAB || "Admin Status";
}
function overrideKey(building: string, type: string, id: string): string {
  return `${building}:${type}:${id}`;
}

export async function ensureStatusTab(): Promise<void> {
  const sheets = getSheets();
  const spreadsheetId = sheetId();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = meta.data.sheets?.some((s) => s.properties?.title === statusTabName());
  if (exists) return;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ addSheet: { properties: { title: statusTabName() } } }] },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${statusTabName()}!A1:F1`,
    valueInputOption: "RAW",
    requestBody: { values: [HEADER] },
  });
}

export async function readStatusOverrides(): Promise<Map<string, StatusOverride>> {
  const sheets = getSheets();
  const map = new Map<string, StatusOverride>();
  let res;
  try {
    res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId(),
      range: `${statusTabName()}!A2:F`,
    });
  } catch {
    return map;
  }
  for (const row of res.data.values || []) {
    const [building, type, id, status, notes] = row;
    if (!building || !type || !id) continue;
    map.set(overrideKey(building, type, id), {
      status: (status as InventoryStatus) || undefined,
      notes: notes || undefined,
    });
  }
  return map;
}

export async function writeStatusOverride(params: {
  building: string;
  type: OverrideType;
  id: string;
  status?: InventoryStatus;
  notes?: string;
  updatedAt: string;
}): Promise<void> {
  const sheets = getSheets();
  const spreadsheetId = sheetId();
  await ensureStatusTab();
  const { building, type, id, status = "", notes = "", updatedAt } = params;
  const targetKey = overrideKey(building, type, id);
  const newRow = [building, type, id, status, notes, updatedAt];
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${statusTabName()}!A2:C`,
  });
  const rows = existing.data.values || [];
  let rowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    const [b, t, identifier] = rows[i];
    if (b && t && identifier && overrideKey(b, t, identifier) === targetKey) {
      rowIndex = i;
      break;
    }
  }
  if (rowIndex >= 0) {
    const sheetRow = rowIndex + 2;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${statusTabName()}!A${sheetRow}:F${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: { values: [newRow] },
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${statusTabName()}!A:F`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [newRow] },
    });
  }
}
