import { type NextRequest } from "next/server"
import { ok, created, badRequest } from "@/app/api/_utils/api-response"
import { DUMMY_INQUIRIES } from "@/data/dummy-inquiries"
import { inquirySchema } from "@/schemas/inquiry.schema"
import type { Inquiry } from "@/types/inquiry.types"

const inquiriesStore: Inquiry[] = [...DUMMY_INQUIRIES]

export async function GET(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 200))

  const sp = request.nextUrl.searchParams
  const sellerId = sp.get("sellerId")
  const buyerId  = sp.get("buyerId")
  const type     = sp.get("type")

  let results = [...inquiriesStore]
  if (sellerId) results = results.filter((i) => i.sellerId === sellerId)
  if (buyerId)  results = results.filter((i) => i.buyerId  === buyerId)
  if (type)     results = results.filter((i) => i.type     === type)

  return ok(results, "Inquiries fetched")
}

export async function POST(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 200))

  const body = await request.json()
  const result = inquirySchema.safeParse(body)
  if (!result.success) return badRequest(result.error.issues[0]?.message ?? "Validation failed")

  const { name, email, phone, message, propertyId, projectId } = result.data
  const newInquiry: Inquiry = {
    id: `inq-${Date.now()}`,
    type: projectId ? "project" : propertyId ? "property" : "general",
    status: "new",
    propertyId,
    projectId,
    name,
    email,
    phone,
    message,
    createdAt: new Date().toISOString(),
  }

  inquiriesStore.push(newInquiry)
  return created(newInquiry, "Inquiry submitted successfully")
}
