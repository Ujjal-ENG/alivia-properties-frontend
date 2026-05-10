import { type NextRequest } from "next/server"
import { ok, badRequest } from "@/app/api/_utils/api-response"
import { DUMMY_DOCUMENTS } from "@/data/dummy-documents"

export async function GET(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 80))
  const sp = request.nextUrl.searchParams
  const propertyId = sp.get("propertyId")
  if (!propertyId) return badRequest("propertyId required")
  const list = DUMMY_DOCUMENTS.filter(d => d.propertyId === propertyId)
  return ok(list, "Documents fetched")
}
