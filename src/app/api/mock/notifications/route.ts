import { type NextRequest } from "next/server"
import { ok, badRequest } from "@/app/api/_utils/api-response"
import { paginateArray } from "@/app/api/_utils/pagination"
import { DUMMY_NOTIFICATIONS } from "@/data/dummy-notifications"
import type { NotificationItem } from "@/types/notification.types"

const ntfStore: NotificationItem[] = [...DUMMY_NOTIFICATIONS]

export async function GET(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 100))
  const sp = request.nextUrl.searchParams
  const userId = sp.get("userId")
  if (!userId) return badRequest("userId required")
  const unreadOnly = sp.get("unreadOnly") === "true"
  const page = Number(sp.get("page") ?? 1)
  const limit = Number(sp.get("limit") ?? 20)

  let list = ntfStore.filter(n => n.userId === userId)
  if (unreadOnly) list = list.filter(n => !n.isRead)
  list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

  const { data, meta } = paginateArray(list, page, limit)
  const unread = ntfStore.filter(n => n.userId === userId && !n.isRead).length
  return ok({ items: data, unreadCount: unread }, "Notifications fetched", meta)
}

export async function PATCH(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 80))
  const body = await request.json().catch(() => ({}))
  const id: string | undefined = body?.id
  const markAll: boolean = body?.markAllRead === true
  const userId: string | undefined = body?.userId

  if (markAll && userId) {
    ntfStore.filter(n => n.userId === userId).forEach(n => (n.isRead = true))
    return ok({ ok: true }, "All marked read")
  }
  if (id) {
    const n = ntfStore.find(x => x.id === id)
    if (!n) return badRequest("Not found")
    n.isRead = true
    return ok(n, "Marked read")
  }
  return badRequest("Provide id or markAllRead+userId")
}
