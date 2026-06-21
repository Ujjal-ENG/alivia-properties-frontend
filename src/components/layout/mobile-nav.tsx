"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageCircle, Phone, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
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

function getNavPath(href: string) {
  return href.split("?")[0]
}

function isNavItemActive(pathname: string, href: string) {
  const itemPath = getNavPath(href)
  return itemPath === "/" ? pathname === "/" : pathname.startsWith(itemPath)
}

function NavLinks({ items, onClose }: { items: NavItem[]; onClose: () => void }) {
  const pathname = usePathname()
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            onClick={onClose}
            aria-current={isNavItemActive(pathname, item.href) ? "page" : undefined}
            className={cn(
              "flex items-center rounded-2xl px-3 py-3 text-sm font-semibold transition-colors",
              isNavItemActive(pathname, item.href)
                ? "bg-brand-50 text-brand-800"
                : "text-ink-700 hover:bg-brand-50/70",
            )}
          >
            {item.label}
          </Link>
          {item.children && (
            <ul className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    onClick={onClose}
                    className="flex items-center rounded-xl px-3 py-2 text-sm text-ink-500 transition-colors hover:bg-brand-50 hover:text-ink-800"
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { data: session } = useSession()
  const role = session?.user?.role as UserRole | undefined

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="left"
        className="mobile-liquid-glass flex w-[88vw] max-w-sm flex-col overscroll-contain border-r-white/80 bg-white/95 p-0 backdrop-blur-xl"
      >
        <SheetHeader className="shrink-0 border-b border-border/70 px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="font-heading text-lg font-semibold text-brand-900">
                {siteConfig.shortName}
                <span className="text-gold-600"> Properties</span>
              </SheetTitle>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-ink-500">
                Bangladesh Real Estate
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-brand-50"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
          <div className="mobile-liquid-glass rounded-[1.5rem] border border-brand-100 bg-brand-aurora p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-700">
              Trusted since 2011
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              Find building suppliers, request quotes, browse verified properties,
              or talk to an advisor from one clear starting point.
            </p>
          </div>

          <NavLinks items={publicNav} onClose={onClose} />

          {/* Contact */}
          <div className="space-y-2 border-t border-border/70 pt-4">
            <p className="px-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-500">
              Get in touch
            </p>
            <a
              href={`tel:${siteConfig.contact.phoneRaw}`}
              onClick={onClose}
              className="flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50"
            >
              <Phone className="h-4 w-4 text-brand-600" />
              {siteConfig.contact.phone}
            </a>
            <a
              href={`https://wa.me/${siteConfig.contact.whatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Sticky action footer */}
        <div className="mobile-liquid-glass-nav shrink-0 space-y-2 border-t border-border/70 bg-white/95 px-5 py-4">
          {role ? (
            <Link href={getDashboardRoute(role)} onClick={onClose}>
              <Button className="w-full gap-1.5 rounded-full bg-brand-700 text-white hover:bg-brand-800">
                <LayoutDashboard className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href={ROUTES.CONSULTATION} onClick={onClose}>
                <Button variant="outline" className="w-full rounded-full">
                  Consult Expert
                </Button>
              </Link>
              <Link href={ROUTES.MARKETPLACE} onClick={onClose}>
                <Button className="w-full rounded-full bg-brand-700 text-white hover:bg-brand-800">
                  Browse Marketplace
                </Button>
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link href={authNav.login.href} onClick={onClose}>
                  <Button variant="outline" className="w-full rounded-full">
                    Login
                  </Button>
                </Link>
                <Link href={authNav.register.href} onClick={onClose}>
                  <Button variant="outline" className="w-full rounded-full">
                    List Property
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
