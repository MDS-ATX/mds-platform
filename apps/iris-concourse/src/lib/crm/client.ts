import type {
  FUBEvent,
  FUBEventResponse,
  FUBEventType,
  FUBPeopleResponse,
  FUBPersonRecord,
  FUBNoteResponse,
} from "./types";
import type { ContactFormData, OpenHouseFormData } from "./schemas";

const BUILDING_LABELS: Record<OpenHouseFormData["building"], string> = {
  concourse: "Concourse",
  iris: "Iris",
};

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
    message: [
      `Name: ${formData.firstName} ${formData.lastName}`,
      `Email: ${formData.email}`,
      formData.phone ? `Phone: ${formData.phone}` : null,
      `Interested in: ${formData.interestedIn}`,
      formData.hearAbout ? `How did you hear about us: ${formData.hearAbout}` : null,
      formData.workingWithAgent ? `Working with agent: ${formData.workingWithAgent}` : null,
      formData.isAgent ? `Is a real estate agent: ${formData.isAgent}` : null,
      formData.message ? `\nComments/Questions:\n${formData.message}` : null,
    ].filter(Boolean).join("\n") || undefined,
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
        ...(formData.hearAbout ? [`source:${formData.hearAbout}`] : []),
      ],
    },
    property: options.property,
  };

  return fubFetch<FUBEventResponse>("/events", {
    method: "POST",
    body: JSON.stringify(event),
  });
}

/**
 * Create an open house sign-in lead in Follow Up Boss.
 * Source is "Open House"; the team selects the building they're sitting at and
 * whether the visitor is a buyer or a cooperating agent.
 */
export async function createOpenHouseLead(
  formData: OpenHouseFormData
): Promise<FUBEventResponse> {
  const buildingLabel = BUILDING_LABELS[formData.building];
  const isAgent = formData.visitorType === "agent";

  const event: FUBEvent = {
    source: "Open House",
    system: "MDS Platform",
    type: "Registration",
    message: [
      `Open House Sign-In — ${buildingLabel}`,
      `Visitor type: ${isAgent ? "Agent" : "Buyer"}`,
      !isAgent && formData.workingWithAgent
        ? `Working with an agent: ${formData.workingWithAgent === "yes" ? "Yes" : "No"}`
        : null,
      `Name: ${formData.firstName} ${formData.lastName}`,
      formData.email ? `Email: ${formData.email}` : null,
      formData.phone ? `Phone: ${formData.phone}` : null,
      formData.message ? `\nNotes:\n${formData.message}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    person: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      emails: formData.email ? [{ value: formData.email }] : [],
      phones: formData.phone ? [{ value: formData.phone }] : undefined,
      tags: [
        "mds:iris-concourse",
        `building:${formData.building}`,
        "source:open-house",
        isAgent ? "type:agent" : "type:buyer",
        ...(!isAgent && formData.workingWithAgent === "yes" ? ["buyer:has-agent"] : []),
        ...(!isAgent && formData.workingWithAgent === "no" ? ["buyer:no-agent"] : []),
      ],
    },
  };

  return fubFetch<FUBEventResponse>("/events", {
    method: "POST",
    body: JSON.stringify(event),
  });
}

/**
 * Search existing leads in Follow Up Boss by name, email, or phone.
 * Used by the agent tour sheet to attach a tour to an existing lead.
 */
export async function searchPeople(
  query: string,
  limit = 10
): Promise<FUBPersonRecord[]> {
  const q = query.trim();
  if (!q) return [];

  const params = new URLSearchParams({
    q,
    limit: String(limit),
    sort: "updated",
    fields: "id,name,firstName,lastName,emails,phones,stage,source,tags,created,updated",
  });

  const data = await fubFetch<FUBPeopleResponse>(`/people?${params.toString()}`);
  return data.people ?? [];
}

/**
 * Fetch a single lead by FUB person id.
 */
export async function getPerson(id: number): Promise<FUBPersonRecord> {
  const params = new URLSearchParams({
    fields: "id,name,firstName,lastName,emails,phones,stage,source,tags,created,updated",
  });
  return fubFetch<FUBPersonRecord>(`/people/${id}?${params.toString()}`);
}

/**
 * Write a note to a lead's timeline in Follow Up Boss.
 * The agent tour sheet pushes its intel + toured-unit feedback here.
 */
export async function createNote(
  personId: number,
  body: string,
  subject = "Tour Notes"
): Promise<FUBNoteResponse> {
  return fubFetch<FUBNoteResponse>("/notes", {
    method: "POST",
    body: JSON.stringify({ personId, subject, body }),
  });
}
