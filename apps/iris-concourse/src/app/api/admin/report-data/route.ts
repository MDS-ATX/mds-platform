import { NextResponse } from "next/server";
import { getReportData } from "@/lib/dashboard/get-report-data";

// Live computation of the weekly report (the slow FUB + sheet pull). Used by the
// weekly GitHub Action to generate the snapshot — NOT meant for live page loads
// (it can take ~2 min). Auth-gated by middleware (/api/admin/*).
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET() {
  const data = await getReportData();
  return NextResponse.json(data);
}
