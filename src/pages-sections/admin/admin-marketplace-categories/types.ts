import type { MarketplaceCategory } from "@/services/marketplace.service"
import type {
  CategoryAttributeType,
  CategoryImage,
  CategoryLevel,
} from "@/types/marketplace.types"

/** Two taxonomy levels: Department → Category (the leaf). */
export type DialogMode = "department" | "category"

export const LEVEL_BY_MODE: Record<DialogMode, CategoryLevel> = {
  department: "DEPARTMENT",
  category: "CATEGORY",
}

// Legacy SUBCATEGORY rows (pre-flatten) map to the category UI.
export const MODE_BY_LEVEL: Record<CategoryLevel, DialogMode> = {
  DEPARTMENT: "department",
  CATEGORY: "category",
  SUBCATEGORY: "category",
}

export const MODE_LABEL: Record<DialogMode, string> = {
  department: "Department",
  category: "Category",
}

/** Editable row for a category variant (the named options buyers pick). */
export type VariantRow = {
  id?: string
  name: string
  unit: string
  isActive: boolean
}

/** Editable row for a spec field (options held as a comma string while editing). */
export type AttrRow = {
  id?: string
  label: string
  type: CategoryAttributeType
  options: string
  unit: string
  required: boolean
}

export type FormState = {
  slug: string
  name: string
  description: string
  parentSlug: string
  order: string
  iconUrl: string
  image: CategoryImage | null
  isActive: boolean
  variants: VariantRow[]
  attributes: AttrRow[]
}

export function emptyForm(mode: DialogMode, defaultParent = ""): FormState {
  return {
    slug: "",
    name: "",
    description: "",
    parentSlug: mode === "department" ? "" : defaultParent,
    order: "0",
    iconUrl: "",
    image: null,
    isActive: true,
    variants: [],
    attributes: [],
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
    image: cat.image ?? null,
    isActive: cat.isActive !== false,
    variants: (cat.variants ?? [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((v) => ({
        id: v.id,
        name: v.name,
        unit: v.unit ?? "",
        isActive: v.isActive !== false,
      })),
    attributes: (cat.attributes ?? [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((a) => ({
        id: a.id,
        label: a.label,
        type: a.type,
        options: (a.options ?? []).join(", "),
        unit: a.unit ?? "",
        required: a.required ?? false,
      })),
  }
}

/** Prefer the explicit level; fall back to parent depth for legacy rows. */
export function detectMode(cat: MarketplaceCategory): DialogMode {
  if (cat.level) return MODE_BY_LEVEL[cat.level]
  return cat.parentSlug ? "category" : "department"
}

export const emptyVariant = (): VariantRow => ({ name: "", unit: "", isActive: true })
export const emptyAttr = (): AttrRow => ({ label: "", type: "TEXT", options: "", unit: "", required: false })
