import { httpClient } from "./http-client"
import type { HeroSlide } from "@/types/hero.types"

const BASE = "/hero-slides"

// Trim strings and drop empties so blank optional fields aren't stored as "".
// `order` is passed through (undefined lets the backend append on create).
function toWritePayload(values: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string") {
      const trimmed = value.trim()
      out[key] = trimmed === "" ? undefined : trimmed
    } else {
      out[key] = value
    }
  }
  return out
}

export const heroService = {
  /** Public: active slides for the carousel, in display order. */
  listActive(): Promise<HeroSlide[]> {
    return httpClient.get<HeroSlide[]>(BASE)
  },
  /** Admin: every slide. */
  adminList(token?: string): Promise<HeroSlide[]> {
    return httpClient.get<HeroSlide[]>(`${BASE}/admin`, { token })
  },
  byId(id: string, token?: string): Promise<HeroSlide> {
    return httpClient.get<HeroSlide>(`${BASE}/${id}`, { token })
  },
  create(values: Record<string, unknown>, token?: string): Promise<HeroSlide> {
    return httpClient.post<HeroSlide>(BASE, toWritePayload(values), { token })
  },
  update(id: string, values: Record<string, unknown>, token?: string): Promise<HeroSlide> {
    return httpClient.patch<HeroSlide>(`${BASE}/${id}`, toWritePayload(values), { token })
  },
  setActive(id: string, isActive: boolean, token?: string): Promise<HeroSlide> {
    return httpClient.patch<HeroSlide>(`${BASE}/${id}`, { isActive }, { token })
  },
  reorder(ids: string[], token?: string): Promise<HeroSlide[]> {
    return httpClient.patch<HeroSlide[]>(`${BASE}/reorder`, { ids }, { token })
  },
  remove(id: string, token?: string): Promise<{ success: boolean }> {
    return httpClient.delete<{ success: boolean }>(`${BASE}/${id}`, { token })
  },
}

export const listActiveHeroSlides = heroService.listActive
export const getHeroSlides = heroService.adminList
export const getHeroSlideById = heroService.byId
export const createHeroSlide = heroService.create
export const updateHeroSlide = heroService.update
export const deleteHeroSlide = heroService.remove
