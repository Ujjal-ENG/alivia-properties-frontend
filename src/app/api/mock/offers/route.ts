import { type NextRequest } from "next/server"
import { ok, created, badRequest } from "@/app/api/_utils/api-response"
import { paginateArray } from "@/app/api/_utils/pagination"
import { DUMMY_OFFERS } from "@/data/dummy-offers"
import { offerSchema, offerCounterSchema } from "@/schemas/offer.schema"
import type { Offer, OfferStatus } from "@/types/offer.types"

const offersStore: Offer[] = [...DUMMY_OFFERS]

export async function GET(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 120))
  const sp = request.nextUrl.searchParams
  const propertyId = sp.get("propertyId") ?? undefined
  const buyerId = sp.get("buyerId") ?? undefined
  const sellerId = sp.get("sellerId") ?? undefined
  const status = (sp.get("status") as OfferStatus | null) ?? undefined
  const page = Number(sp.get("page") ?? 1)
  const limit = Number(sp.get("limit") ?? 10)

  let list = [...offersStore]
  if (propertyId) list = list.filter(o => o.propertyId === propertyId)
  if (buyerId) list = list.filter(o => o.buyerId === buyerId)
  if (sellerId) list = list.filter(o => o.sellerId === sellerId)
  if (status) list = list.filter(o => o.status === status)
  list.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))

  const { data, meta } = paginateArray(list, page, limit)
  return ok(data, "Offers fetched", meta)
}

export async function POST(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 180))
  const body = await request.json()

  if (body?.action === "counter") {
    const parsed = offerCounterSchema.safeParse(body)
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Validation failed")
    const offer = offersStore.find(o => o.id === parsed.data.offerId)
    if (!offer) return badRequest("Offer not found")
    offer.currentAmount = parsed.data.amount
    offer.status = "countered"
    offer.updatedAt = new Date().toISOString()
    offer.messages.push({
      id: `msg-${Date.now()}`,
      authorId: "current-user",
      authorName: "Listing Agent",
      authorRole: "seller",
      amount: parsed.data.amount,
      body: parsed.data.message,
      createdAt: offer.updatedAt,
    })
    return ok(offer, "Counter posted")
  }

  if (body?.action === "accept" || body?.action === "reject" || body?.action === "withdraw") {
    const offer = offersStore.find(o => o.id === body.offerId)
    if (!offer) return badRequest("Offer not found")
    offer.status =
      body.action === "accept" ? "accepted" : body.action === "reject" ? "rejected" : "withdrawn"
    offer.updatedAt = new Date().toISOString()
    return ok(offer, `Offer ${offer.status}`)
  }

  const parsed = offerSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Validation failed")
  const now = new Date().toISOString()
  const offer: Offer = {
    id: `off-${Date.now()}`,
    propertyId: parsed.data.propertyId,
    propertyTitle: body.propertyTitle ?? "Property",
    buyerId: "current-user",
    buyerName: body.buyerName ?? "Current Buyer",
    sellerId: body.sellerId ?? "seller-001",
    sellerName: body.sellerName ?? "Listing Agent",
    initialAmount: parsed.data.amount,
    currentAmount: parsed.data.amount,
    listingPrice: body.listingPrice ?? parsed.data.amount,
    status: "submitted",
    paymentMethod: parsed.data.paymentMethod,
    closingDate: parsed.data.closingDate,
    contingencies: parsed.data.contingencies ?? [],
    messages: [
      {
        id: `msg-${Date.now()}`,
        authorId: "current-user",
        authorName: body.buyerName ?? "Current Buyer",
        authorRole: "buyer",
        amount: parsed.data.amount,
        body: parsed.data.message ?? "Offer submitted.",
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  }
  offersStore.unshift(offer)
  return created(offer, "Offer submitted")
}
