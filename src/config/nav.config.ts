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
    label: "Projects",
    href: ROUTES.PROJECTS,
    children: [
      { label: "Ongoing Projects", href: `${ROUTES.PROJECTS}?status=ongoing` },
      { label: "Upcoming Projects", href: `${ROUTES.PROJECTS}?status=upcoming` },
      { label: "Completed Projects", href: `${ROUTES.PROJECTS}?status=completed` },
    ],
  },
  {
    label: "Properties",
    href: ROUTES.PROPERTIES,
    children: [
      { label: "For Sale", href: `${ROUTES.PROPERTIES}?purpose=sale` },
      { label: "For Rent", href: `${ROUTES.PROPERTIES}?purpose=rent` },
      { label: "Map Search", href: ROUTES.MAP_SEARCH },
      { label: "Compare Properties", href: ROUTES.COMPARE },
    ],
  },
  { label: "Agents", href: ROUTES.AGENTS },
  {
    label: "Marketplace",
    href: ROUTES.MARKETPLACE,
    highlight: true,
    children: [
      { label: "Browse Marketplace", href: ROUTES.MARKETPLACE },
      { label: "Get a Quote", href: ROUTES.MARKETPLACE_QUOTE },
    ],
  },
  {
    label: "Tools",
    href: ROUTES.PRE_APPROVAL,
    children: [
      { label: "Pre-Approval", href: ROUTES.PRE_APPROVAL },
      { label: "Moving Checklist", href: ROUTES.MOVING_CHECKLIST },
      { label: "Compare Properties", href: ROUTES.COMPARE },
      { label: "Consultation", href: ROUTES.CONSULTATION },
    ],
  },
  { label: "Blog", href: ROUTES.BLOG },
  { label: "About Us", href: ROUTES.ABOUT },
  { label: "Contact", href: ROUTES.CONTACT },
]

export const authNav = {
  login: { label: "Login", href: ROUTES.LOGIN },
  register: { label: "List Property", href: ROUTES.REGISTER, highlight: true },
}
