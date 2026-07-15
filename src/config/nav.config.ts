import { ROUTES } from "@/config/routes.config"

export type NavItem = {
  label: string
  href: string
  children?: NavItem[]
  highlight?: boolean
}

export const publicNav: NavItem[] = [
  { label: "Home", href: ROUTES.HOME },
  {
    label: "Marketplace",
    href: ROUTES.MARKETPLACE,
    highlight: true,
    children: [
      { label: "Browse Suppliers", href: ROUTES.MARKETPLACE },
      { label: "Request a Quote", href: ROUTES.MARKETPLACE_REQUEST },
      { label: "Quote Wizard", href: ROUTES.MARKETPLACE_QUOTE },
      { label: "Become a Supplier", href: ROUTES.BECOME_SUPPLIER },
    ],
  },
  {
    label: "Apartments",
    href: ROUTES.PROJECTS,
    children: [
      { label: "Ongoing Apartments", href: `${ROUTES.PROJECTS}?status=ongoing` },
      { label: "Upcoming Apartments", href: `${ROUTES.PROJECTS}?status=upcoming` },
      { label: "Completed Apartments", href: `${ROUTES.PROJECTS}?status=completed` },
    ],
  },
  {
    label: "Guides",
    href: ROUTES.PRE_APPROVAL,
    children: [
      { label: "Pre-Approval", href: ROUTES.PRE_APPROVAL },
      { label: "Moving Checklist", href: ROUTES.MOVING_CHECKLIST },
      { label: "Consultation", href: ROUTES.CONSULTATION },
      { label: "Market Insights", href: ROUTES.BLOG },
    ],
  },
  {
    label: "Company",
    href: ROUTES.ABOUT,
    children: [
      { label: "About Alivia", href: ROUTES.ABOUT },
      { label: "Contact", href: ROUTES.CONTACT },
    ],
  },
]

export const authNav = {
  login: { label: "Login", href: ROUTES.LOGIN },
  register: { label: "Create Account", href: ROUTES.REGISTER, highlight: true },
}
