export type PropertyType =
  | "apartment"
  | "house"
  | "townhouse"
  | "villa"
  | "studio"
  | "plot"
  | "land"
  | "commercial"
  | "office"
  | "shop"
  | "warehouse"

export type PropertyPurpose = "sale" | "rent"

export type PropertyStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "verified"
  | "featured"

export type PropertyImage = {
  key?: string
  url: string
  isCover?: boolean
  order?: number
}

export type Property = {
  id: string
  slug: string
  title: string
  description: string
  type: PropertyType
  purpose: PropertyPurpose
  status: PropertyStatus
  price: number
  priceNegotiable?: boolean
  rentPeriod?: string

  division: string
  district: string
  area: string
  address?: string

  size: number
  sizeUnit: string
  bedrooms?: number
  bathrooms?: number
  balconies?: number
  floorNumber?: number
  totalFloors?: number
  parkingSpots?: number
  yearBuilt?: number

  facilities: string[]
  images: string[]
  videos?: string[]
  videoUrl?: string
  /** Equirectangular 360° image URL for the in-app virtual tour. */
  panoramaUrl?: string

  mapPin?: string
  isVerified?: boolean
  isFeatured?: boolean
  sellerId?: string
  sellerName: string
  sellerAvatar?: string
  sellerPhone: string
  sellerWhatsApp?: string
  sellerVerified?: boolean
  approvedAt?: string

  viewCount: number
  createdAt: string
  updatedAt?: string
}

export type PropertyQueryParams = {
  page?: number
  limit?: number
  status?: string
  purpose?: string
  type?: string
  search?: string
  sort?: string
  sortBy?: string
  city?: string
  district?: string
  division?: string
  area?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  verified?: boolean
  featured?: boolean
  minSize?: number
  maxSize?: number
  sellerId?: string
}
