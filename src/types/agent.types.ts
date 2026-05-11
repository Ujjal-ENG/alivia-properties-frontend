export type AgentSpecialty = 'residential' | 'commercial' | 'land' | 'luxury' | 'rental'

export type Agent = {
  id: string
  slug: string
  name: string
  email: string
  phone: string
  whatsApp?: string
  avatar?: string
  coverImage?: string
  bio: string
  companyName?: string
  licenseNumber: string
  yearsExperience: number
  specialties: AgentSpecialty[]
  serviceAreas: string[]
  languages: string[]
  totalListings: number
  activeListings: number
  closedDeals: number
  rating: number
  reviewCount: number
  responseTimeHours: number
  isVerified: boolean
  isFeatured: boolean
  joinedAt: string
}

export type AgentQueryParams = {
  search?: string
  specialty?: AgentSpecialty
  area?: string
  minRating?: number
  verified?: boolean
  page?: number
  limit?: number
}
