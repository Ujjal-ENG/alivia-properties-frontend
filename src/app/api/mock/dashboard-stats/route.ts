import { ok } from "@/app/api/_utils/api-response"
import {
  DUMMY_ADMIN_STATS,
  MONTHLY_LISTINGS_DATA,
  INQUIRY_BY_TYPE_DATA,
  MONTHLY_BOOKINGS_DATA,
  PROPERTY_STATUS_QUARTERLY,
  RECENT_ACTIVITY,
} from "@/data/dashboard-stats"

export async function GET() {
  await new Promise((r) => setTimeout(r, 200))
  return ok(
    {
      stats: DUMMY_ADMIN_STATS,
      monthlyListings: MONTHLY_LISTINGS_DATA,
      inquiryByType: INQUIRY_BY_TYPE_DATA,
      monthlyBookings: MONTHLY_BOOKINGS_DATA,
      propertyStatusByQuarter: PROPERTY_STATUS_QUARTERLY,
      recentActivity: RECENT_ACTIVITY,
    },
    "Dashboard stats fetched",
  )
}
