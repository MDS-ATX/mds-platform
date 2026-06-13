// ─── MDS CRM Integration ─────────────────────────────────────────────────────
// Follow Up Boss API client and form validation schemas.

export {
  createLeadEvent,
  searchPeople,
  getPerson,
  createNote,
} from "./client";
export { contactFormSchema, type ContactFormData } from "./schemas";
export type {
  FUBEvent,
  FUBEventType,
  FUBEventResponse,
  FUBPerson,
  FUBProperty,
  FUBPersonRecord,
  FUBPeopleResponse,
  FUBNote,
  FUBNoteResponse,
} from "./types";
