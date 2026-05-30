import type { MarketplaceCategory } from "@/services/marketplace.service"

export type DialogMode = "group" | "item"

export type FormState = {
  slug: string
  name: string
  description: string
  parentSlug: string
  order: string
  iconUrl: string
}

export function emptyForm(mode: DialogMode, defaultParent = ""): FormState {
  return {
    slug: "",
    name: "",
    description: "",
    parentSlug: mode === "group" ? "" : defaultParent,
    order: "0",
    iconUrl: "",
  }
}

export function toFormState(cat: MarketplaceCategory): FormState {
  return {
    slug: cat.slug,
    name: cat.name,
    description: cat.description ?? "",
    parentSlug: cat.parentSlug ?? "",
    order: String(cat.order),
    iconUrl: cat.iconUrl ?? "",
  }
}

export function detectMode(cat: MarketplaceCategory): DialogMode {
  return cat.parentSlug ? "item" : "group"
}
