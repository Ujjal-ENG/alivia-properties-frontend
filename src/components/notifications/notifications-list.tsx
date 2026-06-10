"use client";

import { Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  notificationsService,
  type NotificationItem,
} from "@/services/notifications.service";
import { connectNotificationsSocket } from "@/services/notifications.socket";
import { formatRelative } from "@/utils/format-date";

type NotificationsListProps = {
  initialItems: NotificationItem[];
  initialUnread: number;
};

export function NotificationsList({
  initialItems,
  initialUnread,
}: NotificationsListProps) {
  const { data: session } = useSession();

  const token = session?.accessToken;
  const [items, setItems] = useState(initialItems);
  const [unread, setUnread] = useState(initialUnread);
  const knownIds = useRef(new Set(initialItems.map((item) => item.id)));

  const load = useCallback(async () => {
    if (!token) return;
    const res = await notificationsService.list({ limit: 50 }, token);
    knownIds.current = new Set(res.items.map((item) => item.id));
    setItems(res.items);
    setUnread(res.unreadCount);
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const socket = connectNotificationsSocket(token, {
      onNew(notification) {
        if (knownIds.current.has(notification.id)) return;
        knownIds.current.add(notification.id);
        setItems((prev) => [notification, ...prev].slice(0, 50));
        if (!notification.isRead) {
          setUnread((count) => count + 1);
        }
      },
      onRead(id) {
        setItems((prev) =>
          prev.map((x) => (x.id === id ? { ...x, isRead: true } : x)),
        );
      },
      onReadAll() {
        setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
        setUnread(0);
      },
      onReconnect() {
        void load();
      },
    });

    return () => {
      socket.disconnect();
    };
  }, [load, token]);

  return (
    <>
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
          <li className="px-4 py-10 text-center text-sm text-ink-500">
            No notifications yet.
          </li>
        )}
        {items.map((n) => {
          const inner = (
            <div className="flex items-start gap-3 px-4 py-3 hover:bg-ink-50">
              <span
                className={`mt-1 inline-block h-1.5 w-1.5 flex-none rounded-full ${n.isRead ? "bg-transparent" : "bg-brand-600"}`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-900">{n.title}</p>
                <p className="text-[12px] text-ink-700">{n.body}</p>
                <p className="mt-0.5 text-[11px] text-ink-500">
                  {formatRelative(n.createdAt)}
                </p>
              </div>
            </div>
          );

          return (
            <li key={n.id} className={n.isRead ? "" : "bg-brand-50/30"}>
              {n.link ? <Link href={n.link}>{inner}</Link> : inner}
            </li>
          );
        })}
      </ul>
    </>
  );
}
