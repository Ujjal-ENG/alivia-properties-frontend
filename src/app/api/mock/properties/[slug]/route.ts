import { type NextRequest } from "next/server"
import { ok, notFound, badRequest } from "@/app/api/_utils/api-response"
import { propertiesStore } from "@/app/api/mock/properties/store"

type RouteContext = { params: Promise<{ slug: string }> }

export async function GET(_request: NextRequest, { params }: RouteContext) {
  await new Promise((r) => setTimeout(r, 200))
  const { slug } = await params
  const property = propertiesStore.find((p) => p.slug === slug || p.id === slug)
  if (!property) return notFound("Property not found")
  return ok(property, "Property fetched")
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  await new Promise((r) => setTimeout(r, 200))
  const { slug } = await params
  const idx = propertiesStore.findIndex((p) => p.slug === slug || p.id === slug)
  if (idx === -1) return notFound("Property not found")

  const body = await request.json()
  if (typeof body !== "object" || body === null) return badRequest("Invalid body")

  propertiesStore[idx] = { ...propertiesStore[idx], ...body, updatedAt: new Date().toISOString() }
  return ok(propertiesStore[idx], "Property updated")
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  await new Promise((r) => setTimeout(r, 200))
  const { slug } = await params
  const idx = propertiesStore.findIndex((p) => p.slug === slug || p.id === slug)
  if (idx === -1) return notFound("Property not found")

  propertiesStore.splice(idx, 1)
  return ok(null, "Property deleted")
}
