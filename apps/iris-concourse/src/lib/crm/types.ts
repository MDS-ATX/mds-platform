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
  created?: string;
  updated?: string;
}

export interface FUBPeopleResponse {
  people: FUBPersonRecord[];
  _metadata?: { total?: number; collection?: string };
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
