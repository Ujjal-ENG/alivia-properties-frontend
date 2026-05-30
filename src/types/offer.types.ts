export type OfferStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "countered"
  | "expired"

export type Offer = {
  id: string
  propertyId: string
  buyerId: string
  offerPrice: number
  contingencies: string[]
  message?: string | null
  status: OfferStatus
  expiresAt?: string | null
  respondedAt?: string | null
  responseNote?: string | null
  createdAt: string
  updatedAt?: string
}
