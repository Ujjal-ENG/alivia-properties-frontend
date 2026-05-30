export type ReviewTargetType = "property" | "agent" | "project"

export type ReviewAuthor = {
  id: string
  name: string
  avatarUrl?: string | null
}

export type Review = {
  id: string
  propertyId?: string | null
  agentId?: string | null
  authorId: string
  author?: ReviewAuthor
  rating: number
  title?: string | null
  body: string
  isVerified: boolean
  helpful: number
  createdAt: string
  updatedAt?: string
}
