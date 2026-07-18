export const dynamic = "force-dynamic"

import Link from "next/link"
import { auth } from "@/auth"
import { BarChart3, Clock3, Eye, Home, MessageSquare } from "lucide-react"
import { getSellerStats } from "@/services/dashboard.service"
import { getInquiries } from "@/services/inquiries.service"
import { getProperties } from "@/services/properties.service"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table"
import { InquiryStatusBadge } from "@/components/dashboard/inquiry-status-badge"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { formatDateTime } from "@/utils/format-date"
import { formatPrice, formatRent } from "@/utils/format-price"
import { getCurrentSeller } from "@/utils/dashboard-session"
import type { Inquiry } from "@/types/inquiry.types"
import type { Property } from "@/types/property.types"

export default async function SellerDashboardPage() {
  const seller = await getCurrentSeller()
  const session = await auth()
  const emptyPage = { data: [], meta: { page: 1, limit: 6, total: 0, totalPages: 0 } }
  const [stats, inquiries, properties] = await Promise.all([
    getSellerStats(seller.id),
    getInquiries(),
    getProperties({ sellerId: seller.id, limit: 6 }, session?.accessToken).catch(() => emptyPage),
  ])

  const inquiryColumns: DataTableColumn<Inquiry>[] = [
    {
      key: "from",
      header: "From",
      render: (row) => (
        <div>
          <p className="font-semibold text-ink-900">{row.name}</p>
          <p className="text-xs text-ink-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (row) => row.propertyTitle ?? row.projectName ?? "General inquiry",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <InquiryStatusBadge status={row.status} />,
    },
    {
      key: "date",
      header: "Date",
      render: (row) => formatDateTime(row.createdAt),
    },
  ]

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Seller Dashboard"
        description="Track listing health, new buyer intent, and top-performing inventory."
        actions={(
          <Link href={ROUTES.SELLER_PROPERTY_CREATE}>
            <Button className="rounded-full bg-brand-700 text-white hover:bg-brand-800">
              Add Property
            </Button>
          </Link>
        )}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Home} label="My Listings" value={stats.totalListings} />
        <StatCard icon={BarChart3} label="Active Listings" value={stats.activeListings} />
        <StatCard icon={Clock3} label="Pending" value={stats.pendingListings} />
        <StatCard icon={MessageSquare} label="New Inquiries" value={`${stats.newInquiries}/${stats.totalInquiries}`} />
        <StatCard icon={Eye} label="Views" value={stats.totalViews} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="surface-panel mb-5 flex items-center justify-between gap-4 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-brand-700">Lead Queue</p>
              <h2 className="mt-2 text-h3">Recent Inquiries</h2>
            </div>
            <Link href={ROUTES.SELLER_INQUIRIES}>
              <Button variant="outline" className="rounded-full">Open All</Button>
            </Link>
          </div>
          <DataTable columns={inquiryColumns} data={inquiries.data.slice(0, 5)} />
        </div>

        <div className="surface-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-brand-700">Inventory</p>
              <h2 className="mt-2 text-h3">Recent Listings</h2>
            </div>
            <Link href={ROUTES.SELLER_PROPERTIES}>
              <Button variant="outline" className="rounded-full">Manage</Button>
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {properties.data.slice(0, 4).map((property: Property) => (
              <div key={property.id} className="rounded-[1rem] bg-ink-50 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-900">{property.title}</p>
                    <p className="mt-1 text-xs text-ink-500">
                      {property.area}, {property.district}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink-700">
                    {property.viewCount} views
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-brand-700">
                    {property.purpose === "rent" ? formatRent(property.price) : formatPrice(property.price, true)}
                  </span>
                  <Link href={ROUTES.SELLER_PROPERTY_EDIT(property.id)} className="inline-flex min-h-11 items-center text-xs font-semibold text-brand-700 hover:underline">
                    Edit Listing
                  </Link>
                </div>
              </div>
            ))}
            {properties.data.length === 0 && (
              <div className="rounded-[1rem] bg-ink-50 px-4 py-8 text-center text-sm text-ink-500">
                No listings yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
