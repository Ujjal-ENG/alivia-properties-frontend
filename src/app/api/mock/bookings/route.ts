import { type NextRequest } from "next/server"
import { ok, created, badRequest } from "@/app/api/_utils/api-response"
import { DUMMY_BOOKINGS } from "@/data/dummy-bookings"
import { bookingSchema } from "@/schemas/booking.schema"
import type { Booking } from "@/types/booking.types"

const bookingsStore: Booking[] = [...DUMMY_BOOKINGS]

export async function GET(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 200))

  const sp = request.nextUrl.searchParams
  const userId = sp.get("userId")
  const status = sp.get("status")

  let results = [...bookingsStore]
  if (userId) results = results.filter((b) => b.userId === userId)
  if (status) results = results.filter((b) => b.status === status)

  return ok(results, "Bookings fetched")
}

export async function POST(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 200))

  const body = await request.json()
  const result = bookingSchema.safeParse(body)
  if (!result.success) return badRequest(result.error.issues[0]?.message ?? "Validation failed")

  const d = result.data
  const newBooking: Booking = {
    id: `book-${Date.now()}`,
    consultationType: d.consultationType,
    status: "pending",
    projectId: d.projectId,
    propertyId: d.propertyId,
    name: d.name,
    email: d.email,
    phone: d.phone,
    preferredDate: d.preferredDate,
    preferredTime: d.preferredTime,
    message: d.message,
    createdAt: new Date().toISOString(),
  }

  bookingsStore.push(newBooking)
  return created(newBooking, "Consultation booked successfully")
}
