import { ok, notFound } from "@/app/api/_utils/api-response"
import { DUMMY_AGENTS } from "@/data/dummy-agents"

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  await new Promise((r) => setTimeout(r, 120))
  const { slug } = await params
  const agent = DUMMY_AGENTS.find(a => a.slug === slug)
  if (!agent) return notFound("Agent not found")
  return ok(agent, "Agent fetched")
}
