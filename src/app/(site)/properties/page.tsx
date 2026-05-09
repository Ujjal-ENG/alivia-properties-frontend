export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { getProperties } from "@/services/properties.service"
import { PropertyCard } from "@/components/properties/property-card"
import { FilterSidebar } from "@/components/properties/filter-sidebar"
import { EmptyState } from "@/components/common/empty-state"
import { Home } from "lucide-react"
import { PropertiesToolbar } from "@/pages-sections/properties/properties-toolbar"
import { CompareFloatBar } from "@/components/properties/compare-float-bar"
import { PropertyPagination } from "@/pages-sections/properties/property-pagination"
import { RecentSearchRecorder } from "@/components/properties/recent-search-recorder"
import type { PropertyQueryParams } from "@/types/property.types"

interface PropertiesPageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const params = await searchParams
  const activeView = params.view === "list" ? "list" : "grid"

  const query: PropertyQueryParams = {
    search: params.search,
    purpose: params.purpose as PropertyQueryParams["purpose"],
    type: params.type as PropertyQueryParams["type"],
    division: params.division,
    district: params.district,
    area: params.area,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    bedrooms: params.bedrooms ? Number(params.bedrooms) : undefined,
    verified: params.verified === "true" || undefined,
    sortBy: params.sortBy as PropertyQueryParams["sortBy"],
    page: params.page ? Number(params.page) : 1,
    limit: 12,
  }

  const res = await getProperties(query)
  const { data: properties, meta } = res
  const activeTags = [
    params.search && `Search: ${params.search}`,
    params.purpose && `Purpose: ${params.purpose}`,
    params.type && `Type: ${params.type}`,
    params.division && `Division: ${params.division}`,
    params.district && `District: ${params.district}`,
    params.area && `Area: ${params.area}`,
    params.bedrooms && `${params.bedrooms}+ beds`,
    params.verified === "true" && "Verified only",
  ].filter(Boolean) as string[]
  const recentSearchValue = [
    params.search,
    params.purpose,
    params.type,
    params.area,
    params.district,
    params.division,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <>
      {recentSearchValue && <RecentSearchRecorder value={recentSearchValue} />}
      <div className="section-y pt-10">
        <div className="container-page">
          <div className="mb-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="eyebrow-pill">Property Directory</p>
              <h1 className="mt-4 text-h1 text-balance max-w-4xl">Scan Dhaka-area listings faster, without losing trust cues.</h1>
              <p className="mt-4 max-w-2xl text-lead">
                Compact listing view, live filters, verified signals, and API-ready mock data flowing through service layer.
              </p>
            </div>
            <div className="surface-card bg-brand-aurora p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Current view</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeTags.length > 0 ? activeTags.map((tag) => (
                  <span key={tag} className="rounded-full border border-brand-100 bg-white/85 px-3 py-1.5 text-xs font-medium text-ink-700">
                    {tag}
                  </span>
                )) : (
                  <span className="rounded-full border border-brand-100 bg-white/85 px-3 py-1.5 text-xs font-medium text-ink-700">
                    All listings
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="w-full shrink-0 lg:w-80">
              <Suspense fallback={null}>
                <FilterSidebar />
              </Suspense>
            </div>

            <div className="min-w-0 flex-1">
              <Suspense fallback={null}>
                <PropertiesToolbar total={meta?.total ?? 0} />
              </Suspense>

              {properties.length === 0 ? (
                <div className="mt-5">
                  <EmptyState
                    icon={Home}
                    title="No properties found"
                    description="Try adjusting your filters or search to find more results."
                  />
                </div>
              ) : (
                <div className={`mt-5 ${activeView === "list" ? "grid grid-cols-1 gap-5" : "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"}`}>
                  {properties.map((p) => (
                    <PropertyCard key={p.id} property={p} layout={activeView} />
                  ))}
                </div>
              )}

              {meta && meta.totalPages > 1 && (
                <Suspense fallback={null}>
                  <PropertyPagination page={meta.page} totalPages={meta.totalPages} />
                </Suspense>
              )}
            </div>
          </div>
        </div>
      </div>
      <CompareFloatBar />
    </>
  )
}
