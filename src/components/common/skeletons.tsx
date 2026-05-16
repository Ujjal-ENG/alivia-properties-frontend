import { cn } from "@/lib/utils"

// ─── Primitive ────────────────────────────────────────────────────────────────

export function Sk({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />
}

// ─── Dashboard header (eyebrow + title + description) ─────────────────────────

export function SkDashboardHeader() {
  return (
    <div className="surface-panel mb-6 p-5 sm:p-6">
      <Sk className="h-3 w-24" />
      <Sk className="mt-3 h-7 w-56" />
      <Sk className="mt-2 h-4 w-80 max-w-full" />
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

export function SkStatCard() {
  return (
    <div className="surface-card flex items-center justify-between p-5">
      <div className="space-y-2">
        <Sk className="h-3 w-28" />
        <Sk className="h-8 w-16" />
        <Sk className="h-3 w-20" />
      </div>
      <Sk className="h-12 w-12 rounded-2xl" />
    </div>
  )
}

export function SkStatGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => <SkStatCard key={i} />)}
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

export function SkTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 border-b border-border/60 px-4 py-3.5 last:border-0">
      <Sk className="h-10 w-10 shrink-0 rounded-xl" />
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <Sk key={i} className={cn("h-4", i === 0 ? "flex-1" : "w-20 shrink-0")} />
      ))}
    </div>
  )
}

export function SkTable({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="surface-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-border/60 p-4">
        <Sk className="h-8 w-24 rounded-full" />
        <Sk className="h-8 w-24 rounded-full" />
        <Sk className="ml-auto h-8 w-36 rounded-full" />
      </div>
      {/* Header */}
      <div className="flex items-center gap-4 bg-ink-50/60 px-4 py-2.5">
        {Array.from({ length: cols }).map((_, i) => (
          <Sk key={i} className={cn("h-3", i === 0 ? "flex-1" : "w-16 shrink-0")} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => <SkTableRow key={i} cols={cols} />)}
    </div>
  )
}

// ─── Property card ────────────────────────────────────────────────────────────

export function SkPropertyCard() {
  return (
    <div className="surface-card overflow-hidden">
      <Sk className="h-52 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Sk className="h-5 w-14 rounded-full" />
          <Sk className="h-5 w-20 rounded-full" />
        </div>
        <Sk className="h-5 w-4/5" />
        <Sk className="h-4 w-2/3" />
        <div className="flex gap-3 pt-1">
          <Sk className="h-4 w-16" />
          <Sk className="h-4 w-16" />
          <Sk className="h-4 w-16" />
        </div>
        <Sk className="mt-2 h-px w-full rounded-none" />
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Sk className="h-8 w-8 rounded-full" />
            <Sk className="h-4 w-24" />
          </div>
          <Sk className="h-4 w-12" />
        </div>
      </div>
    </div>
  )
}

export function SkPropertyGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => <SkPropertyCard key={i} />)}
    </div>
  )
}

// ─── Project card ─────────────────────────────────────────────────────────────

export function SkProjectCard() {
  return (
    <div className="surface-card overflow-hidden">
      <Sk className="h-56 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Sk className="h-5 w-14 rounded-full" />
        <Sk className="h-6 w-3/4" />
        <Sk className="h-4 w-full" />
        <Sk className="h-4 w-2/3" />
        <div className="flex gap-3 pt-1">
          <Sk className="h-4 w-20" />
          <Sk className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

// ─── Chart block ──────────────────────────────────────────────────────────────

export function SkChart({ className }: { className?: string }) {
  return (
    <div className={cn("surface-card p-5", className)}>
      <div className="space-y-1.5">
        <Sk className="h-3 w-20" />
        <Sk className="h-5 w-44" />
        <Sk className="h-3 w-36" />
      </div>
      <Sk className="mt-5 h-64 w-full" />
    </div>
  )
}

// ─── Profile 2-col ────────────────────────────────────────────────────────────

export function SkProfilePage({ leftRows = 3 }: { leftRows?: number }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      {/* Left identity card */}
      <div className="flex flex-col gap-4">
        <div className="surface-card flex flex-col items-center p-6">
          <Sk className="h-24 w-24 rounded-full" />
          <Sk className="mt-4 h-5 w-32" />
          <Sk className="mt-2 h-4 w-24" />
          <Sk className="mt-2 h-5 w-20 rounded-full" />
          <div className="mt-4 w-full space-y-2.5 border-t border-border/60 pt-4">
            {Array.from({ length: leftRows }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Sk className="h-4 w-4 rounded" />
                <Sk className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
        <div className="surface-card p-4 space-y-2.5">
          <Sk className="h-3 w-24" />
          {Array.from({ length: 3 }).map((_, i) => <Sk key={i} className="h-12 w-full rounded-[1rem]" />)}
        </div>
      </div>

      {/* Right form area */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, card) => (
          <div key={card} className="surface-card p-6 space-y-4">
            <Sk className="h-3 w-24" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Sk className="h-4 w-24" />
                  <Sk className="h-10 w-full rounded-[1rem]" />
                </div>
              ))}
            </div>
          </div>
        ))}
        <Sk className="h-10 w-32 rounded-full" />
      </div>
    </div>
  )
}

