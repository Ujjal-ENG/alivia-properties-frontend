import { NotificationsList } from "@/components/notifications/notifications-list"
import { getNotifications } from "@/services/notifications.service"

export const dynamic = "force-dynamic"

export const metadata = { title: "Notifications — Alivia Properties" }

export default async function NotificationsPage() {
  const res = await getNotifications({ limit: 50 }).catch(() => null)
  const items = res?.data.items ?? []
  const unread = res?.data.unreadCount ?? 0

  return (
    <div className="section-y">
      <div className="container-page max-w-3xl">
        <NotificationsList initialItems={items} initialUnread={unread} />
      </div>
    </div>
  )
}
