import { io, type Socket } from "socket.io-client"
import {
  toNotificationItem,
  type BackendNotification,
  type NotificationItem,
} from "./notifications.service"

type NotificationSocketEvents = {
  onNew?: (notification: NotificationItem) => void
  onRead?: (id: string) => void
  onReadAll?: () => void
  onReconnect?: () => void
}

function socketBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_SOCKET_URL?.replace(/\/$/, "")
  if (configured) return configured

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    "http://localhost:3001/api/v1"

  try {
    const url = new URL(apiBase)
    return url.origin
  } catch {
    return "http://localhost:3001"
  }
}

export function connectNotificationsSocket(
  token: string,
  events: NotificationSocketEvents,
): Socket {
  const socket = io(`${socketBaseUrl()}/notifications`, {
    auth: { token },
    withCredentials: true,
    reconnection: true,
  })

  socket.on("notification:new", (notification: BackendNotification) => {
    events.onNew?.(toNotificationItem(notification))
  })

  socket.on("notification:read", (payload: { id?: string }) => {
    if (payload.id) events.onRead?.(payload.id)
  })

  socket.on("notification:read_all", () => {
    events.onReadAll?.()
  })

  socket.io.on("reconnect", () => {
    events.onReconnect?.()
  })

  return socket
}
