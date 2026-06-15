import { z } from "zod"

export const REPORT_REASONS = [
  "Incorrect information",
  "Suspected fraud",
  "Already sold or rented",
  "Inappropriate content",
  "Duplicate listing",
  "Other",
] as const

export const reportSchema = z.object({
  propertyId: z.string().min(1, "Property is required"),

  reason: z.enum(REPORT_REASONS, "Select a reason"),

  name: z
    .string("Name is required")
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name is too long"),

  email: z.email("Enter a valid email address"),

  phone: z.string().trim().max(40, "Phone number is too long").optional(),

  message: z
    .string("Please describe the issue")
    .trim()
    .min(8, "Message must be at least 8 characters")
    .max(2000, "Message is too long"),
})

export type ReportInput = z.infer<typeof reportSchema>
