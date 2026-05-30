import { httpClient, type Paginated } from "./http-client"
import type {
  CreateQuoteInput,
  QuoteQueryParams,
  QuoteRequest,
} from "@/types/quote.types"

const BASE = "/marketplace/quotes"

export const quotesService = {
  /** Public — submit a quote request from the marketplace */
  create(input: CreateQuoteInput, token?: string): Promise<QuoteRequest> {
    return httpClient.post<QuoteRequest>(BASE, input, { token })
  },

  /** Admin / Supplier — list quote requests with filtering */
  list(params: QuoteQueryParams = {}, token?: string): Promise<Paginated<QuoteRequest>> {
    return httpClient.paginated<QuoteRequest>(BASE, {
      query: params as Record<string, string | number | boolean | undefined>,
      token,
    })
  },

  detail(id: string, token?: string): Promise<QuoteRequest> {
    return httpClient.get<QuoteRequest>(`${BASE}/${id}`, { token })
  },

  update(
    id: string,
    body: { status?: QuoteRequest["status"]; reply?: string },
    token?: string,
  ): Promise<QuoteRequest> {
    return httpClient.patch<QuoteRequest>(`${BASE}/${id}`, body, { token })
  },
}
