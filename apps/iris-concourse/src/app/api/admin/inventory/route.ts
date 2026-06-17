import { NextResponse } from "next/server";
import {
  sheetsConfigured,
  writeConcourseEdit,
  writeStatusOverride,
  type OverrideType,
} from "@/lib/inventory/sheets";
import type { InventoryStatus } from "@/lib/inventory/types";

// POST { building, type, id, status?, notes? }
//  - Concourse → writes Status/Notes straight into the official sheet tabs.
//  - Iris → legacy "Admin Status" overlay tab (until Iris tabs are wired).
// Protected by middleware (matcher covers /api/admin/:path*).

const VALID_TYPES: OverrideType[] = ["unit", "parking", "storage"];
const VALID_STATUS: InventoryStatus[] = ["active", "sold", "pending", "hold"];

export async function POST(request: Request) {
  if (!sheetsConfigured()) {
    return NextResponse.json(
      { error: "Saving is not configured (Google service account env vars missing)" },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const building = body.building;
  const type = body.type;
  const id = body.id;
  const status = body.status;
  const notes = body.notes;

  if (
    (building !== "concourse" && building !== "iris") ||
    typeof type !== "string" ||
    !VALID_TYPES.includes(type as OverrideType) ||
    typeof id !== "string" ||
    !id
  ) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }
  if (status !== undefined && !VALID_STATUS.includes(status as InventoryStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (notes !== undefined && typeof notes !== "string") {
    return NextResponse.json({ error: "Invalid notes" }, { status: 400 });
  }

  try {
    if (building === "concourse") {
      await writeConcourseEdit({
        type: type as OverrideType,
        id,
        status: status as InventoryStatus | undefined,
        notes: notes as string | undefined,
      });
    } else {
      await writeStatusOverride({
        building,
        type: type as OverrideType,
        id,
        status: status as InventoryStatus | undefined,
        notes: notes as string | undefined,
        updatedAt: new Date().toISOString(),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("inventory write failed", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
