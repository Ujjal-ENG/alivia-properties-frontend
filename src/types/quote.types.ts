export type QuoteStatus =
  | "NEW"
  | "ASSIGNED"
  | "CONTACTED"
  | "NEGOTIATING"
  | "QUOTE_SENT"
  | "WON"
  | "LOST"
  | "CLOSED"

export type QuoteConversationEntry = {
  id: string
  authorId?: string | null
  authorName: string
  authorRole: string
  body: string
  channel: string
  createdAt: string
}

export type QuoteSpec = {
  key: string
  label: string
  value: string
  unit?: string | null
}

/** A buyer-uploaded file (drawing, photo, BOQ) attached to a quote request. */
export type QuoteAttachment = {
  key: string
  url: string
  name: string
  mimeType: string
  size: number
}

export type QuoteRequest = {
  id: string
  buyerId?: string | null
  supplierId?: string | null
  productId?: string | null
  categorySlug?: string | null
  departmentSlug?: string | null
  batchId?: string | null
  variantId?: string | null
  variantName?: string | null
  variantUnit?: string | null
  variantLabel?: string | null
  specs?: QuoteSpec[]
  attachments?: QuoteAttachment[]
  name: string
  email: string
  phone: string
  company?: string | null
  city?: string | null
  deliveryLocation?: string | null
  quantity?: number | null
  unit?: string | null
  budget?: number | null
  deliveryDate?: string | null
  message: string
  assignedTo?: string | null
  status: QuoteStatus
  statusChangedAt?: string | null
  conversation?: QuoteConversationEntry[]
  reply?: string | null
  repliedAt?: string | null
  finalQuotedPrice?: number | null
  closedAt?: string | null
  createdAt: string
  updatedAt: string
  buyer?: { id: string; name: string; email: string } | null
  supplier?: { id: string; slug: string; name: string; ownerId?: string | null } | null
  product?: { id: string; slug: string; name: string } | null
  assignedRep?: { id: string; name: string; email: string } | null
}

export type CreateQuoteInput = {
  supplierId?: string
  productId?: string
  variantId?: string
  categorySlug?: string
  specs?: QuoteSpec[]
  name: string
  email: string
  phone: string
  company?: string
  city?: string
  deliveryLocation: string
  quantity?: number
  unit?: string
  deliveryDate?: string
  message: string
  attachments?: QuoteAttachment[]
}

/** Multi-supplier quote (wizard). Empty `supplierIds` → "let Alivia match me". */
export type CreateQuoteBatchInput = Omit<CreateQuoteInput, "supplierId" | "productId"> & {
  supplierIds?: string[]
}

export type QuoteBatchResult = {
  batchId: string
  count: number
  quotes: QuoteRequest[]
}

export type QuoteQueryParams = {
  page?: number
  limit?: number
  status?: QuoteStatus
  supplierId?: string
  productId?: string
  categorySlug?: string
  assignedTo?: string
  search?: string
}
