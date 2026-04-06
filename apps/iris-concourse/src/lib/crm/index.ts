// ─── MDS CRM Integration ─────────────────────────────────────────────────────
// Follow Up Boss API client and form validation schemas.

export { createLeadEvent } from "./client";
export { contactFormSchema, type ContactFormData } from "./schemas";
export type {
  FUBEvent,
  FUBEventType,
  FUBEventResponse,
  FUBPerson,
  FUBProperty,
} from "./types";
