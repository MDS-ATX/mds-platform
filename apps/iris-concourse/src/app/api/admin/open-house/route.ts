import { NextResponse } from "next/server";
import { openHouseFormSchema, createOpenHouseLead } from "@/lib/crm";

// Open house sign-in → Follow Up Boss (source "Open House").
// Protected by the admin middleware; only the team can reach it.
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = openHouseFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const fubResponse = await createOpenHouseLead(result.data);

    return NextResponse.json({ success: true, id: fubResponse.id });
  } catch (error) {
    console.error("Open house form error:", error);
    return NextResponse.json(
      { error: "Failed to submit sign-in" },
      { status: 500 }
    );
  }
}
