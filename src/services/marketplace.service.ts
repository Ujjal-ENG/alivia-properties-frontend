import { httpClient, type Paginated } from "./http-client"
import type {
  MarketplaceProduct,
  Supplier,
} from "@/types/marketplace.types"

export type MarketplaceCategory = {
  id: string
  slug: string
  name: string
  description?: string | null
  iconUrl?: string | null
  parentSlug?: string | null
  order: number
}

export type SupplierWithProducts = Supplier & { products: MarketplaceProduct[] }

export type ProductWithSupplier = MarketplaceProduct & {
  supplier?: { id: string; slug: string; name: string; phone?: string; email?: string }
  category?: MarketplaceCategory
}

type ListParams = {
  page?: number
  limit?: number
  search?: string
  sort?: string
  category?: string
  supplierId?: string
}

export type CreateCategoryInput = {
  slug: string
  name: string
  description?: string
  iconUrl?: string
  parentSlug?: string
  order?: number
}

export type UpdateCategoryInput = Partial<Omit<CreateCategoryInput, "description" | "iconUrl" | "parentSlug">> & {
  description?: string | null
  iconUrl?: string | null
  parentSlug?: string | null
}

export const marketplaceService = {
  listCategories(): Promise<MarketplaceCategory[]> {
    return httpClient.get<MarketplaceCategory[]>("/marketplace/categories")
  },

  // ─── Admin methods ────────────────────────────────────────────────────────

  adminListCategories(token: string): Promise<MarketplaceCategory[]> {
    return httpClient.get<MarketplaceCategory[]>("/marketplace/admin/categories", { token })
  },

  adminCreateCategory(data: CreateCategoryInput, token: string): Promise<MarketplaceCategory> {
    return httpClient.post<MarketplaceCategory>("/marketplace/admin/categories", data, { token })
  },

  adminUpdateCategory(slug: string, data: UpdateCategoryInput, token: string): Promise<MarketplaceCategory> {
    return httpClient.patch<MarketplaceCategory>(`/marketplace/admin/categories/${slug}`, data, { token })
  },

  adminDeleteCategory(slug: string, token: string): Promise<MarketplaceCategory> {
    return httpClient.delete<MarketplaceCategory>(`/marketplace/admin/categories/${slug}`, { token })
  },

  adminReorderCategories(slugs: string[], token: string): Promise<{ reordered: number }> {
    return httpClient.put<{ reordered: number }>("/marketplace/admin/categories/reorder", { slugs }, { token })
  },

  /** Upload a file through the NestJS API (server → MinIO, no browser CORS needed). */
  uploadCategoryImage(
    file: File,
    token: string,
  ): Promise<{ fileKey: string; publicUrl: string; bucket: string }> {
    const form = new FormData()
    form.append("file", file)
    form.append("kind", "category-image")
    // Pass FormData directly — httpClient.post detects it and skips JSON.stringify.
    // Do NOT set Content-Type header; the browser must set it with the multipart boundary.
    return httpClient.post("/uploads/file", form, { token })
  },

  listProducts(params: ListParams = {}): Promise<Paginated<ProductWithSupplier>> {
    return httpClient.paginated<ProductWithSupplier>("/marketplace/products", {
      query: params as Record<string, string | number | boolean | undefined>,
    })
  },

  productBySlug(slug: string): Promise<ProductWithSupplier> {
    return httpClient.get<ProductWithSupplier>(`/marketplace/products/${slug}`)
  },

  listSuppliers(params: ListParams = {}): Promise<Paginated<Supplier>> {
    return httpClient.paginated<Supplier>("/marketplace/suppliers", {
      query: params as Record<string, string | number | boolean | undefined>,
    })
  },

  supplierBySlug(slug: string): Promise<SupplierWithProducts> {
    return httpClient.get<SupplierWithProducts>(`/marketplace/suppliers/${slug}`)
  },
}
