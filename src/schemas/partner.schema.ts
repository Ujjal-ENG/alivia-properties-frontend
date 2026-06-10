import { z } from "zod"

/** Simple supplier/investor partner application (kept intentionally short). */
export const partnerApplicationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(6, "Enter a valid mobile number"),
  organization: z.string().optional(),
  purpose: z.string().min(3, "Tell us your purpose"),
  details: z.string().min(10, "Please add a few details"),
})

export type PartnerApplicationInput = z.infer<typeof partnerApplicationSchema>
