import { getAgents } from "@/services/agents.service"
import { AgentCard } from "@/components/agents/agent-card"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Verified Agents — Alivia Properties",
  description: "Browse our verified property agents and brokers across Bangladesh.",
}

export default async function AgentsPage() {
  const res = await getAgents()
  const agents = res.data

  return (
    <div className="section-y">
      <div className="container-page">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-eyebrow mb-1">Our Agents</p>
            <h1 className="text-h2">Verified property professionals</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {agents.length} agents · Avg response under 4h
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {agents.map(a => <AgentCard key={a.id} agent={a} />)}
        </div>
      </div>
    </div>
  )
}
