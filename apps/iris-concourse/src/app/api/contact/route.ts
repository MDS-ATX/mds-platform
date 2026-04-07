import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/crm";
import { createLeadEvent } from "@/lib/crm";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate with shared Zod schema
    const result = contactFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Send to Follow Up Boss
    const fubResponse = await createLeadEvent(result.data, {
      projectName: "Concourse & Iris",
      projectSlug: "iris-concourse",
      eventType:
        result.data.interestedIn !== "general"
          ? "Property Inquiry"
          : "General Inquiry",
    });

    return NextResponse.json({ success: true, id: fubResponse.id });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
