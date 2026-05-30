import type { QAItem } from "@/types/qa.types"
import { httpClient, type Paginated } from "./http-client"

export const qaService = {
  list(propertyId: string, page = 1, limit = 20): Promise<Paginated<QAItem>> {
    return httpClient.paginated<QAItem>("/qa", {
      query: { propertyId, page, limit },
    })
  },

  ask(payload: { propertyId: string; question: string }, token?: string): Promise<QAItem> {
    return httpClient.post<QAItem>("/qa", payload, { token })
  },

  answer(id: string, answer: string, token?: string): Promise<QAItem> {
    return httpClient.post<QAItem>(`/qa/${id}/answer`, { answer }, { token })
  },
}
