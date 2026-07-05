export const dynamic = "force-dynamic"

import Link from "next/link"
import { getProjects } from "@/services/projects.service"
import { ProjectCard } from "@/components/projects/project-card"
import { ProjectsPagination } from "@/components/projects/projects-pagination"
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
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { status, page: rawPage } = await searchParams
  const page = Math.max(1, Number(rawPage) || 1)
  const res = await getProjects({
    status: status as ProjectStatus | undefined,
    page,
    limit: 12,
  })
  const start = res.meta.total === 0 ? 0 : (res.meta.page - 1) * res.meta.limit + 1
  const end = Math.min(res.meta.page * res.meta.limit, res.meta.total)

  return (
    <div className="section-y">
      <div className="container-page">
        <SectionHeader
          eyebrow="Our Portfolio"
          title="Alivia Projects"
          subtitle="Explore our premium residential and commercial developments across Bangladesh."
          align="left"
        />

        {/* Status filter */}
        <div className="mt-8 mb-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => {
              const isActive = (status ?? "") === tab.value
              return (
                <Link
                  key={tab.value}
                  href={tab.value ? `/projects?status=${tab.value}` : "/projects"}
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
            {res.meta.total === 0 ? "0 projects" : `Showing ${start}-${end} of ${res.meta.total}`}
          </p>
        </div>

        {res.data.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No projects found"
            description="No projects match the selected filter."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {res.data.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {res.meta.totalPages > 1 ? (
          <ProjectsPagination page={res.meta.page} totalPages={res.meta.totalPages} />
        ) : null}
      </div>
    </div>
  )
}
