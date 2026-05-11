export type DashboardStats = {
  totalProperties: number
  pendingListings: number
  approvedListings: number
  verifiedListings: number
  featuredListings: number
  totalUsers: number
  totalSellers: number
  totalBuyers: number
  totalInquiries: number
  newInquiries: number
  totalBookings: number
  pendingBookings: number
  totalProjects: number
  revenuePlaceholder: number
}

export type ChartDataPoint = {
  label: string
  value: number
}

export type ActivityItem = {
  id: string
  type: 'property_listed' | 'inquiry_received' | 'booking_made' | 'user_joined' | 'listing_approved'
  title: string
  description: string
  timestamp: string
  userId?: string
  userName?: string
}

export type SellerStats = {
  totalListings: number
  activeListings: number
  pendingListings: number
  rejectedListings: number
  totalInquiries: number
  newInquiries: number
  totalBookings: number
  totalViews: number
}

export type BuyerStats = {
  savedProperties: number
  recentSearches: number
  totalInquiries: number
  totalBookings: number
}

export type PropertyStatusPoint = {
  label: string
  pending: number
  approved: number
  verified: number
}
