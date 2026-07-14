import {
  Award,
  Building2,
  Gem,
  Home,
  KeyRound,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"

/**
 * Curated set of eyebrow icons an admin can attach to a hero slide. Kept small
 * and explicit (rather than the whole lucide set) so the picker stays relevant
 * and the public carousel bundle only pulls these icons. Shared by the admin
 * slide form (the dropdown) and the carousel (name → component resolver).
 */
export const HERO_ICONS = {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Home,
  Building2,
  KeyRound,
  Star,
  Award,
  Gem,
  Tag,
  Rocket,
  MapPin,
} satisfies Record<string, LucideIcon>

export type HeroIconName = keyof typeof HERO_ICONS

export const HERO_ICON_NAMES = Object.keys(HERO_ICONS) as HeroIconName[]

export const DEFAULT_HERO_ICON: HeroIconName = "Sparkles"

/** Resolve a stored icon name to a lucide component, falling back to the default. */
export function resolveHeroIcon(name?: string | null): LucideIcon {
  if (name && name in HERO_ICONS) return HERO_ICONS[name as HeroIconName]
  return HERO_ICONS[DEFAULT_HERO_ICON]
}
