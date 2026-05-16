"use client"

import { useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import type { DashboardNavItem } from "@/config/dashboard-nav.config"

interface DashboardShellProps {
  nav: DashboardNavItem[]
  children: React.ReactNode
  pendingCount?: number
  roleLabel: string
}

export function DashboardShell({
  nav,
  children,
  pendingCount = 0,
  roleLabel,
}: DashboardShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentItem = useMemo(
    () =>
      nav
        .filter(
          (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
        )
        .sort((a, b) => b.href.length - a.href.length)[0],
    [nav, pathname],
  )

  const title = currentItem?.label ?? "Dashboard"
  const breadcrumbs = [
    { label: roleLabel },
    ...(currentItem ? [{ label: currentItem.label }] : []),
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Fixed sidebar — does not scroll with content */}
      <DashboardSidebar nav={nav} pendingCount={pendingCount} roleLabel={roleLabel} />

      {/* Mobile sheet nav */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-80 max-w-[88vw] border-r-white/80 bg-white p-0 backdrop-blur-xl"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{roleLabel}</SheetTitle>
          </SheetHeader>
          <DashboardSidebar
            nav={nav}
            pendingCount={pendingCount}
            roleLabel={roleLabel}
            variant="mobile"
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Scrollable content area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-3 pt-3 sm:px-4 md:px-6">
        <DashboardHeader
          title={title}
          breadcrumbs={breadcrumbs}
          onOpenNav={() => setMobileOpen(true)}
          notificationCount={pendingCount}
        />
        <main className="mt-6 min-w-0 max-w-full flex-1 pb-8">{children}</main>
      </div>
    </div>
  )
}
