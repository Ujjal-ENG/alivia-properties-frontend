"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChevronDown,
  Circle,
  Compass,
  Headset,
  Home,
  Info,
  Landmark,
  LayoutDashboard,
  MessageCircle,
  Phone,
  ShoppingBag,
  X,
  type LucideIcon,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { publicNav, authNav, type NavItem } from "@/config/nav.config"
import { siteConfig } from "@/config/site.config"
import { ROUTES } from "@/config/routes.config"
import { getDashboardRoute } from "@/utils/auth-helpers"
import type { UserRole } from "@/types/user.types"

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

/** Icon per top-level nav item (keyed by label so nav.config stays presentation-free). */
const NAV_ICONS: Record<string, LucideIcon> = {
  Home,
  Marketplace: ShoppingBag,
  Apartments: Landmark,
  Guides: Compass,
  Company: Info,
}

const QUICK_ACTIONS: { label: string; caption: string; href: string; icon: LucideIcon }[] = [
  { label: "Marketplace", caption: "Suppliers & quotes", href: ROUTES.MARKETPLACE, icon: ShoppingBag },
  { label: "Apartments", caption: "Our developments", href: ROUTES.PROJECTS, icon: Landmark },
  { label: "Consult", caption: "Talk to an expert", href: ROUTES.CONSULTATION, icon: Headset },
]

function getNavPath(href: string) {
  return href.split("?")[0]
}

function isNavItemActive(pathname: string, href: string) {
  const itemPath = getNavPath(href)
  return itemPath === "/" ? pathname === "/" : pathname.startsWith(itemPath)
}

