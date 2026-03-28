import { z } from "zod";

// ─── Building & Unit Schemas ─────────────────────────────────────────────────

export const unitTypeSchema = z.object({
  name: z.string(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().min(0),
  sqftRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
  priceRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
  floorPlanImage: z.string().optional(),
  floorPlanPdf: z.string().optional(),
  description: z.string().optional(),
});

export const unitSchema = z.object({
  id: z.string(),
  building: z.string(),
  number: z.string(),
  floor: z.number().int(),
  type: z.string(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().min(0),
  sqft: z.number(),
  price: z.number(),
  status: z.enum(["available", "reserved", "under-contract", "sold"]),
  floorPlan: z.string().optional(),
  features: z.array(z.string()).optional(),
});

export const buildingSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  address: z.string().optional(),
  totalUnits: z.number().int(),
  stories: z.number().int(),
  yearBuilt: z.number().int().optional(),
  amenities: z.array(z.string()),
  heroImage: z.string().optional(),
  unitTypes: z.array(unitTypeSchema),
});

export type UnitType = z.infer<typeof unitTypeSchema>;
export type Unit = z.infer<typeof unitSchema>;
export type Building = z.infer<typeof buildingSchema>;
