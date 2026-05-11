import type { Property, PropertyQueryParams } from "@/types/property.types"

export function filterProperties(properties: Property[], params: PropertyQueryParams): Property[] {
  let result = [...properties]

  if (params.search) {
    const q = params.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.division.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q),
    )
  }
  if (params.purpose) result = result.filter((p) => p.purpose === params.purpose)
  if (params.type) result = result.filter((p) => p.type === params.type)
  if (params.division) result = result.filter((p) => p.division === params.division)
  if (params.district) result = result.filter((p) => p.district === params.district)
  if (params.area) result = result.filter((p) => p.area.toLowerCase().includes(params.area!.toLowerCase()))
  if (params.minPrice) result = result.filter((p) => p.price >= params.minPrice!)
  if (params.maxPrice) result = result.filter((p) => p.price <= params.maxPrice!)
  if (params.minSize) result = result.filter((p) => p.size >= params.minSize!)
  if (params.maxSize) result = result.filter((p) => p.size <= params.maxSize!)
  if (params.bedrooms) result = result.filter((p) => (p.bedrooms ?? 0) >= params.bedrooms!)
  if (params.verified) result = result.filter((p) => p.isVerified)
  if (params.featured) result = result.filter((p) => p.isFeatured)
  if (params.status) result = result.filter((p) => p.status === params.status)
  if (params.sellerId) result = result.filter((p) => p.sellerId === params.sellerId)

  switch (params.sortBy) {
    case "price_asc":
      result.sort((a, b) => a.price - b.price)
      break
    case "price_desc":
      result.sort((a, b) => b.price - a.price)
      break
    case "featured":
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
      break
    default:
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return result
}
