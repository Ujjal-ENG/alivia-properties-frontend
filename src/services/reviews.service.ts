import type { Review } from "@/types/review.types"
import { httpClient, type Paginated } from "./http-client"

type ReviewQuery = {
  page?: number
  limit?: number
  propertyId?: string
  agentId?: string
}

export const reviewsService = {
  list(params: ReviewQuery = {}): Promise<Paginated<Review>> {
    return httpClient.paginated<Review>("/reviews", {
      query: params as Record<string, string | number | undefined>,
    })
  },

  create(
    payload: {
      propertyId?: string
      agentId?: string
      rating: number
      title?: string
      body: string
    },
    token?: string,
  ): Promise<Review> {
    return httpClient.post<Review>("/reviews", payload, { token })
  },
}
