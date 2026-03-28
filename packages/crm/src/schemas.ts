import { z } from "zod";

// ─── Contact Form Validation ─────────────────────────────────────────────────
// Shared between client-side React Hook Form and server-side API route.

export const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().optional(),
  interestedIn: z
    .enum(["iris", "concourse", "both", "general"])
    .default("general"),
  unitType: z.string().optional(),
  source: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
