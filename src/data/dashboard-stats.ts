import type { DashboardStats, ChartDataPoint, ActivityItem } from "@/types/dashboard.types"

export const DUMMY_ADMIN_STATS: DashboardStats = {
  totalProperties: 248,
  pendingListings: 18,
  approvedListings: 195,
  verifiedListings: 87,
  featuredListings: 24,
  totalUsers: 1340,
  totalSellers: 210,
  totalBuyers: 1130,
  totalInquiries: 876,
  newInquiries: 34,
  totalBookings: 312,
  pendingBookings: 22,
  totalProjects: 6,
  revenuePlaceholder: 0,
}

export const MONTHLY_LISTINGS_DATA: ChartDataPoint[] = [
  { label: "Jan", value: 18 },
  { label: "Feb", value: 24 },
  { label: "Mar", value: 32 },
  { label: "Apr", value: 28 },
  { label: "May", value: 41 },
  { label: "Jun", value: 36 },
  { label: "Jul", value: 52 },
  { label: "Aug", value: 48 },
  { label: "Sep", value: 39 },
  { label: "Oct", value: 55 },
  { label: "Nov", value: 61 },
  { label: "Dec", value: 44 },
]

export const INQUIRY_BY_TYPE_DATA: ChartDataPoint[] = [
  { label: "Property Inquiry", value: 540 },
  { label: "Project Inquiry", value: 198 },
  { label: "General", value: 92 },
  { label: "Reports", value: 46 },
]

export const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "act-1",
    type: "property_listed",
    title: "New property listed",
    description: "3 Bed Apartment in Bashundhara R/A listed for sale",
    timestamp: "2025-01-10T09:30:00Z",
    userName: "Md. Karim",
  },
  {
    id: "act-2",
    type: "inquiry_received",
    title: "New inquiry received",
    description: "Inquiry on Alivia Residencia project",
    timestamp: "2025-01-10T10:15:00Z",
    userName: "Farhan Ahmed",
  },
  {
    id: "act-3",
    type: "booking_made",
    title: "Consultation booked",
    description: "Buying consultation scheduled for 15 Jan",
    timestamp: "2025-01-10T11:00:00Z",
    userName: "Nusrat Jahan",
  },
  {
    id: "act-4",
    type: "listing_approved",
    title: "Listing approved",
    description: "Commercial space in Gulshan approved",
    timestamp: "2025-01-10T12:45:00Z",
    userName: "Admin",
  },
  {
    id: "act-5",
    type: "user_joined",
    title: "New seller registered",
    description: "New seller account verified",
    timestamp: "2025-01-10T14:00:00Z",
    userName: "Tanvir Hossain",
  },
]
