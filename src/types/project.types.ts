export type ProjectStatus = "ongoing" | "upcoming" | "completed"

export type ProjectUnit = {
  id?: string
  type?: string
  name?: string
  bedrooms?: number
  bathrooms?: number
  size?: number
  sizeUnit?: string
  price?: number
  priceMax?: number
  priceFrom?: number
  priceTo?: number
  available?: number
  total?: number
}

export type NearbyLandmark = {
  name: string
  distance: string
}

export type Project = {
  id: string
  slug: string
  name: string
  tagline?: string
  description?: string
  status: ProjectStatus
  location: string
  address?: string
  area?: string
  division?: string

  // images — backend may send as objects; service normalises to strings
  coverImageUrl?: string
  coverImage?: string          // alias for pages that use coverImage
  galleryImages: string[]

  handoverDate?: string
  landSize?: number
  landSizeUnit?: string
  totalFloors?: number
  totalUnits?: number
  availableUnits?: number
  priceFrom?: number
  priceTo?: number
  amenities?: string[]
  units?: ProjectUnit[]
  specifications?: Record<string, string | number>
  nearbyLandmarks?: NearbyLandmark[]
  developerName?: string
  isFeatured?: boolean
  featured?: boolean            // alias for pages that use featured
  createdAt?: string
  updatedAt?: string
}
