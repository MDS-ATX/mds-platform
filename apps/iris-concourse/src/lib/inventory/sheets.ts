import { google } from "googleapis";
import type {
  InventoryStatus,
  ResidentialUnit,
  ParkingSpace,
  StorageUnit,
  Designation,
  Building,
} from "@/lib/inventory/types";

// ─── Google Sheets integration ───────────────────────────────────────────────
// The "Iris & CC - Official Sales Sheet" is the source of truth. Both buildings
// read units/parking/storage live from their tabs, and panel edits to
// Status/Notes write straight back. Column mapping is by HEADER NAME with
// aliases (Iris uses slightly different header names than Concourse), so adding
// or reordering columns won't break the tool.

type SectionType = "unit" | "parking" | "storage";

interface TabCfg {
  title: string;
  headerRow: number; // 1-based row containing the headers
}

const TABS: Record<Building, Record<SectionType, TabCfg>> = {
  concourse: {
    unit: { title: "Concourse", headerRow: 2 },
    parking: { title: "CC Parking", headerRow: 1 },
    storage: { title: "CC Storage", headerRow: 1 },
  },
  iris: {
    unit: { title: "Iris", headerRow: 2 },
    parking: { title: "Iris Parking", headerRow: 1 },
    storage: { title: "Iris Storage", headerRow: 1 },
  },
};

// Header aliases (first match wins, trimmed + case-insensitive).
const H = {
  unitNumber: ["Unit number", "Unit Number"],
  beds: ["Bed", "Beds"],
  baths: ["Bath", "Baths"],
  designation: ["Market / AH", "Market / AH (NEW)", "Market/AH"],
  sqft: ["SQFT"],
  price: ["Approved Pricing", "Approved Pricing - Apr 30", "Pricing - Apr 30", "Pricing"],
  hoa: ["HOA Fee"],
  notes: ["Notes"],
  status: ["Status"],
  views: ["Unit Views", "View"],
  appliances: ["Appliances"],
  cabinetSize: ["Cabinet Size"],
  cabinetColor: ["Cabinet Color"],
  kitchenBacksplash: ["Kitchen Backsplash"],
  kitchenCountertop: ["Kitchen Countertop"],
  bathroomTile: ["Bathroom Tile"],
  bathroomCabinet: ["Bathroom cabinet", "Bathroom Cabinet"],
  bathroomCountertop: ["Bathroom Countertop"],
  // parking / storage
  parkingSpot: ["Parking Spot"],
  parkingType: ["Type"],
  storageSpace: ["Storage Space"],
  price2: ["Price"],
};

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

// ─── parsers ─────────────────────────────────────────────────────────────────

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
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Resolve a header alias list to a column index (-1 if none present). */
function resolver(headers: string[]) {
  const map = new Map<string, number>();
  headers.forEach((h, i) => map.set((h || "").trim().toLowerCase(), i));
  return (aliases: string[]) => {
    for (const a of aliases) {
      const i = map.get(a.trim().toLowerCase());
      if (i !== undefined) return i;
    }
    return -1;
  };
}

// The price header carries a re-pricing date that changes over time
// ("Approved Pricing - Apr 30" → "Approved Pricing"), so when no alias matches
// exactly, fall back to the first header starting with a pricing prefix. Guarded
// to these prefixes so "Original Pricing" / "Approved $/sf" never win.
const PRICE_PREFIXES = ["approved pricing", "pricing"];
function priceCol(headers: string[], idx: (aliases: string[]) => number): number {
  const exact = idx(H.price);
  if (exact >= 0) return exact;
  const norm = headers.map((h) => (h || "").trim().toLowerCase());
  for (const prefix of PRICE_PREFIXES) {
    const i = norm.findIndex((h) => h.startsWith(prefix));
    if (i >= 0) return i;
  }
  return -1;
}

async function readTab(cfg: TabCfg) {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId(),
    range: `${cfg.title}!A1:ZZ`,
  });
  const values = res.data.values || [];
  const headers = (values[cfg.headerRow - 1] || []).map((h) => String(h));
  const rows = values.slice(cfg.headerRow);
  const firstDataRow = cfg.headerRow + 1;
  return { headers, rows, firstDataRow };
}

// ─── live readers (building-aware) ───────────────────────────────────────────