// ─── Admin dashboard ──────────────────────────────────────────────────────────

export function SkAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="surface-panel p-5 sm:p-7">
        <Sk className="h-3 w-32" />
        <Sk className="mt-3 h-8 w-64" />
        <Sk className="mt-2 h-4 w-96 max-w-full" />
      </div>

      {/* Stat grid */}
      <SkStatGrid count={8} />

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-card flex items-center gap-4 p-4">
            <Sk className="h-12 w-12 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-1.5">
              <Sk className="h-4 w-3/4" />
              <Sk className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <SkChart />
        <div className="grid gap-5">
          <SkChart />
          <div className="surface-card p-5 space-y-3">
            <Sk className="h-3 w-28" />
            <Sk className="h-5 w-40" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/60 px-4 py-3 space-y-1.5">
                <div className="flex justify-between">
                  <Sk className="h-4 w-40" />
                  <Sk className="h-3 w-16" />
                </div>
                <Sk className="h-3 w-56 max-w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second chart row */}
      <div className="grid gap-5 xl:grid-cols-2">
        <SkChart />
        <SkChart />
      </div>
    </div>
  )
}

// ─── Seller dashboard ─────────────────────────────────────────────────────────

export function SkSellerDashboard() {
  return (
    <div className="space-y-6">
      <SkStatGrid count={4} />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SkTable rows={4} cols={4} />
        <div className="space-y-3">
          <Sk className="h-5 w-36" />
          <SkPropertyGrid count={2} />
        </div>
      </div>
    </div>
  )
}

// ─── Buyer dashboard ──────────────────────────────────────────────────────────

export function SkBuyerDashboard() {
  return (
    <div className="space-y-6">
      <SkStatGrid count={4} />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Sk className="h-6 w-40" />
          <SkPropertyGrid count={3} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="surface-card p-5 space-y-3">
            <Sk className="h-3 w-24" />
            <div className="grid grid-cols-2 gap-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="surface-card flex flex-col items-center gap-2 p-4">
                  <Sk className="h-10 w-10 rounded-xl" />
                  <Sk className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
          <div className="surface-card p-5 space-y-3">
            <Sk className="h-3 w-28" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Sk key={i} className="h-7 w-24 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Site homepage ────────────────────────────────────────────────────────────

export function SkHomePage() {
  return (
    <div className="space-y-0">
      {/* Hero */}
      <div className="min-h-[520px] bg-brand-900 px-4 py-20">
        <div className="container-page space-y-6">
          <Sk className="h-5 w-32 rounded-full bg-white/10" />
          <Sk className="h-12 w-3/4 bg-white/10" />
          <Sk className="h-12 w-1/2 bg-white/10" />
          <Sk className="h-5 w-96 max-w-full bg-white/10" />
          <Sk className="h-14 w-full max-w-2xl rounded-2xl bg-white/10" />
        </div>
      </div>

      {/* Sections */}
      <div className="section-y container-page space-y-6">
        <Sk className="h-6 w-48" />
        <SkProjectGrid count={3} />
      </div>
      <div className="section-y container-page space-y-6 bg-ink-50">
        <Sk className="h-6 w-48" />
        <SkPropertyGrid count={6} />
      </div>
    </div>
  )
}

// ─── Project grid ─────────────────────────────────────────────────────────────

export function SkProjectGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => <SkProjectCard key={i} />)}
    </div>
  )
}

