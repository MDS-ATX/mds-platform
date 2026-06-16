import { google } from "googleapis";
import type { InventoryStatus } from "@/lib/inventory/types";

// ─── Google Sheets persistence ───────────────────────────────────────────────
// The /admin tool persists editable state (status + notes for units, parking,
// and storage) into a dedicated "Admin Status" tab in the team spreadsheet, so
// we never touch their pricing tabs. One row per edited item, keyed by
// (building, type, id). Pricing/finish data still comes from the static seed.

export type OverrideType = "unit" | "parking" | "storage";

export interface StatusOverride {
  status?: InventoryStatus;
  notes?: string;
}

const HEADER = ["building", "type", "id", "status", "notes", "updatedAt"];

function tabName(): string {
  return process.env.INVENTORY_STATUS_TAB || "Admin Status";
}

export function sheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY &&
      process.env.INVENTORY_SHEET_ID
  );
}

function overrideKey(building: string, type: string, id: string): string {
  return `${building}:${type}:${id}`;
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

/** Create the "Admin Status" tab + header row if it doesn't exist yet. */
export async function ensureStatusTab(): Promise<void> {
  const sheets = getSheets();
  const spreadsheetId = sheetId();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = meta.data.sheets?.some((s) => s.properties?.title === tabName());
  if (exists) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ addSheet: { properties: { title: tabName() } } }] },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName()}!A1:F1`,
    valueInputOption: "RAW",
    requestBody: { values: [HEADER] },
  });
}

/** Read all saved overrides, keyed `${building}:${type}:${id}`. */
export async function readStatusOverrides(): Promise<Map<string, StatusOverride>> {
  const sheets = getSheets();
  const map = new Map<string, StatusOverride>();
  let res;
  try {
    res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId(),
      range: `${tabName()}!A2:F`,
    });
  } catch {
    // Tab probably doesn't exist yet — nothing saved.
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

/** Upsert a single override row (by building+type+id). */
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

  // Find existing row index (A2:C downward).
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName()}!A2:C`,
  });
  const rows = existing.data.values || [];
  let rowIndex = -1; // 0-based within A2:C
  for (let i = 0; i < rows.length; i++) {
    const [b, t, identifier] = rows[i];
    if (b && t && identifier && overrideKey(b, t, identifier) === targetKey) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex >= 0) {
    const sheetRow = rowIndex + 2; // account for header
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tabName()}!A${sheetRow}:F${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: { values: [newRow] },
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tabName()}!A:F`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [newRow] },
    });
  }
}
