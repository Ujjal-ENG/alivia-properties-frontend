import Link from "next/link"
import { Bell } from "lucide-react"
import { getNotifications } from "@/services/notifications.service"
import { formatRelative } from "@/utils/format-date"

export const dynamic = "force-dynamic"

export const metadata = { title: "Notifications — Alivia Properties" }

export default async function NotificationsPage() {
  const res = await getNotifications({ limit: 50 }).catch(() => null)
  const items = res?.data.items ?? []
  const unread = res?.data.unreadCount ?? 0

  return (
    <div className="section-y">
      <div className="container-page max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-eyebrow mb-1">Activity</p>
            <h1 className="text-h2">Notifications</h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800">
            <Bell className="h-3 w-3" /> {unread} unread
          </span>
        </div>
        <ul className="surface-card divide-y divide-border/60 overflow-hidden">
          {items.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-ink-500">No notifications yet.</li>
          )}
          {items.map(n => {
            const Inner = (
              <div className="flex items-start gap-3 px-4 py-3 hover:bg-ink-50">
                <span className={`mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full ${n.isRead ? "bg-transparent" : "bg-brand-600"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-900">{n.title}</p>
                  <p className="text-[12px] text-ink-700">{n.body}</p>
                  <p className="mt-0.5 text-[11px] text-ink-500">{formatRelative(n.createdAt)}</p>
                </div>
              </div>
            )
            return (
              <li key={n.id} className={n.isRead ? "" : "bg-brand-50/30"}>
                {n.link ? <Link href={n.link}>{Inner}</Link> : Inner}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
