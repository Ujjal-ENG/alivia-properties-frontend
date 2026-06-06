"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Eye } from "lucide-react"

import { DataTable, type DataTableColumn } from "@/components/dashboard/data-table"
import { QuoteStatusBadge } from "@/components/dashboard/quote-status-badge"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { cn } from "@/lib/utils"
import type { QuoteRequest, QuoteStatus } from "@/types/quote.types"
import { formatDate } from "@/utils/format-date"

const STATUS_FILTERS: { value: QuoteStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "NEW", label: "New" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "NEGOTIATING", label: "Negotiating" },
  { value: "QUOTE_SENT", label: "Quote sent" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
  { value: "CLOSED", label: "Closed" },
]

function formatMoney(value?: number | null) {
  if (value == null) return "-"
  return `BDT ${value.toLocaleString("en-BD")}`
}

export function BuyerMarketplaceQuotesTable({ quotes }: { quotes: QuoteRequest[] }) {
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all")

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? quotes
        : quotes.filter((quote) => quote.status === statusFilter),
    [quotes, statusFilter],
  )

  const columns: DataTableColumn<QuoteRequest>[] = [
    {
      key: "request",
      header: "Request",
      primaryOnMobile: true,
      render: (quote) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-900">
            {quote.product?.name ?? quote.supplier?.name ?? quote.categorySlug ?? "General quote"}
          </p>
          <p className="mt-0.5 line-clamp-2 max-w-[26rem] text-xs text-ink-500">
            {quote.message}
          </p>
        </div>
      ),
    },
    {
      key: "supplier",
      header: "Supplier",
      render: (quote) =>
        quote.supplier ? (
          <Link
            href={ROUTES.MARKETPLACE_SUPPLIER(quote.supplier.slug)}
            className="text-xs font-medium text-brand-700 hover:text-brand-800"
          >
            {quote.supplier.name}
          </Link>
        ) : (
          <span className="text-xs text-ink-500">Marketplace team</span>
        ),
    },
    {
      key: "quantity",
      header: "Quantity",
      hideOnMobile: true,
      render: (quote) => (
        <div className="text-xs text-ink-700">
          <p className="font-medium">{formatMoney(quote.finalQuotedPrice)}</p>
          {quote.quantity ? (
            <p className="mt-0.5 text-ink-500">
              {quote.quantity} {quote.unit ?? "units"}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (quote) => <QuoteStatusBadge status={quote.status} />,
    },
    {
      key: "reply",
      header: "Latest reply",
      render: (quote) => (
        <span className="line-clamp-2 max-w-[18rem] text-xs text-ink-600">
          {quote.reply ?? "No reply yet"}
        </span>
      ),
    },
    {
      key: "created",
      header: "Submitted",
      hideOnMobile: true,
      render: (quote) => (
        <span className="text-xs text-ink-500">{formatDate(quote.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (quote) => (
        <Link href={ROUTES.BUYER_MARKETPLACE_QUOTE_DETAIL(quote.id)}>
          <Button size="sm" variant="outline" className="rounded-full">
            <Eye className="size-3.5" />
            View
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
              statusFilter === filter.value
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-border/70 bg-white text-ink-700 hover:bg-brand-50",
            )}
          >
            {filter.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-ink-500">
          {filtered.length} of {quotes.length}
        </span>
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(quote) => quote.id}
        emptyMessage="No marketplace quote requests yet."
      />
    </div>
  )
}
