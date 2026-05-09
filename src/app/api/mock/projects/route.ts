import { type NextRequest } from "next/server"
import { ok } from "@/app/api/_utils/api-response"
import { paginateArray } from "@/app/api/_utils/pagination"
import { DUMMY_PROJECTS } from "@/data/dummy-projects"
import type { ProjectStatus } from "@/types/project.types"

export async function GET(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 200))

  const { searchParams } = request.nextUrl
  const status = searchParams.get("status") as ProjectStatus | null
  const featured = searchParams.get("featured")
  const page = Number(searchParams.get("page") ?? 1)
  const limit = Number(searchParams.get("limit") ?? 12)

  let projects = [...DUMMY_PROJECTS]

  if (status) projects = projects.filter((p) => p.status === status)
  if (featured === "true") projects = projects.filter((p) => p.featured)

  const { data, meta } = paginateArray(projects, page, limit)
  return ok(data, "Projects fetched", meta)
}
