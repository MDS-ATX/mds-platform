import { z } from "zod";

// ─── Gallery Schemas ─────────────────────────────────────────────────────────

export const galleryImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
  category: z.enum([
    "exterior",
    "interior",
    "amenity",
    "neighborhood",
    "rendering",
    "floor-plan",
  ]),
  building: z.string().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().optional(),
});

export const gallerySchema = z.array(galleryImageSchema);

export type GalleryImage = z.infer<typeof galleryImageSchema>;
