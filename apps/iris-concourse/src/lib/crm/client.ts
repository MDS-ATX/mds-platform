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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Global request throttle ─────────────────────────────────────────────────
// Spaces all FUB requests ≥ MIN_INTERVAL_MS apart (~15/sec) so bursts of
// per-person reads stay under FUB's rate limit. Shared across all concurrent
// callers via a single advancing timestamp.
const MIN_INTERVAL_MS = 120;
let nextSlot = 0;

async function throttle(): Promise<void> {
  const now = Date.now();
  const slot = Math.max(now, nextSlot);
  nextSlot = slot + MIN_INTERVAL_MS;
  const wait = slot - now;
  if (wait > 0) await sleep(wait);
}

async function fubFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  attempt = 0
): Promise<T> {
  await throttle();
  const response = await fetch(`${FUB_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      // Identifying the integration raises FUB's per-second rate limit.
      "X-System": "MDS-Dashboard",
      ...options.headers,
    },
  });

  // Retry on rate-limit (429) and transient server errors. FUB sends a
  // Retry-After (seconds) on 429 — honor it, else exponential backoff.
  if ((response.status === 429 || response.status >= 500) && attempt < 6) {
    const retryAfter = Number(response.headers.get("Retry-After"));
    const waitMs = retryAfter > 0 ? retryAfter * 1000 + 250 : 500 * 2 ** attempt;
    await sleep(waitMs);
    return fubFetch<T>(endpoint, options, attempt + 1);
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FUB API error ${response.status}: ${error}`);
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
  "id,name,firstName,lastName,emails,phones,stage,source,tags,type,customLeadType,assignedUserId,assignedTo,timeframeStatus,timeframeDateRange,lastActivity,created,updated";

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
 * Fetch leads, paging through the FUB collection until exhausted. With a `tag`
 * it filters to that tag; without one it returns every contact (all FUB
 * contacts are treated as this project).
 *
 * Pages sequentially (offset-based) to stay well under FUB's rate limit.
 * Throws {@link FUBNotConnectedError} if the key is missing or invalid.
 */
export async function listAllPeople(
  opts: { tag?: string; maxPages?: number } = {}
): Promise<FUBPersonRecord[]> {
  if (isMissingKey()) {
    throw new FUBNotConnectedError("FUB_API_KEY environment variable is not set");
  }

  const maxPages = opts.maxPages ?? 50; // safety cap: 50 * 100 = 5,000 leads
  const all: FUBPersonRecord[] = [];

  try {
    for (let page = 0; page < maxPages; page++) {
      const params = new URLSearchParams({
        limit: String(FUB_PAGE_LIMIT),
        offset: String(page * FUB_PAGE_LIMIT),
        sort: "created",
        fields: PERSON_FIELDS,
      });
      if (opts.tag) params.set("tags", opts.tag);

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

export interface FUBActivityRecord {
  id: number;
  personId?: number;
  created?: string;
  /** Performer: calls/texts/emails use userId; notes use createdById. */
  userId?: number;
  createdById?: number;
  /** True when the contact reached out to us (inbound call/text). */
  isIncoming?: boolean;
}

/**
 * Page a created-desc activity collection (e.g. "calls", "notes") back to a
 * cutoff date. Stops as soon as it sees records older than `sinceISO`, so a
 * weekly window only reads a page or two. Returns the raw records.
 */
async function listActivitySince(
  collection: "calls" | "notes",
  sinceISO: string,
  maxPages = 10
): Promise<FUBActivityRecord[]> {
  if (isMissingKey()) {
    throw new FUBNotConnectedError("FUB_API_KEY environment variable is not set");
  }
  const since = Date.parse(sinceISO);
  const out: FUBActivityRecord[] = [];

  for (let page = 0; page < maxPages; page++) {
    // Calls carry the performer in `userId` + direction in `isIncoming`; notes
    // carry the performer in `createdById`.
    const fields =
      collection === "calls"
        ? "id,personId,created,userId,isIncoming"
        : "id,personId,created,createdById";
    const params = new URLSearchParams({
      limit: "100",
      offset: String(page * 100),
      sort: "-created",
      fields,
    });
    const data = await fubFetch<{ [k: string]: FUBActivityRecord[] | unknown }>(
      `/${collection}?${params.toString()}`
    );
    const items = (data[collection] as FUBActivityRecord[]) ?? [];
    if (items.length === 0) break;

    let reachedCutoff = false;
    for (const it of items) {
      const t = it.created ? Date.parse(it.created) : NaN;
      if (!Number.isNaN(t) && t < since) {
        reachedCutoff = true;
        continue;
      }
      out.push(it);
    }
    if (reachedCutoff || items.length < 100) break;
  }
  return out;
}

/** Calls logged since the given ISO timestamp. */
export function listCallsSince(sinceISO: string): Promise<FUBActivityRecord[]> {
  return listActivitySince("calls", sinceISO);
}

export interface FUBEnrollment {
  id: number;
  personId?: number;
  actionPlanId?: number;
  status?: string; // Running | Paused | Completed
  created?: string;
}

/** All action-plan (drip) enrollments, paged. Used for drip/nurture reach. */
export async function listActionPlanEnrollments(): Promise<FUBEnrollment[]> {
  if (isMissingKey()) {
    throw new FUBNotConnectedError("FUB_API_KEY environment variable is not set");
  }
  const out: FUBEnrollment[] = [];
  for (let page = 0; page < 50; page++) {
    const params = new URLSearchParams({
      limit: "100",
      offset: String(page * 100),
    });
    const data = await fubFetch<{ actionPlansPeople?: FUBEnrollment[] }>(
      `/actionPlansPeople?${params.toString()}`
    );
    const batch = data.actionPlansPeople ?? [];
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

/** All person ids carrying a given tag (paged). Used to build exclusion sets. */
export async function listPersonIdsByTag(tag: string): Promise<number[]> {
  if (isMissingKey()) {
    throw new FUBNotConnectedError("FUB_API_KEY environment variable is not set");
  }
  const ids: number[] = [];
  for (let page = 0; page < 50; page++) {
    const params = new URLSearchParams({
      tags: tag,
      limit: "100",
      offset: String(page * 100),
      fields: "id",
    });
    const data = await fubFetch<FUBPeopleResponse>(`/people?${params.toString()}`);
    const batch = data.people ?? [];
    for (const p of batch) ids.push(p.id);
    if (batch.length < 100) break;
  }
  return ids;
}

/**
 * Count a person-scoped activity collection (textMessages, emails) created
 * since `sinceISO`. These endpoints require a personId — they can't be listed
 * globally. `responseKey` is the collection key in the JSON body
 * (e.g. "textmessages", "emails").
 */
export interface PersonActivityRecord {
  created?: string;
  userId?: number;
  isIncoming?: boolean;
  /** Set on automated emails (action plan / template drips). */
  actionPlanId?: number | null;
  emailTemplateId?: number | null;
}

/**
 * Raw person-scoped activity records (textMessages/emails) created since
 * `sinceISO`, so callers can derive both team-sent counts and inbound replies.
 */
export async function listPersonActivitySince(
  collection: "textMessages" | "emails",
  responseKey: "textmessages" | "emails",
  personId: number,
  sinceISO: string,
  untilISO?: string
): Promise<PersonActivityRecord[]> {
  if (isMissingKey()) {
    throw new FUBNotConnectedError("FUB_API_KEY environment variable is not set");
  }
  const since = Date.parse(sinceISO);
  const until = untilISO ? Date.parse(untilISO) : Infinity;
  const params = new URLSearchParams({
    personId: String(personId),
    limit: "100",
    sort: "-created",
  });
  const data = await fubFetch<Record<string, PersonActivityRecord[]>>(
    `/${collection}?${params.toString()}`
  );
  const items = data[responseKey] ?? [];
  return items.filter((it) => {
    const t = it.created ? Date.parse(it.created) : NaN;
    return !Number.isNaN(t) && t >= since && t <= until;
  });
}

export async function countPersonActivitySince(
  collection: "textMessages" | "emails",
  responseKey: "textmessages" | "emails",
  personId: number,
  sinceISO: string,
  userIds?: Set<number>
): Promise<number> {
  if (isMissingKey()) {
    throw new FUBNotConnectedError("FUB_API_KEY environment variable is not set");
  }
  const since = Date.parse(sinceISO);
  const params = new URLSearchParams({
    personId: String(personId),
    limit: "100",
    sort: "-created",
  });
  const data = await fubFetch<Record<string, Array<{ created?: string; userId?: number }>>>(
    `/${collection}?${params.toString()}`
  );
  const items = (data[responseKey] as Array<{ created?: string; userId?: number }>) ?? [];
  return items.filter((it) => {
    const t = it.created ? Date.parse(it.created) : NaN;
    if (Number.isNaN(t) || t < since) return false;
    if (userIds && (it.userId == null || !userIds.has(it.userId))) return false;
    return true;
  }).length;
}

/** Notes logged since the given ISO timestamp. */
export function listNotesSince(sinceISO: string): Promise<FUBActivityRecord[]> {
  return listActivitySince("notes", sinceISO);
}

export interface FUBAppointment {
  id: number;
  start?: string;
  end?: string;
  type?: string;
  title?: string;
  location?: string;
  invitees?: Array<{ userId?: number | null; personId?: number | null; name?: string }>;
}

/**
 * Appointments whose start time is on/after `sinceISO`. The collection is small,
 * so we page through and filter by start client-side.
 */
export async function listAppointmentsSince(sinceISO: string): Promise<FUBAppointment[]> {
  if (isMissingKey()) {
    throw new FUBNotConnectedError("FUB_API_KEY environment variable is not set");
  }
  const since = Date.parse(sinceISO);
  const out: FUBAppointment[] = [];

  for (let page = 0; page < 10; page++) {
    const params = new URLSearchParams({
      limit: "100",
      offset: String(page * 100),
      sort: "-start",
    });
    const data = await fubFetch<{ appointments?: FUBAppointment[] }>(
      `/appointments?${params.toString()}`
    );
    const items = data.appointments ?? [];
    if (items.length === 0) break;

    let reachedCutoff = false;
    for (const a of items) {
      const t = a.start ? Date.parse(a.start) : NaN;
      if (!Number.isNaN(t) && t < since) {
        reachedCutoff = true;
        continue;
      }
      out.push(a);
    }
    if (reachedCutoff || items.length < 100) break;
  }
  return out;
}
