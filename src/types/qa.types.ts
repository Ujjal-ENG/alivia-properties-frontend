export type QAAuthor = {
  id: string
  name: string
  avatarUrl?: string | null
}

export type QAItem = {
  id: string
  propertyId: string
  authorId: string
  author?: QAAuthor
  question: string
  answer?: string | null
  answeredAt?: string | null
  answeredBy?: string | null
  upvotes: number
  createdAt: string
  updatedAt?: string
}
