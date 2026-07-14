import { z } from "zod"

import { DEFAULT_HERO_ICON } from "@/lib/hero-icons"

export const heroSlideSchema = z
  .object({
    eyebrow: z.string().max(80, "Keep the eyebrow under 80 characters").optional().default(""),
    eyebrowIcon: z.string().optional().default(DEFAULT_HERO_ICON),
    title: z.string().min(3, "Title must be at least 3 characters").max(160),
    subtitle: z.string().max(400, "Keep the subtitle under 400 characters").optional().default(""),
    imageUrl: z.string().optional().default(""),
    imageKey: z.string().optional().default(""),
    primaryLabel: z.string().max(60).optional().default(""),
    primaryHref: z.string().max(300).optional().default(""),
    secondaryLabel: z.string().max(60).optional().default(""),
    secondaryHref: z.string().max(300).optional().default(""),
    order: z.coerce.number().min(0).optional(),
    isActive: z.boolean().optional().default(true),
  })
  // A button with a label but no link would render a dead control — require both.
  .refine((v) => !v.primaryLabel?.trim() || !!v.primaryHref?.trim(), {
    message: "Add a link for the primary button",
    path: ["primaryHref"],
  })
  .refine((v) => !v.secondaryLabel?.trim() || !!v.secondaryHref?.trim(), {
    message: "Add a link for the secondary button",
    path: ["secondaryHref"],
  })

export type HeroSlideInput = z.input<typeof heroSlideSchema>
export type HeroSlideSubmit = z.output<typeof heroSlideSchema>
