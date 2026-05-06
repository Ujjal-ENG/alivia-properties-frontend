import { ROUTES } from "@/config/routes.config"

export type DashboardNavItem = {
  label: string
  href: string
  icon: string   // lucide-react icon name
  badge?: string
  section?: string
}

export const adminNav: DashboardNavItem[] = [
  { label: "Dashboard", href: ROUTES.ADMIN_DASHBOARD, icon: "LayoutDashboard", section: "Overview" },

  { label: "Projects", href: ROUTES.ADMIN_PROJECTS, icon: "Building2", section: "Inventory" },
  { label: "Properties", href: ROUTES.ADMIN_PROPERTIES, icon: "Home", section: "Inventory" },
  { label: "Pending Listings", href: ROUTES.ADMIN_PENDING, icon: "Clock", badge: "pending", section: "Inventory" },

  { label: "Users", href: ROUTES.ADMIN_USERS, icon: "Users", section: "People" },
  { label: "Sellers", href: ROUTES.ADMIN_SELLERS, icon: "UserCheck", section: "People" },

  { label: "Inquiries", href: ROUTES.ADMIN_INQUIRIES, icon: "MessageSquare", section: "Activity" },
  { label: "Bookings", href: ROUTES.ADMIN_BOOKINGS, icon: "CalendarCheck", section: "Activity" },
  { label: "Reports", href: ROUTES.ADMIN_REPORTS, icon: "Flag", section: "Activity" },

  { label: "Blog", href: ROUTES.ADMIN_BLOG, icon: "FileText", section: "Content" },
  { label: "Settings", href: ROUTES.ADMIN_SETTINGS, icon: "Settings", section: "Content" },
]

export const sellerNav: DashboardNavItem[] = [
  { label: "Dashboard", href: ROUTES.SELLER_DASHBOARD, icon: "LayoutDashboard", section: "Overview" },
  { label: "My Properties", href: ROUTES.SELLER_PROPERTIES, icon: "Home", section: "Listings" },
  { label: "Add Property", href: ROUTES.SELLER_PROPERTY_CREATE, icon: "PlusCircle", section: "Listings" },
  { label: "Inquiries", href: ROUTES.SELLER_INQUIRIES, icon: "MessageSquare", section: "Activity" },
  { label: "Bookings", href: ROUTES.SELLER_BOOKINGS, icon: "CalendarCheck", section: "Activity" },
  { label: "Profile", href: ROUTES.SELLER_PROFILE, icon: "User", section: "Account" },
]

export const buyerNav: DashboardNavItem[] = [
  { label: "Dashboard", href: ROUTES.BUYER_DASHBOARD, icon: "LayoutDashboard", section: "Overview" },
  { label: "Saved Properties", href: ROUTES.BUYER_SAVED, icon: "Heart", section: "Discovery" },
  { label: "Recent Searches", href: ROUTES.BUYER_SEARCHES, icon: "Search", section: "Discovery" },
  { label: "Inquiries", href: ROUTES.BUYER_INQUIRIES, icon: "MessageSquare", section: "Activity" },
  { label: "Bookings", href: ROUTES.BUYER_BOOKINGS, icon: "CalendarCheck", section: "Activity" },
  { label: "Profile", href: ROUTES.BUYER_PROFILE, icon: "User", section: "Account" },
]
