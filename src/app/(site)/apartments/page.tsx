export const dynamic = "force-dynamic"

import { Suspense } from "react"
import Link from "next/link"
import { getProjects } from "@/services/projects.service"
import { ProjectsInfiniteList } from "@/components/projects/projects-infinite-list"
import { ProjectFilterSidebar } from "@/components/projects/project-filter-sidebar"
import { SectionHeader } from "@/components/common/section-header"
import { EmptyState } from "@/components/common/empty-state"
import { Building2 } from "lucide-react"
import type { ProjectStatus } from "@/types/project.types"

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All",       value: "" },
  { label: "Ongoing",   value: "ongoing" },
  { label: "Upcoming",  value: "upcoming" },
  { label: "Completed", value: "completed" },
]

interface ProjectsPageProps {
  searchParams: Promise<{
    status?: string
    page?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    featured?: string
    sort?: string
  }>
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { status, page: rawPage, search, minPrice, maxPrice, featured, sort } = await searchParams
  const page = Math.max(1, Number(rawPage) || 1)

  const filters = {
    status: status as ProjectStatus | undefined,
    search: search || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    featured: featured === "true" || undefined,
    sort: sort || undefined,
  }

  const res = await getProjects({ ...filters, page, limit: 12 })

  const activeTags = [
    search && `Search: ${search}`,
    minPrice && `Min: ৳${(Number(minPrice) / 100000).toFixed(0)}L`,
    maxPrice && `Max: ৳${(Number(maxPrice) / 100000).toFixed(0)}L`,
    featured === "true" && "Flagship only",
  ].filter(Boolean) as string[]

  const listKey = JSON.stringify(filters)

  return (
    <div className="section-y">
      <div className="container-page">
        <SectionHeader
          eyebrow="Our Portfolio"
          title="Alivia Apartments"
          subtitle="Explore our premium residential and commercial developments across Bangladesh."
          align="left"
        />

        {/* Status filter */}
        <div className="mt-8 mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => {
              const isActive = (status ?? "") === tab.value
              const href = new URLSearchParams()
              if (tab.value) href.set("status", tab.value)
              return (
                <Link
                  key={tab.value}
                  href={tab.value ? `/apartments?${href.toString()}` : "/apartments"}
                  className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-600 text-white"
                      : "bg-white border border-border text-foreground hover:border-brand-300 hover:text-brand-700"
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>

          <p className="text-sm text-muted-foreground">
            {res.meta.total === 0 ? "0 projects" : `${res.meta.total} projects`}
          </p>
        </div>

        {activeTags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {activeTags.map((tag) => (
              <span key={tag} className="rounded-full border border-brand-100 bg-brand-50/70 px-3 py-1.5 text-xs font-medium text-brand-800">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full shrink-0 lg:w-80">
            <Suspense fallback={null}>
              <ProjectFilterSidebar />
            </Suspense>
          </div>

          <div className="min-w-0 flex-1">
            {res.data.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No projects found"
                description="No projects match the selected filters."
              />
            ) : (
              <ProjectsInfiniteList
                key={listKey}
                initialProjects={res.data}
                initialPage={res.meta.page}
                totalPages={res.meta.totalPages}
                filters={filters}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
