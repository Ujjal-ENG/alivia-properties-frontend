"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { publicNav, authNav, type NavItem } from "@/config/nav.config"
import { siteConfig } from "@/config/site.config"

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
            {item.label === "About Us" ? "About" : item.label}
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
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="left" className="w-80 overscroll-contain border-r-white/80 bg-white/95 p-0 backdrop-blur-xl">
        <SheetHeader className="border-b border-border/70 px-5 py-5">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg font-semibold text-brand-900">{siteConfig.name}</SheetTitle>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-500">Editorial property discovery</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 transition-colors hover:bg-brand-50"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </SheetHeader>

        <div className="h-full space-y-6 overflow-y-auto overscroll-contain px-5 py-5 pb-20">
          <div className="rounded-[1.5rem] border border-brand-100 bg-brand-aurora p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-brand-700">Trusted since 2011</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              Explore premium projects, verified listings, and consultation flow in one cleaner property journey.
            </p>
          </div>

          <NavLinks items={publicNav} onClose={onClose} />

          <div className="space-y-2 border-t border-border/70 pt-4">
            <Link href={authNav.login.href} onClick={onClose}>
              <Button variant="outline" className="w-full rounded-full">Login</Button>
            </Link>
            <Link href={authNav.register.href} onClick={onClose}>
              <Button className="w-full rounded-full bg-ink-900 text-white hover:bg-ink-800">
                List Property
              </Button>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
