import type { Agent, AgentQueryParams } from "@/types/agent.types"
import { httpClient, type Paginated } from "./http-client"

const BASE = "/agents"

export const agentsService = {
  async list(params: AgentQueryParams = {}): Promise<Paginated<Agent>> {
    try {
      return await httpClient.paginated<Agent>(BASE, {
        query: params as Record<string, string | number | boolean | undefined>,
      })
    } catch {
      return { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }
    }
  },
  async bySlug(slug: string): Promise<{ data: Agent | null }> {
    try {
      const data = await httpClient.get<Agent>(`${BASE}/${slug}`)
      return { data }
    } catch {
      return { data: null }
    }
  },
}

export const getAgents = agentsService.list
export const getAgent = agentsService.bySlug
