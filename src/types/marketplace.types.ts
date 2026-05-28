export type MarketplaceProduct = {
  id: string
  slug: string
  name: string
  supplierId: string
  categorySlug: string
  image: string
  price: number
  unit: string
  description: string
  inStock: boolean
  moq?: number
  leadTimeDays?: number
  brand?: string
  rating?: number
  reviewCount?: number
  badge?: string
}

export type SupplierKind = "supplier" | "service" | "SUPPLIER" | "SERVICE"

export type Supplier = {
  id: string
  slug: string
  name: string
  kind: SupplierKind
  tagline: string
  logo?: string
  coverImage: string
  location: string
  serviceAreas: string[]
  rating: number
  reviewCount: number
  yearsInBusiness: number
  responseTimeHours: number
  deliveryDays?: number
  priceRange: string
  brands?: string[]
  certifications?: string[]
  phone: string
  whatsApp?: string
  email?: string
  isVerified: boolean
  isFeatured: boolean
  categories: string[]
}
