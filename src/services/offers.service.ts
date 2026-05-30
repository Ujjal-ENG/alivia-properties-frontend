import type { Offer } from "@/types/offer.types"
import { httpClient, type Paginated } from "./http-client"

type BackendOffer = Omit<Offer, "status"> & { status: string }

function toOffer(offer: BackendOffer): Offer {
  return {
    ...offer,
    status: offer.status.toLowerCase() as Offer["status"],
  }
}

export const offersService = {
  list(
    params: { page?: number; limit?: number; propertyId?: string; buyerId?: string } = {},
    token?: string,
  ): Promise<Paginated<Offer>> {
    return httpClient
      .paginated<BackendOffer>("/offers", {
        query: params as Record<string, string | number | undefined>,
        token,
      })
      .then((res) => ({ ...res, data: res.data.map(toOffer) }))
  },

  create(
    payload: {
      propertyId: string
      offerPrice: number
      contingencies?: string[]
      message?: string
    },
    token?: string,
  ): Promise<Offer> {
    return httpClient.post<BackendOffer>("/offers", payload, { token }).then(toOffer)
  },
}
