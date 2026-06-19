import type {
  FUBEvent,
  FUBEventResponse,
  FUBEventType,
  FUBPeopleResponse,
  FUBPersonRecord,
  FUBNoteResponse,
  FUBStage,
  FUBStagesResponse,
  FUBUser,
  FUBUsersResponse,
  FUBEventRecord,
  FUBEventsResponse,
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

// ─── Dashboard reads (server-side) ───────────────────────────────────────────

const PERSON_FIELDS =
  "id,name,firstName,lastName,emails,phones,stage,source,tags,type,assignedUserId,assignedTo,timeframeStatus,timeframeDateRange,lastActivity,created,updated";

const FUB_PAGE_LIMIT = 100; // FUB max page size for /people

/**
 * Thrown when FUB credentials are missing or rejected, so the dashboard can
 * render a friendly "not connected" state instead of crashing.
 */
export class FUBNotConnectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FUBNotConnectedError";
  }
}

function isMissingKey(): boolean {
  return !process.env.FUB_API_KEY;
}

/**
 * Fetch every lead carrying a given tag (e.g. `mds:iris-concourse`),
 * paging through the FUB collection until exhausted.
 *
 * Pages sequentially (offset-based) to stay well under FUB's rate limit.
 * Throws {@link FUBNotConnectedError} if the key is missing or invalid.
 */
export async function listAllPeople(
  opts: { tag: string; maxPages?: number } = { tag: "mds:iris-concourse" }
): Promise<FUBPersonRecord[]> {
  if (isMissingKey()) {
    throw new FUBNotConnectedError("FUB_API_KEY environment variable is not set");
  }

  const maxPages = opts.maxPages ?? 50; // safety cap: 50 * 100 = 5,000 leads
  const all: FUBPersonRecord[] = [];

  try {
    for (let page = 0; page < maxPages; page++) {
      const params = new URLSearchParams({
        tags: opts.tag,
        limit: String(FUB_PAGE_LIMIT),
        offset: String(page * FUB_PAGE_LIMIT),
        sort: "created",
        fields: PERSON_FIELDS,
      });

      const data = await fubFetch<FUBPeopleResponse>(`/people?${params.toString()}`);
      const batch = data.people ?? [];
      all.push(...batch);

      const total = data._metadata?.total;
      const noMore =
        batch.length < FUB_PAGE_LIMIT ||
        (typeof total === "number" && all.length >= total);
      if (noMore) break;
    }
  } catch (err) {
    if (err instanceof Error && /FUB API error 401/.test(err.message)) {
      throw new FUBNotConnectedError("FUB API key was rejected (401)");
    }
    throw err;
  }

  return all;
}

/**
 * List recent events (page visits, inquiries, registrations) for traffic
 * reporting. Optionally filter by source and a created-after ISO date.
 */
export async function listEvents(
  opts: { source?: string; since?: string; limit?: number } = {}
): Promise<FUBEventRecord[]> {
  if (isMissingKey()) {
    throw new FUBNotConnectedError("FUB_API_KEY environment variable is not set");
  }
  const params = new URLSearchParams({ limit: String(opts.limit ?? 100), sort: "created" });
  if (opts.source) params.set("source", opts.source);
  const data = await fubFetch<FUBEventsResponse>(`/events?${params.toString()}`);
  return data.events ?? [];
}

/** List configured pipeline stages, to map FUB stage names onto dashboard stages. */
export async function listStages(): Promise<FUBStage[]> {
  if (isMissingKey()) {
    throw new FUBNotConnectedError("FUB_API_KEY environment variable is not set");
  }
  const data = await fubFetch<FUBStagesResponse>("/stages");
  return data.stages ?? [];
}

/** List FUB users (agents), to resolve assignedUserId → agent name. */
export async function listUsers(): Promise<FUBUser[]> {
  if (isMissingKey()) {
    throw new FUBNotConnectedError("FUB_API_KEY environment variable is not set");
  }
  const data = await fubFetch<FUBUsersResponse>("/users?limit=100");
  return data.users ?? [];
}
