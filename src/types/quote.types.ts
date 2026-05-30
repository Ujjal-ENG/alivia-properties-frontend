export type QuoteStatus = "PENDING" | "RESPONDED" | "CLOSED"

export type QuoteRequest = {
  id: string
  buyerId?: string | null
  supplierId?: string | null
  productId?: string | null
  categorySlug?: string | null
  name: string
  email: string
  phone: string
  company?: string | null
  city?: string | null
  quantity?: number | null
  unit?: string | null
  budget?: number | null
  deliveryDate?: string | null
  message: string
  status: QuoteStatus
  reply?: string | null
  repliedAt?: string | null
  createdAt: string
  updatedAt: string
  buyer?: { id: string; name: string; email: string } | null
  supplier?: { id: string; slug: string; name: string; ownerId?: string | null } | null
  product?: { id: string; slug: string; name: string } | null
}

export type CreateQuoteInput = {
  supplierId?: string
  productId?: string
  categorySlug?: string
  name: string
  email: string
  phone: string
  company?: string
  city?: string
  quantity?: number
  unit?: string
  budget?: number
  deliveryDate?: string
  message: string
}

export type QuoteQueryParams = {
  page?: number
  limit?: number
  status?: QuoteStatus
  supplierId?: string
  productId?: string
  categorySlug?: string
  search?: string
}
