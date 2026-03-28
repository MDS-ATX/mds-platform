import { z } from "zod";
import { coordinatesSchema } from "./project";

// ─── Neighborhood Schemas ────────────────────────────────────────────────────

export const pointOfInterestSchema = z.object({
  name: z.string(),
  category: z.enum([
    "dining",
    "shopping",
    "parks",
    "entertainment",
    "transit",
    "schools",
    "grocery",
    "fitness",
    "healthcare",
  ]),
  distance: z.string().optional(),
  coordinates: coordinatesSchema.optional(),
  description: z.string().optional(),
});

export const neighborhoodSchema = z.object({
  name: z.string(),
  description: z.string(),
  highlights: z.array(z.string()),
  walkScore: z.number().int().min(0).max(100).optional(),
  bikeScore: z.number().int().min(0).max(100).optional(),
  transitScore: z.number().int().min(0).max(100).optional(),
  pointsOfInterest: z.array(pointOfInterestSchema),
});

export type PointOfInterest = z.infer<typeof pointOfInterestSchema>;
export type Neighborhood = z.infer<typeof neighborhoodSchema>;
