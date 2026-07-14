export type HeroSlide = {
  id: string
  eyebrow?: string | null
  eyebrowIcon?: string | null
  title: string
  subtitle?: string | null
  imageKey?: string | null
  imageUrl?: string | null
  primaryLabel?: string | null
  primaryHref?: string | null
  secondaryLabel?: string | null
  secondaryHref?: string | null
  order: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}
