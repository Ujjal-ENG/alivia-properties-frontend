import { type NextRequest } from "next/server"
import { ok, created, badRequest } from "@/app/api/_utils/api-response"
import { paginateArray } from "@/app/api/_utils/pagination"
import { filterProperties } from "@/utils/filter-properties"
import { propertySchema } from "@/schemas/property.schema"
import type { Property, PropertyQueryParams } from "@/types/property.types"
import { slugify } from "@/utils/slugify"
import { propertiesStore } from "@/app/api/mock/properties/store"

export async function GET(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 200))

  const sp = request.nextUrl.searchParams
  const params: PropertyQueryParams = {
    search:   sp.get("search") ?? undefined,
    purpose:  (sp.get("purpose") as PropertyQueryParams["purpose"]) ?? undefined,
    type:     (sp.get("type") as PropertyQueryParams["type"]) ?? undefined,
    division: sp.get("division") ?? undefined,
    district: sp.get("district") ?? undefined,
    area:     sp.get("area") ?? undefined,
    minPrice: sp.has("minPrice") ? Number(sp.get("minPrice")) : undefined,
    maxPrice: sp.has("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
    minSize:  sp.has("minSize") ? Number(sp.get("minSize")) : undefined,
    maxSize:  sp.has("maxSize") ? Number(sp.get("maxSize")) : undefined,
    bedrooms: sp.has("bedrooms") ? Number(sp.get("bedrooms")) : undefined,
    verified: sp.get("verified") === "true" ? true : undefined,
    featured: sp.get("featured") === "true" ? true : undefined,
    status:   (sp.get("status") as PropertyQueryParams["status"]) ?? undefined,
    sellerId: sp.get("sellerId") ?? undefined,
    sortBy:   (sp.get("sortBy") as PropertyQueryParams["sortBy"]) ?? undefined,
  }

  const page  = Number(sp.get("page")  ?? 1)
  const limit = Number(sp.get("limit") ?? 12)

  const filtered = filterProperties(propertiesStore, params)
  const { data, meta } = paginateArray(filtered, page, limit)
  return ok(data, "Properties fetched", meta)
}

export async function POST(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 200))

  const body = await request.json()
  const result = propertySchema.safeParse(body)
  if (!result.success) return badRequest(result.error.issues[0]?.message ?? "Validation failed")

  const data = result.data
  const now = new Date().toISOString()
  const newProperty: Property = {
    id: `prop-${Date.now()}`,
    slug: slugify(data.title),
    title: data.title,
    description: data.description,
    type: data.type,
    purpose: data.purpose,
    status: "pending",
    price: data.price,
    priceNegotiable: data.priceNegotiable,
    division: data.division,
    district: data.district,
    area: data.area,
    address: data.address,
    mapPin: data.mapPin,
    size: data.size,
    sizeUnit: data.sizeUnit,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    balconies: data.balconies,
    floorNumber: data.floorNumber,
    totalFloors: data.totalFloors,
    facilities: data.facilities,
    images: data.images ?? [],
    videoUrl: data.videoUrl || undefined,
    isVerified: false,
    isFeatured: false,
    viewCount: 0,
    sellerId: "seller-001", // placeholder — real auth replaces this
    sellerName: data.contactName,
    sellerPhone: data.contactPhone,
    sellerWhatsApp: data.whatsApp || undefined,
    sellerVerified: false,
    createdAt: now,
    updatedAt: now,
  }

  propertiesStore.push(newProperty)
  return created(newProperty, "Property listed successfully")
}
