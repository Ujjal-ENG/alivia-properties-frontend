import { type NextRequest } from "next/server"
import { ok } from "@/app/api/_utils/api-response"
import { paginateArray } from "@/app/api/_utils/pagination"
import { DUMMY_AGENTS } from "@/data/dummy-agents"
import type { AgentSpecialty } from "@/types/agent.types"

export async function GET(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 150))
  const sp = request.nextUrl.searchParams
  const search = sp.get("search")?.toLowerCase()
  const specialty = sp.get("specialty") as AgentSpecialty | null
  const area = sp.get("area")?.toLowerCase()
  const minRating = sp.has("minRating") ? Number(sp.get("minRating")) : undefined
  const verified = sp.get("verified") === "true" ? true : undefined
  const page = Number(sp.get("page") ?? 1)
  const limit = Number(sp.get("limit") ?? 12)

  let list = [...DUMMY_AGENTS]
  if (search) list = list.filter(a => a.name.toLowerCase().includes(search) || a.bio.toLowerCase().includes(search))
  if (specialty) list = list.filter(a => a.specialties.includes(specialty))
  if (area) list = list.filter(a => a.serviceAreas.some(s => s.toLowerCase().includes(area)))
  if (minRating !== undefined) list = list.filter(a => a.rating >= minRating)
  if (verified) list = list.filter(a => a.isVerified)

  const { data, meta } = paginateArray(list, page, limit)
  return ok(data, "Agents fetched", meta)
}