// ─── Property listing (sidebar + grid) ───────────────────────────────────────

export function SkPropertyListingPage() {
  return (
    <div className="container-page py-10">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <div className="surface-card h-fit p-5 space-y-4">
          <Sk className="h-5 w-28" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Sk className="h-4 w-20" />
              <Sk className="h-10 w-full rounded-[1rem]" />
            </div>
          ))}
          <Sk className="h-10 w-full rounded-full" />
        </div>
        {/* Grid */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Sk className="h-5 w-40" />
            <Sk className="h-9 w-32 rounded-full" />
          </div>
          <SkPropertyGrid count={6} />
        </div>
      </div>
    </div>
  )
}

// ─── Property / Project / Blog detail ────────────────────────────────────────

export function SkDetailPage() {
  return (
    <div className="container-page py-10 space-y-8">
      {/* Gallery */}
      <Sk className="h-96 w-full rounded-[1.5rem]" />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Content */}
        <div className="space-y-6">
          <div className="space-y-3">
            <Sk className="h-4 w-24 rounded-full" />
            <Sk className="h-8 w-3/4" />
            <Sk className="h-5 w-1/2" />
          </div>
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Sk key={i} className="h-8 w-24 rounded-full" />)}
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Sk className="h-4 w-full" />
              <Sk className="h-4 w-5/6" />
              <Sk className="h-4 w-4/5" />
            </div>
          ))}
        </div>
        {/* Sidebar card */}
        <div className="surface-card h-fit p-6 space-y-4">
          <Sk className="h-8 w-32" />
          <Sk className="h-4 w-40" />
          <Sk className="h-px w-full rounded-none" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Sk className="h-4 w-24" />
              <Sk className="h-4 w-20" />
            </div>
          ))}
          <Sk className="h-11 w-full rounded-full" />
          <Sk className="h-11 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}

// ─── Blog grid ────────────────────────────────────────────────────────────────

export function SkBlogCard() {
  return (
    <div className="surface-card overflow-hidden">
      <Sk className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <Sk className="h-5 w-20 rounded-full" />
          <Sk className="h-5 w-12 rounded-full" />
        </div>
        <Sk className="h-5 w-full" />
        <Sk className="h-5 w-4/5" />
        <Sk className="h-4 w-full" />
        <Sk className="h-4 w-3/4" />
        <div className="flex items-center gap-2 pt-1">
          <Sk className="h-8 w-8 rounded-full" />
          <Sk className="h-4 w-28" />
        </div>
      </div>
    </div>
  )
}

export function SkBlogGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => <SkBlogCard key={i} />)}
    </div>
  )
}

// ─── Auth form ────────────────────────────────────────────────────────────────

export function SkAuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-aurora p-4">
      <div className="surface-card w-full max-w-md p-8 space-y-5">
        <div className="space-y-2 text-center">
          <Sk className="mx-auto h-8 w-8 rounded-xl" />
          <Sk className="mx-auto h-6 w-40" />
          <Sk className="mx-auto h-4 w-56" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Sk className="h-4 w-20" />
            <Sk className="h-11 w-full rounded-[1rem]" />
          </div>
        ))}
        <Sk className="h-11 w-full rounded-full" />
        <Sk className="mx-auto h-4 w-48" />
      </div>
    </div>
  )
}

// ─── Simple content page (about, consultation, contact) ───────────────────────

export function SkContentPage() {
  return (
    <div className="container-page py-16 space-y-16">
      {Array.from({ length: 3 }).map((_, section) => (
        <div key={section} className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <Sk className="h-4 w-20 rounded-full" />
            <Sk className="h-8 w-3/4" />
            <Sk className="h-5 w-full" />
            <Sk className="h-5 w-5/6" />
            <Sk className="h-5 w-4/5" />
            <div className="flex gap-3 pt-2">
              <Sk className="h-11 w-36 rounded-full" />
              <Sk className="h-11 w-28 rounded-full" />
            </div>
          </div>
          <Sk className="h-72 rounded-[1.5rem]" />
        </div>
      ))}
    </div>
  )
}
