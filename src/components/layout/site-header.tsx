"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Building2,
  ChevronDown,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { cn } from "@/lib/utils";
import { publicNav, authNav, type NavItem } from "@/config/nav.config";
import { ROUTES } from "@/config/routes.config";
import { siteConfig } from "@/config/site.config";
import { getDashboardRoute } from "@/utils/auth-helpers";
import type { UserRole } from "@/types/user.types";

const HEADER_COLLAPSE_SCROLL_Y = 96;
const HEADER_EXPAND_SCROLL_Y = 24;

function getNavPath(href: string) {
  return href.split("?")[0];
}

function isNavItemActive(pathname: string, href: string) {
  const path = getNavPath(href);
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

function DropdownNav({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = isNavItemActive(pathname, item.href);
  const label = item.label;

  return (
    <div className="group/nav relative">
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-[0.9rem] px-3 py-2 text-[0.8rem] font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
          isActive
            ? "bg-brand-700 text-white shadow-sm"
            : "text-ink-600 hover:bg-white hover:text-ink-900",
        )}
      >
        {label}
        {item.children && (
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform duration-200 group-hover/nav:rotate-180",
              isActive ? "opacity-60" : "opacity-40",
            )}
          />
        )}
      </Link>

      {item.children && (
        <div className="invisible absolute left-0 top-full z-50 mt-2 w-56 translate-y-2 opacity-0 transition-[opacity,transform] duration-150 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100">
          {/* Arrow pointer */}
          <div className="ml-5 flex h-2.5 w-5 items-end overflow-hidden">
            <div className="h-3.5 w-3.5 rotate-45 rounded-xs border-l border-t border-black/6 bg-white shadow-sm" />
          </div>
          {/* Dropdown panel */}
          <div
            className="liquid-glass rounded-2xl border border-black/6 p-1.5"
            style={{ boxShadow: "var(--shadow-pop)" }}
          >
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block rounded-[0.8rem] px-4 py-2.5 text-[0.82rem] font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-800",
                  isNavItemActive(pathname, child.href) &&
                    "bg-brand-50 text-brand-800",
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    let isCollapsed = window.scrollY >= HEADER_COLLAPSE_SCROLL_Y;
    let frameId: number | null = null;

    // Sync the initial collapsed state from the real scroll position on mount
    // (window is unavailable during SSR). Intentional one-shot, not a cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScrolled(isCollapsed);

    const updateScrolledState = () => {
      frameId = null;

      const scrollY = window.scrollY;
      const shouldCollapse = isCollapsed
        ? scrollY > HEADER_EXPAND_SCROLL_Y
        : scrollY >= HEADER_COLLAPSE_SCROLL_Y;

      if (shouldCollapse !== isCollapsed) {
        isCollapsed = shouldCollapse;
        setScrolled(shouldCollapse);
      }
    };

    const handler = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateScrolledState);
      }
    };

    window.addEventListener("scroll", handler, { passive: true });

    return () => {
      window.removeEventListener("scroll", handler);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full [overflow-anchor:none]">
        {/* Top info strip */}
        <div
          className={cn(
            "overflow-hidden bg-linear-to-r from-brand-900 to-brand-800 transition-[max-height] duration-300 ease-in-out",
            scrolled ? "max-h-0" : "max-h-12",
          )}
        >
          <div className="mx-auto flex h-11 w-full max-w-400 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="hidden items-center gap-3 md:flex">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-400" />
              <span className="text-[0.67rem] font-semibold uppercase tracking-[0.18em] text-brand-200">
                RAJUK Registered Developer
              </span>
              <span className="h-3 w-px bg-brand-700" />
              <span className="text-[0.67rem] font-medium uppercase tracking-[0.15em] text-brand-400">
                Established 2011
              </span>
              <span className="h-3 w-px bg-brand-700" />
              <span className="text-[0.67rem] font-medium uppercase tracking-[0.15em] text-brand-400">
                Dhaka, Bangladesh
              </span>
            </div>

            <div className="ml-auto flex items-center gap-3 md:gap-4">
              {/* Partner CTAs — open a quick registration form (lands in admin).
                  Animated (sheen sweep + breathing glow + icon bob) to catch the
                  eye; all motion is disabled under prefers-reduced-motion. */}
              <Link
                href={ROUTES.BECOME_SUPPLIER}
                className="cta-pill-supplier group/sup relative hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-widest text-white transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 md:inline-flex"
              >
                <span
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
                  aria-hidden="true"
                >
                  <span className="cta-pill-sheen absolute inset-y-0 left-0 w-6 bg-linear-to-r from-transparent via-white/55 to-transparent" />
                </span>
                <Store className="cta-pill-icon relative h-3 w-3 transition-transform duration-200 group-hover/sup:scale-110" />
                <span className="relative">Be a Supplier</span>
              </Link>
              <Link
                href={ROUTES.BECOME_INVESTOR}
                className="cta-pill-investor group/inv relative hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-widest text-white transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 md:inline-flex"
              >
                <span
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
                  aria-hidden="true"
                >
                  <span className="cta-pill-sheen cta-pill-sheen--delayed absolute inset-y-0 left-0 w-6 bg-linear-to-r from-transparent via-white/55 to-transparent" />
                </span>
                <TrendingUp className="cta-pill-icon relative h-3 w-3 transition-transform duration-200 group-hover/inv:scale-110" />
                <span className="relative">Be an Investor</span>
              </Link>
              <Link
                href={ROUTES.MARKETPLACE}
                className="group/mp relative inline-flex min-h-11 items-center gap-1.5 overflow-hidden rounded-full bg-linear-to-r from-gold-500 to-gold-400 px-3 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand-950 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_4px_14px_rgba(229,176,79,0.45)] transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:from-gold-400 hover:to-gold-300 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_6px_20px_rgba(229,176,79,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
              >
                <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover/mp:translate-x-full" />
                <ShoppingBag className="h-3 w-3" />
                Marketplace
                <Sparkles className="h-3 w-3 animate-pulse text-brand-900" />
              </Link>
              {/* Phone: icon-only on small screens, full number from sm */}
              <a
                href={`tel:${siteConfig.contact.phoneRaw}`}
                aria-label={`Call ${siteConfig.contact.phone}`}
                className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full text-[0.75rem] text-brand-300 transition-colors hover:bg-white/10 hover:text-white sm:min-w-0 sm:px-2"
              >
                <Phone className="h-3 w-3" />
                <span className="hidden sm:inline">
                  {siteConfig.contact.phone}
                </span>
              </a>
              <a
                href={`https://wa.me/${siteConfig.contact.whatsApp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden min-h-11 items-center gap-1.5 rounded-full px-2 text-[0.75rem] text-brand-300 transition-colors hover:bg-white/10 hover:text-white sm:flex"
              >
                <MessageCircle className="h-3 w-3" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Main nav bar */}
        <div
          className={cn(
            "border-b border-white/30 bg-white/45 backdrop-blur-xl transition-shadow duration-300",
            scrolled && "shadow-sm",
          )}
        >
          <div className="mx-auto w-full max-w-400 px-4 py-2.5 sm:px-6 lg:px-8">
            <div
              className={cn(
                "liquid-glass-nav flex items-center justify-between gap-3 rounded-2xl border border-black/6 px-4 py-2.5 transition-shadow duration-300 md:px-5",
                scrolled ? "shadow-md" : "shadow-sm",
              )}
            >
              {/* Logo */}
              <Link
                href="/"
                className="flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center gap-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-linear-to-br from-brand-600 to-brand-900 shadow-sm">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div className="block min-w-0">
                  <span className="font-heading block truncate text-[0.95rem] font-semibold leading-tight tracking-tight text-brand-900 sm:text-[1.1rem]">
                    Alivia
                    <span className="text-gold-600"> Properties</span>
                  </span>
                  <span className="hidden text-[0.58rem] font-medium uppercase tracking-[0.16em] text-ink-500 sm:block">
                    Bangladesh Real Estate
                  </span>
                </div>
              </Link>

              {/* Desktop nav */}
              <div className="hidden min-w-0 flex-1 justify-center xl:flex">
                <nav
                  aria-label="Main navigation"
                  className="inline-flex items-center gap-0.5 rounded-[1.15rem] border border-ink-100/90 bg-ink-50/90 p-1"
                >
                  {publicNav.map((item) => (
                    <DropdownNav key={item.href} item={item} />
                  ))}
                </nav>
              </div>

              {/* Desktop CTAs */}
              <div className="hidden shrink-0 items-center gap-1.5 xl:flex">
                <Link href={ROUTES.CONSULTATION}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer rounded-full px-3 text-[0.8rem] text-ink-600 hover:bg-ink-100/70 hover:text-ink-900"
                  >
                    Consult Expert
                  </Button>
                </Link>

                <div className="mx-0.5 h-5 w-px bg-ink-200" />

                <Link href={ROUTES.MARKETPLACE}>
                  <Button
                    size="sm"
                    className="cursor-pointer gap-1.5 rounded-full bg-brand-700 px-5 text-[0.82rem] text-white hover:bg-brand-800"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Browse Marketplace
                  </Button>
                </Link>

                {session?.user?.role ? (
                  <Link href={getDashboardRoute(session.user.role as UserRole)}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer gap-1.5 rounded-full px-4 text-[0.82rem]"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href={authNav.login.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer rounded-full px-4 text-[0.82rem] text-ink-700 hover:bg-ink-100/70 hover:text-ink-900"
                      >
                        Login
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile right side */}
              <div className="flex items-center gap-2 xl:hidden">
                {!session && (
                  <Link href={ROUTES.MARKETPLACE} className="hidden sm:block">
                    <Button
                      size="sm"
                      className="cursor-pointer gap-1.5 rounded-full bg-brand-700 px-4 text-[0.82rem] text-white hover:bg-brand-800"
                    >
                      Marketplace
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
                <button
                  className="liquid-glass-control glass-interactive flex size-11 cursor-pointer items-center justify-center rounded-xl border border-ink-200 transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5 text-ink-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
