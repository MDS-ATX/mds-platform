import type { FUBEvent, FUBEventResponse, FUBEventType } from "./types";
import type { ContactFormData } from "./schemas";

// ─── Follow Up Boss API Client ───────────────────────────────────────────────
// Server-side only. Uses Basic Auth with API key.

const FUB_API_BASE = "https://api.followupboss.com/v1";

function getAuthHeader(): string {
  const apiKey = process.env.FUB_API_KEY;
  if (!apiKey) {
    throw new Error("FUB_API_KEY environment variable is not set");
  }
  // Basic Auth: API key as username, blank password
  return `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
}

async function fubFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${FUB_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `FUB API error ${response.status}: ${error}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Create a lead event in Follow Up Boss.
 * Uses POST /v1/events which triggers automations, lead assignment, and notifications.
 */
export async function createLeadEvent(
  formData: ContactFormData,
  options: {
    projectName: string;
    projectSlug: string;
    eventType?: FUBEventType;
    property?: FUBEvent["property"];
  }
): Promise<FUBEventResponse> {
  const event: FUBEvent = {
    source: `${options.projectName} Website`,
    system: "MDS Platform",
    type: options.eventType || "General Inquiry",
    message: formData.message || undefined,
    person: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      emails: [{ value: formData.email }],
      phones: formData.phone ? [{ value: formData.phone }] : undefined,
      tags: [
        `mds:${options.projectSlug}`,
        ...(formData.interestedIn !== "general"
          ? [`building:${formData.interestedIn}`]
          : []),
      ],
    },
    property: options.property,
  };

  return fubFetch<FUBEventResponse>("/events", {
    method: "POST",
    body: JSON.stringify(event),
  });
}
