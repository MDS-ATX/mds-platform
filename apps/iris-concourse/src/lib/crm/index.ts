// ─── MDS CRM Integration ─────────────────────────────────────────────────────
// Follow Up Boss API client and form validation schemas.

export {
  createLeadEvent,
  createOpenHouseLead,
  searchPeople,
  getPerson,
  createNote,
} from "./client";
export {
  contactFormSchema,
  type ContactFormData,
  openHouseFormSchema,
  type OpenHouseFormData,
} from "./schemas";
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