export async function readUnits(building: Building): Promise<ResidentialUnit[]> {
  const { headers, rows } = await readTab(TABS[building].unit);
  const idx = resolver(headers);
  const cUnit = idx(H.unitNumber);
  const cPrice = priceCol(headers, idx);
  const out: ResidentialUnit[] = [];
  for (const r of rows) {
    const unitNumber = (r[cUnit] || "").trim();
    if (!unitNumber || !/^\d/.test(unitNumber)) continue;
    const at = (a: string[]) => { const i = idx(a); return i >= 0 ? r[i] : undefined; };
    out.push({
      building,
      unitNumber,
      floor: Math.floor(Number(unitNumber) / 100) || 0,
      beds: parseInt0(at(H.beds)),
      baths: parseInt0(at(H.baths)),
      designation: normalizeDesignation(at(H.designation)),
      sqft: parseInt0(at(H.sqft)),
      price: parseMoney(cPrice >= 0 ? r[cPrice] : undefined),
      hoaFee: parseMoney(at(H.hoa)) || undefined,
      status: statusFromSheet(at(H.status)),
      notes: clean(at(H.notes)),
      views: clean(at(H.views)),
      appliances: clean(at(H.appliances)),
      cabinetSize: clean(at(H.cabinetSize)),
      cabinetColor: clean(at(H.cabinetColor)),
      kitchenBacksplash: clean(at(H.kitchenBacksplash)),
      kitchenCountertop: clean(at(H.kitchenCountertop)),
      bathroomTile: clean(at(H.bathroomTile)),
      bathroomCabinet: clean(at(H.bathroomCabinet)),
      bathroomCountertop: clean(at(H.bathroomCountertop)),
    });
  }
  return out;
}

export async function readParking(building: Building): Promise<ParkingSpace[]> {
  const { headers, rows } = await readTab(TABS[building].parking);
  const idx = resolver(headers);
  const cSpot = idx(H.parkingSpot);
  if (cSpot < 0) return [];
  const out: ParkingSpace[] = [];
  for (const r of rows) {
    const number = (r[cSpot] || "").trim();
    if (!number) continue;
    const at = (a: string[]) => { const i = idx(a); return i >= 0 ? r[i] : undefined; };
    const typeRaw = (at(H.parkingType) || "").trim().toLowerCase();
    out.push({
      building,
      number,
      type: typeRaw === "covered" ? "covered" : "uncovered",
      price: parseMoney(at(H.price2)),
      status: statusFromSheet(at(H.status)),
      note: clean(at(H.notes)),
    });
  }
  return out;
}

export async function readStorage(building: Building): Promise<StorageUnit[]> {
  const { headers, rows } = await readTab(TABS[building].storage);
  const idx = resolver(headers);
  const cSpace = idx(H.storageSpace);
  if (cSpace < 0) return [];
  const out: StorageUnit[] = [];
  for (const r of rows) {
    const number = (r[cSpace] || "").trim();
    if (!number) continue;
    const at = (a: string[]) => { const i = idx(a); return i >= 0 ? r[i] : undefined; };
    out.push({
      building,
      number,
      price: parseMoney(at(H.price2)),
      status: statusFromSheet(at(H.status)),
      note: clean(at(H.notes)),
    });
  }
  return out;
}

// ─── write-back (building-aware) ─────────────────────────────────────────────

const KEY_HEADER: Record<SectionType, string[]> = {
  unit: H.unitNumber,
  parking: H.parkingSpot,
  storage: H.storageSpace,
};

export async function writeEdit(params: {
  building: Building;
  type: SectionType;
  id: string;
  status?: InventoryStatus;
  notes?: string;
}): Promise<void> {
  const { building, type, id } = params;
  const cfg = TABS[building][type];
  const sheets = getSheets();
  const spreadsheetId = sheetId();

  const { headers, rows, firstDataRow } = await readTab(cfg);
  const idx = resolver(headers);
  const keyCol = idx(KEY_HEADER[type]);
  if (keyCol < 0) throw new Error(`Key column not found in "${cfg.title}"`);

  let dataRow = -1;
  for (let i = 0; i < rows.length; i++) {
    if ((rows[i][keyCol] || "").trim() === id) { dataRow = i; break; }
  }
  if (dataRow < 0) throw new Error(`Row "${id}" not found in "${cfg.title}"`);
  const sheetRow = firstDataRow + dataRow;

  const updates: { range: string; values: string[][] }[] = [];
  if (params.status !== undefined) {
    const c = idx(H.status);
    if (c < 0) throw new Error(`"Status" column not found in "${cfg.title}"`);
    updates.push({ range: `${cfg.title}!${colLetter(c)}${sheetRow}`, values: [[statusToSheet(params.status)]] });
  }
  if (params.notes !== undefined) {
    const c = idx(H.notes);
    if (c < 0) throw new Error(`"Notes" column not found in "${cfg.title}"`);
    updates.push({ range: `${cfg.title}!${colLetter(c)}${sheetRow}`, values: [[params.notes]] });
  }
  if (updates.length === 0) return;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: "USER_ENTERED", data: updates },
  });
}
