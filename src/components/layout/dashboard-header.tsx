"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronRight,
  Home,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationsBell } from "@/components/layout/notifications-bell"
import { ROUTES } from "@/config/routes.config"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface DashboardHeaderProps {
  title: string
  breadcrumbs?: BreadcrumbItem[]
  onOpenNav?: () => void
}

export function DashboardHeader({
  title,
  breadcrumbs,
  onOpenNav,
}: DashboardHeaderProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user

  async function handleLogout() {
    await signOut({ redirect: false })
    router.push(ROUTES.LOGIN)
  }

  const initials =
    user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "U"

  return (
    <header className="sticky top-3 z-30">
      <div className="liquid-glass-nav flex min-h-17 items-center gap-3 rounded-[1.75rem] border px-3 py-2.5 sm:gap-4 sm:px-4">
        {onOpenNav && (
          <button
            type="button"
            onClick={onOpenNav}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-white text-ink-700 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 lg:hidden"
            aria-label="Open dashboard navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="mb-0.5 hidden items-center gap-1 text-[0.65rem] uppercase tracking-[0.18em] text-ink-500 sm:flex">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3 w-3" />}
                  <span
                    className={
                      i === breadcrumbs.length - 1
                        ? "text-brand-700"
                        : "text-ink-500"
                    }
                  >
                    {crumb.label}
                  </span>
                </span>
              ))}
            </nav>
          )}
          <h1 className="truncate text-base font-semibold text-foreground sm:text-lg">
            {title}
          </h1>
        </div>

        {/* Search (desktop) */}
        <label className="hidden h-10 w-44 shrink items-center gap-2 rounded-full border border-border/70 bg-white px-3 text-sm text-ink-500 transition-colors focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-200 lg:flex xl:w-64 2xl:w-72">
          <Search className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            type="search"
            placeholder="Search listings, users, inquiries…"
            className="w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
          />
          <kbd className="hidden rounded-md border border-border bg-ink-50 px-1.5 py-0.5 text-[0.65rem] font-medium text-ink-500 lg:inline-block">
            ⌘K
          </kbd>
        </label>

        {/* Search button (mobile / mid widths) */}
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-white text-ink-700 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 lg:hidden"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Back to home */}
        <Link
          href={ROUTES.HOME}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-white text-ink-700 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          title="Back to home"
          aria-label="Back to home"
        >
          <Home className="h-4 w-4" />
        </Link>

        {/* Notifications */}
        <NotificationsBell />

        {/* Avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2">
            <div className="flex h-10 items-center gap-2 rounded-full border border-border/80 bg-white px-1.5 pr-2 transition-colors hover:bg-brand-50 sm:gap-3 sm:pr-3">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
                <AvatarFallback className="bg-linear-to-br from-brand-600 to-brand-800 text-[0.65rem] font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden min-w-0 max-w-32 flex-col items-start text-left sm:flex">
                <span className="truncate text-xs font-semibold text-ink-900">
                  {user?.name ?? "Guest"}
                </span>
                <span className="truncate text-[0.65rem] uppercase tracking-[0.16em] text-ink-500">
                  {user?.role ?? "user"}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-2xl">
            <div className="px-2 py-2">
              <p className="truncate text-sm font-semibold text-ink-900">
                {user?.name ?? "Guest"}
              </p>
              <p className="truncate text-xs text-ink-500">{user?.email ?? ""}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 rounded-xl text-sm"
              onClick={() => router.push(ROUTES.ADMIN_SETTINGS)}
            >
              <User className="h-3.5 w-3.5" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 rounded-xl text-sm"
              onClick={() => router.push(ROUTES.ADMIN_SETTINGS)}
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 rounded-xl text-sm text-danger focus:text-danger"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
