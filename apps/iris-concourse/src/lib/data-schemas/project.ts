import { z } from "zod";

// ─── Project Configuration ───────────────────────────────────────────────────

export const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const locationSchema = z.object({
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  coordinates: coordinatesSchema,
});

export const developerSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  logo: z.string().optional(),
});

export const projectMetaSchema = z.object({
  title: z.string(),
  description: z.string(),
  ogImage: z.string().optional(),
});

export const projectConfigSchema = z.object({
  name: z.string(),
  slug: z.string(),
  tagline: z.string().optional(),
  description: z.string(),
  developer: developerSchema,
  brokerage: z.string().default("MODUS Real Estate"),
  location: locationSchema,
  meta: projectMetaSchema,
  status: z.enum(["pre-launch", "active", "sold-out", "resale"]),
  salesTeam: z.array(
    z.object({
      name: z.string(),
      title: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      photo: z.string().optional(),
    })
  ),
});

export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Developer = z.infer<typeof developerSchema>;
export type ProjectMeta = z.infer<typeof projectMetaSchema>;
export type ProjectConfig = z.infer<typeof projectConfigSchema>;