function NavRow({
  item,
  pathname,
  navigate,
}: {
  item: NavItem
  pathname: string
  navigate: (href: string) => (e: React.MouseEvent) => void
}) {
  const Icon = NAV_ICONS[item.label] ?? Circle
  const active = isNavItemActive(pathname, item.href)
  const [expanded, setExpanded] = useState(active && !!item.children)

  // Leaf item — a single tappable destination.
  if (!item.children) {
    return (
      <Link
        href={item.href}
        onClick={navigate(item.href)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors",
          active ? "bg-brand-700 text-white shadow-sm" : "text-ink-700 hover:bg-white/70",
        )}
      >
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-xl transition-colors",
            active ? "bg-white/20 text-white" : "bg-brand-50 text-brand-700 group-hover:bg-brand-100",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1">{item.label}</span>
        <ArrowUpRight className={cn("h-4 w-4 shrink-0", active ? "text-white/80" : "text-ink-300")} />
      </Link>
    )
  }

  // Grouped item — accordion that expands to reveal its children.
  return (
    <div className={cn("rounded-2xl transition-colors", expanded && "bg-white/55")}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-white/70"
      >
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-xl transition-colors",
            active ? "bg-brand-700 text-white" : "bg-brand-50 text-brand-700",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-ink-400 transition-transform duration-200", expanded && "rotate-180")}
        />
      </button>

      {expanded && (
        <ul className="space-y-0.5 px-2 pb-2 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <li>
            <Link
              href={item.href}
              onClick={navigate(item.href)}
              className="flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-[0.8rem] font-semibold text-brand-700 transition-colors hover:bg-white/70"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              All {item.label}
            </Link>
          </li>
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={navigate(child.href)}
                aria-current={isNavItemActive(pathname, child.href) ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center rounded-xl px-3 py-2 pl-8 text-[0.82rem] transition-colors",
                  isNavItemActive(pathname, child.href)
                    ? "font-semibold text-brand-800"
                    : "text-ink-600 hover:bg-white/70 hover:text-ink-900",
                )}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined
  const pathname = usePathname()
  const router = useRouter()

  // Navigate programmatically instead of relying on the <Link>'s default
  // action. Inside a modal dialog on touch devices, dismissing the sheet can
  // swallow the anchor's navigation, so taps appeared to do nothing. Pushing
  // via the router is independent of the dialog's dismissal, then we close on
  // the next frame so the navigation isn't interrupted.
  const navigate = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    router.push(href)
    requestAnimationFrame(() => onClose())
  }

  // External / protocol links (tel:, wa.me) keep their native action; just
  // dismiss the sheet afterwards.
  const closeSoon = () => {
    requestAnimationFrame(() => onClose())
  }

  const primaryCta =
    "glass-interactive inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800"
  const outlineCta =
    "glass-interactive inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-brand-200 bg-white/70 px-5 text-sm font-semibold text-brand-800 transition-colors hover:bg-white"

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="mobile-liquid-glass flex w-[90vw] max-w-sm flex-col gap-0 overscroll-contain border-r-white/60 bg-white/95 p-0 backdrop-blur-xl"
      >
        {/* Header */}
        <SheetHeader className="shrink-0 border-b border-white/40 px-5 pb-4 pt-5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" onClick={navigate("/")} className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-brand-600 to-brand-900 shadow-md">
                <Building2 className="h-5 w-5 text-white" />
              </span>
              <span className="block">
                <SheetTitle className="font-heading text-base font-semibold leading-tight text-brand-900">
                  {siteConfig.shortName}
                  <span className="text-gold-600"> Properties</span>
                </SheetTitle>
                <span className="mt-0.5 block text-[0.6rem] uppercase tracking-[0.18em] text-ink-500">
                  Bangladesh Real Estate
                </span>
              </span>
            </Link>
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="glass-interactive mobile-liquid-glass-control flex size-10 items-center justify-center rounded-full border border-white/60 text-ink-600 transition-colors hover:text-ink-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
          {/* Quick action tiles */}
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={navigate(action.href)}
                className="glass-interactive group flex flex-col gap-2 rounded-2xl border border-white/60 bg-white/80 p-3.5 shadow-sm transition-colors hover:border-brand-200 hover:bg-white"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-100">
                  <action.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-900">{action.label}</span>
                  <span className="block text-[0.7rem] text-ink-500">{action.caption}</span>
                </span>
              </Link>
            ))}
          </div>

          {/* Browse — accordion navigation */}
          <div>
            <p className="px-1 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-500">
              Browse
            </p>
            <nav aria-label="Mobile navigation" className="space-y-1">
              {publicNav.map((item) => (
                <NavRow key={item.href} item={item} pathname={pathname} navigate={navigate} />
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-1 border-t border-white/40 pt-4">
            <p className="px-1 pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-500">
              Get in touch
            </p>
            <a
              href={`tel:${siteConfig.contact.phoneRaw}`}
              onClick={closeSoon}
              className="flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-white/70"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Phone className="h-4 w-4" />
              </span>
              {siteConfig.contact.phone}
            </a>
            <a
              href={`https://wa.me/${siteConfig.contact.whatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeSoon}
              className="flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-white/70"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <MessageCircle className="h-4 w-4" />
              </span>
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Sticky action footer */}
        <div className="mobile-liquid-glass-nav shrink-0 space-y-2 border-t border-white/40 px-5 py-4">
          {role ? (
            <Link href={getDashboardRoute(role)} onClick={navigate(getDashboardRoute(role))} className={primaryCta}>
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href={ROUTES.MARKETPLACE} onClick={navigate(ROUTES.MARKETPLACE)} className={primaryCta}>
                <ShoppingBag className="h-4 w-4" />
                Browse Marketplace
              </Link>
              <Link href={ROUTES.CONSULTATION} onClick={navigate(ROUTES.CONSULTATION)} className={outlineCta}>
                Consult an Expert
              </Link>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <Link
                  href={authNav.login.href}
                  onClick={navigate(authNav.login.href)}
                  className="glass-interactive inline-flex min-h-11 items-center justify-center rounded-full border border-ink-200 bg-white/70 text-sm font-semibold text-ink-700 transition-colors hover:bg-white"
                >
                  Login
                </Link>
                <Link
                  href={authNav.register.href}
                  onClick={navigate(authNav.register.href)}
                  className="glass-interactive inline-flex min-h-11 items-center justify-center rounded-full border border-ink-200 bg-white/70 text-sm font-semibold text-ink-700 transition-colors hover:bg-white"
                >
                  List Property
                </Link>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
