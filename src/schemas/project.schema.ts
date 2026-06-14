import { z } from "zod"

/** A single unit/floor type within a project. */
export const projectUnitSchema = z.object({
  name: z.string().min(1, "Unit name is required"),
  bedrooms: z.coerce.number().min(0).default(0),
  bathrooms: z.coerce.number().min(0).default(0),
  size: z.coerce.number().min(0).default(0),
  sizeUnit: z.string().optional().default("sqft"),
  price: z.coerce.number().min(0).default(0),
  available: z.coerce.number().min(0).default(0),
})

export const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  tagline: z.string().optional().default(""),
  description: z.string().min(20, "Description must be at least 20 characters"),
  status: z.enum(["upcoming", "ongoing", "completed"], "Select a status"),

  location: z.string().min(2, "Location is required"),
  address: z.string().min(2, "Address is required"),

  coverImageUrl: z.string().optional().default(""),
  galleryImages: z.array(z.string()).max(16, "You can add up to 16 photos").optional().default([]),

  handoverDate: z.string().optional().default(""),
  landSize: z.coerce.number().min(0).optional(),
  landSizeUnit: z.string().optional().default("katha"),
  totalFloors: z.coerce.number().min(0).optional(),
  totalUnits: z.coerce.number().min(0).optional(),
  availableUnits: z.coerce.number().min(0).optional(),

  priceFrom: z.coerce.number().min(0).optional(),
  priceTo: z.coerce.number().min(0).optional(),

  amenities: z.array(z.string()).optional().default([]),
  units: z.array(projectUnitSchema).optional().default([]),

  developerName: z.string().optional().default(""),
  isFeatured: z.boolean().optional().default(false),
})

export type ProjectInput = z.input<typeof projectSchema>
export type ProjectSubmit = z.output<typeof projectSchema>
