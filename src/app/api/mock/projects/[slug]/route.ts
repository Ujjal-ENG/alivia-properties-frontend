import { type NextRequest } from "next/server"
import { ok, notFound } from "@/app/api/_utils/api-response"
import { DUMMY_PROJECTS } from "@/data/dummy-projects"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  await new Promise((r) => setTimeout(r, 200))

  const { slug } = await params
  const project = DUMMY_PROJECTS.find((p) => p.slug === slug || p.id === slug)
  if (!project) return notFound("Project not found")
  return ok(project, "Project fetched")
}
