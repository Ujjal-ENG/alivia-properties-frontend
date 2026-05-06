export const ROUTES = {
  // Public
  HOME: "/",
  PROJECTS: "/projects",
  PROJECT_DETAIL: (slug: string) => `/projects/${slug}`,
  PROPERTIES: "/properties",
  PROPERTY_DETAIL: (slug: string) => `/properties/${slug}`,
  MAP_SEARCH: "/map-search",
  COMPARE: "/compare",
  CONSULTATION: "/consultation",
  ABOUT: "/about-us",
  CONTACT: "/contact-us",
  BLOG: "/blog",
  BLOG_POST: (slug: string) => `/blog/${slug}`,

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  UNAUTHORIZED: "/unauthorized",

  // Admin dashboard
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_PROJECTS: "/admin/projects",
  ADMIN_PROPERTIES: "/admin/properties",
  ADMIN_PENDING: "/admin/pending-listings",
  ADMIN_USERS: "/admin/users",
  ADMIN_SELLERS: "/admin/sellers",
  ADMIN_INQUIRIES: "/admin/inquiries",
  ADMIN_BOOKINGS: "/admin/bookings",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_BLOG: "/admin/blog",
  ADMIN_SETTINGS: "/admin/settings",

  // Seller dashboard
  SELLER_DASHBOARD: "/seller/dashboard",
  SELLER_PROPERTIES: "/seller/properties",
  SELLER_PROPERTY_CREATE: "/seller/properties/create",
  SELLER_PROPERTY_EDIT: (id: string) => `/seller/properties/${id}/edit`,
  SELLER_INQUIRIES: "/seller/inquiries",
  SELLER_BOOKINGS: "/seller/bookings",
  SELLER_PROFILE: "/seller/profile",

  // Buyer dashboard
  BUYER_DASHBOARD: "/buyer/dashboard",
  BUYER_SAVED: "/buyer/saved-properties",
  BUYER_SEARCHES: "/buyer/recent-searches",
  BUYER_INQUIRIES: "/buyer/inquiries",
  BUYER_BOOKINGS: "/buyer/bookings",
  BUYER_PROFILE: "/buyer/profile",

  // Mock API
  API: {
    PROJECTS: "/api/mock/projects",
    PROJECT: (slug: string) => `/api/mock/projects/${slug}`,
    PROPERTIES: "/api/mock/properties",
    PROPERTY: (slug: string) => `/api/mock/properties/${slug}`,
    INQUIRIES: "/api/mock/inquiries",
    BOOKINGS: "/api/mock/bookings",
    USERS: "/api/mock/users",
    DASHBOARD_STATS: "/api/mock/dashboard-stats",
    AUTH: "/api/mock/auth",
  },
} as const
