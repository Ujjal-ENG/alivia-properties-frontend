import { z } from "zod"

export const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  type: z.enum(["apartment", "house", "townhouse", "villa", "studio", "plot", "land", "commercial", "office", "shop", "warehouse"], "Select a property type"),
  purpose: z.enum(["sale", "rent"], "Select a purpose"),
  price: z.coerce.number().min(1, "Price is required"),
  priceNegotiable: z.boolean().optional().default(false),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  area: z.string().optional().default(""),
  address: z.string().optional().default(""),
  mapPin: z.string().optional().default(""),
  size: z.coerce.number().min(1, "Size is required"),
  sizeUnit: z.enum(["sqft", "katha", "shotangsho", "bigha"], "Select a size unit"),
  bedrooms: z.coerce.number().min(0).optional().default(0),
  bathrooms: z.coerce.number().min(0).optional().default(0),
  balconies: z.coerce.number().min(0).optional().default(0),
  floorNumber: z.coerce.number().min(0).optional().default(0),
  totalFloors: z.coerce.number().min(1).optional().default(1),
  facilities: z.array(z.string()).optional().default([]),
  // Up to 12 photos. The "at least 5" floor is enforced only when creating a
  // listing (see propertyCreateSchema) so older listings with fewer photos
  // remain editable.
  images: z.array(z.string()).max(12, "You can add up to 12 photos").optional().default([]),
  // Up to 3 uploaded video files (optional).
  videos: z.array(z.string()).max(3, "You can add up to 3 videos").optional().default([]),
  videoUrl: z.string().optional().default(""),
  contactName: z.string().min(2, "Contact name is required"),
  contactPhone: z.string().min(7, "Contact phone is required"),
  whatsApp: z.string().optional().default(""),
})

/** Stricter schema for the create flow: a new listing needs at least 5 photos. */
export const propertyCreateSchema = propertySchema.extend({
  images: z
    .array(z.string())
    .min(5, "Add at least 5 photos (10–12 recommended)")
    .max(12, "You can add up to 12 photos"),
})

export type PropertyInput = z.infer<typeof propertySchema>
