import type { PropertyType, PropertyPurpose } from "@/types/property.types"

export type PropertyTypeOption = {
  value: PropertyType
  label: string
  icon: string       // lucide-react icon name
  description: string
}

export type PurposeOption = {
  value: PropertyPurpose
  label: string
  icon: string
}

export const PROPERTY_TYPE_OPTIONS: PropertyTypeOption[] = [
  {
    value: "apartment",
    label: "Apartment",
    icon: "Building2",
    description: "Residential flats in multi-storey buildings",
  },
  {
    value: "villa",
    label: "Villa",
    icon: "House",
    description: "Standalone or duplex luxury homes",
  },
  {
    value: "land",
    label: "Land",
    icon: "Map",
    description: "Residential or commercial land plots",
  },
  {
    value: "commercial",
    label: "Commercial",
    icon: "Store",
    description: "Showrooms, warehouses and commercial spaces",
  },
  {
    value: "office",
    label: "Office",
    icon: "Briefcase",
    description: "Office spaces and corporate floors",
  },
  {
    value: "shop",
    label: "Shop",
    icon: "ShoppingBag",
    description: "Retail shops and market stalls",
  },
  {
    value: "plot",
    label: "Plot",
    icon: "LayoutGrid",
    description: "Residential or commercial ready plots",
  },
]

export const PURPOSE_OPTIONS: PurposeOption[] = [
  { value: "sale", label: "For Sale", icon: "Tag" },
  { value: "rent", label: "For Rent", icon: "KeyRound" },
]

export const SIZE_UNIT_OPTIONS = [
  { value: "sqft", label: "Square Feet (sqft)" },
  { value: "katha", label: "Katha" },
  { value: "shotangsho", label: "Shotangsho" },
  { value: "bigha", label: "Bigha" },
]

export const BEDROOM_OPTIONS = [1, 2, 3, 4, 5]

export const PRICE_RANGES = [
  { label: "Under 20 Lakh", min: 0, max: 2_000_000 },
  { label: "20 – 50 Lakh", min: 2_000_000, max: 5_000_000 },
  { label: "50 Lakh – 1 Crore", min: 5_000_000, max: 10_000_000 },
  { label: "1 – 2 Crore", min: 10_000_000, max: 20_000_000 },
  { label: "2 – 5 Crore", min: 20_000_000, max: 50_000_000 },
  { label: "Above 5 Crore", min: 50_000_000, max: Infinity },
]
