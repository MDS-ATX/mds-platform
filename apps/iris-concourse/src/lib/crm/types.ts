// ─── Follow Up Boss API Types ────────────────────────────────────────────────

export type FUBEventType =
  | "Registration"
  | "Property Inquiry"
  | "General Inquiry"
  | "Seller Inquiry";

export interface FUBPerson {
  firstName: string;
  lastName: string;
  emails: Array<{ value: string }>;
  phones?: Array<{ value: string }>;
  tags?: string[];
}

export interface FUBProperty {
  street?: string;
  city?: string;
  state?: string;
  code?: string;
  mlsNumber?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  type?: string;
  url?: string;
}

export interface FUBEvent {
  source: string;
  system: string;
  type: FUBEventType;
  message?: string;
  person: FUBPerson;
  property?: FUBProperty;
  description?: string;
}

export interface FUBEventResponse {
  id: number;
  created: string;
  [key: string]: unknown;
}

// ─── People (read) ───────────────────────────────────────────────────────────

export interface FUBPersonRecord {
  id: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  emails?: Array<{ value: string; type?: string }>;
  phones?: Array<{ value: string; type?: string }>;
  stage?: string;
  source?: string;
  tags?: string[];
  type?: string;
  assignedUserId?: number;
  assignedTo?: string;
  timeframeStatus?: string | null;
  timeframeDateRange?: string | null;
  lastActivity?: string | null;
  created?: string;
  updated?: string;
}

export interface FUBMetadata {
  total?: number;
  collection?: string;
  /** Full URL of the next page, when more records remain. */
  next?: string;
  nextLink?: string;
  offset?: number;
  limit?: number;
}

export interface FUBPeopleResponse {
  people: FUBPersonRecord[];
  _metadata?: FUBMetadata;
}

// ─── Stages / Users (read) ───────────────────────────────────────────────────

export interface FUBStage {
  id: number;
  name: string;
  /** Lead | Active Client | Trash | Closed (FUB pipeline category) */
  pipelineName?: string;
}

export interface FUBStagesResponse {
  stages: FUBStage[];
  _metadata?: FUBMetadata;
}

export interface FUBUser {
  id: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

export interface FUBUsersResponse {
  users: FUBUser[];
  _metadata?: FUBMetadata;
}

// ─── Events (read) ───────────────────────────────────────────────────────────

export interface FUBEventRecord {
  id: number;
  type?: string;
  source?: string;
  message?: string;
  personId?: number;
  created?: string;
}

export interface FUBEventsResponse {
  events: FUBEventRecord[];
  _metadata?: FUBMetadata;
}

// ─── Notes (write) ───────────────────────────────────────────────────────────

export interface FUBNote {
  personId: number;
  subject?: string;
  body: string;
  isHtml?: boolean;
}

export interface FUBNoteResponse {
  id: number;
  created: string;
  [key: string]: unknown;
}
