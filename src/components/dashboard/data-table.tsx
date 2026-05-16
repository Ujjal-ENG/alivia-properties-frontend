import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface DataTableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
  /** When true, this column is hidden from the stacked mobile card view. */
  hideOnMobile?: boolean
  /** When true, this column is rendered as the prominent title on the mobile card. */
  primaryOnMobile?: boolean
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  emptyMessage?: string
  className?: string
  rowKey?: (row: T, index: number) => string
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = "No records found.",
  className,
  rowKey,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "surface-card w-full max-w-full min-w-0 overflow-hidden",
        className,
      )}
    >
      {/* Desktop / tablet table */}
      <div className="hidden w-full max-w-full min-w-0 overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-linear-to-b from-ink-50 to-white/95 backdrop-blur-sm">
            <tr className="border-b border-border/70">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap px-4 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink-500",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-ink-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={rowKey ? rowKey(row, i) : i}
                  className={cn(
                    "group border-b border-border/50 transition-colors last:border-b-0",
                    i % 2 === 1 ? "bg-ink-50/40" : "bg-white",
                    "hover:bg-brand-50/50",
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3.5 align-middle", col.className)}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked card view */}
      <div className="divide-y divide-border/60 sm:hidden">
        {data.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-ink-500">
            {emptyMessage}
          </div>
        ) : (
          data.map((row, i) => {
            const primaryCol = columns.find((c) => c.primaryOnMobile) ?? columns[0]
            const restCols = columns.filter(
              (c) => c !== primaryCol && !c.hideOnMobile,
            )

            return (
              <div
                key={rowKey ? rowKey(row, i) : i}
                className="space-y-3 p-4"
              >
                <div>{primaryCol.render(row)}</div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  {restCols.map((col) => (
                    <div key={col.key} className="min-w-0">
                      <dt className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-ink-500">
                        {col.header}
                      </dt>
                      <dd className="mt-0.5 text-sm text-ink-800">
                        {col.render(row)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
