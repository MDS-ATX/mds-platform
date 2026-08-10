// ─── MDS CRM Integration ─────────────────────────────────────────────────────
// Follow Up Boss API client and form validation schemas.

export {
  createLeadEvent,
  createOpenHouseLead,
  searchPeople,
  getPerson,
  createNote,
  listAllPeople,
  listEvents,
  listStages,
  listUsers,
  listCallsSince,
  listNotesSince,
  listAppointmentsSince,
  listPersonIdsByTag,
  listActionPlanEnrollments,
  countPersonActivitySince,
  listPersonActivitySince,
  FUBNotConnectedError,
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
  FUBMetadata,
  FUBNote,
  FUBNoteResponse,
  FUBStage,
  FUBStagesResponse,
  FUBUser,
  FUBUsersResponse,
  FUBEventRecord,
  FUBEventsResponse,
} from "./types";
export type { FUBActivityRecord, FUBAppointment } from "./client";
