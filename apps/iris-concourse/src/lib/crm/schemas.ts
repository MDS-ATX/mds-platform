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
