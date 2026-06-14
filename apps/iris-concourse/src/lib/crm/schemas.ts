import { z } from "zod";

// ─── Contact Form Validation ─────────────────────────────────────────────────
// Shared between client-side React Hook Form and server-side API route.

export const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone is required"),
  message: z.string().optional().default(""),
  interestedIn: z
    .enum(["iris", "concourse", "both", "general"])
    .default("general"),
  hearAbout: z.enum([
    "zillow",
    "mls",
    "realtor",
    "signs",
    "mailer",
    "word-of-mouth",
    "email",
    "other",
  ]),
  workingWithAgent: z.enum(["no", "yes"]),
  isAgent: z.enum(["no", "yes"]),
  unitType: z.string().optional(),
  source: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// ─── Open House Sign-In ──────────────────────────────────────────────────────
// Used by the in-person open house form under /admin. The team picks which
// building they're sitting at (Concourse vs Iris) and whether the visitor is a
// buyer or a cooperating agent. Submitted to Follow Up Boss with source
// "Open House".

export const openHouseFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone is required"),
  building: z.enum(["concourse", "iris"]),
  visitorType: z.enum(["buyer", "agent"]),
  // Only meaningful when visitorType is "buyer".
  workingWithAgent: z.enum(["no", "yes"]).optional(),
  message: z.string().optional().default(""),
});

export type OpenHouseFormData = z.infer<typeof openHouseFormSchema>;
