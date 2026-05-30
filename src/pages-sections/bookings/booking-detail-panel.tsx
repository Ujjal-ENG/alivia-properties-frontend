"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  Phone,
  XCircle,
} from "lucide-react"

import { BookingStatusBadge } from "@/components/dashboard/booking-status-badge"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { ApiError } from "@/services/http-client"
import { bookingsService } from "@/services/bookings.service"
import type { Booking, BookingStatus } from "@/types/booking.types"
import { formatDate, formatDateTime } from "@/utils/format-date"

type BookingDetailPanelProps = {
  booking: Booking
  token?: string
  backHref: string
}

type BookingAction = "confirm" | "cancel" | "complete"

function consultationLabel(type: Booking["consultationType"]) {
  return type.replace(/-/g, " ")
}

function relatedTitle(booking: Booking) {
  return booking.propertyTitle ?? booking.projectName ?? "General consultation"
}

function relatedHref(booking: Booking) {
  if (booking.propertySlug) return ROUTES.PROPERTY_DETAIL(booking.propertySlug)
  if (booking.projectSlug) return ROUTES.PROJECT_DETAIL(booking.projectSlug)
  return null
}

export function BookingDetailPanel({ booking, token, backHref }: BookingDetailPanelProps) {
  const router = useRouter()
  const [current, setCurrent] = useState(booking)
  const [savingAction, setSavingAction] = useState<BookingAction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const related = relatedHref(current)

  async function runAction(action: BookingAction) {
    setSavingAction(action)
    setError(null)
    setSaved(null)

    try {
      const updated =
        action === "confirm"
          ? await bookingsService.confirm(current.id, token)
          : action === "cancel"
            ? await bookingsService.cancel(current.id, token)
            : await bookingsService.complete(current.id, token)

      setCurrent({
        ...current,
        ...updated,
        propertyTitle: updated.propertyTitle ?? current.propertyTitle,
        propertySlug: updated.propertySlug ?? current.propertySlug,
        projectName: updated.projectName ?? current.projectName,
        projectSlug: updated.projectSlug ?? current.projectSlug,
      })
      setSaved(`Booking ${action === "complete" ? "completed" : `${action}ed`}.`)
      router.refresh()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not update this booking.",
      )
    } finally {
      setSavingAction(null)
    }
  }

  function canMoveTo(status: BookingStatus) {
    if (current.status === "cancelled" || current.status === "completed") return false
    return current.status !== status
  }

  return (
    <div className="space-y-5">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
      >
        <ArrowLeft className="size-4" />
        Back to bookings
      </Link>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="surface-card overflow-hidden">
          <div className="border-b border-border/70 bg-ink-950 px-5 py-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">
                {consultationLabel(current.consultationType)} booking
              </p>
              <BookingStatusBadge status={current.status} />
            </div>
            <h1 className="mt-3 text-2xl font-semibold">{relatedTitle(current)}</h1>
            <p className="mt-2 text-sm text-white/70">
              Submitted {formatDateTime(current.createdAt)}
            </p>
          </div>

          <div className="space-y-5 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1rem] border border-border bg-white p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-ink-400">Client</p>
                <p className="mt-2 font-semibold text-ink-900">{current.name}</p>
              </div>
              <a
                href={`mailto:${current.email}`}
                className="rounded-[1rem] border border-border bg-white p-4 transition-colors hover:border-brand-200 hover:bg-brand-50"
              >
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-400">
                  <Mail className="size-3.5" />
                  Email
                </p>
                <p className="mt-2 truncate font-semibold text-ink-900">{current.email}</p>
              </a>
              <a
                href={`tel:${current.phone}`}
                className="rounded-[1rem] border border-border bg-white p-4 transition-colors hover:border-brand-200 hover:bg-brand-50"
              >
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-400">
                  <Phone className="size-3.5" />
                  Phone
                </p>
                <p className="mt-2 font-semibold text-ink-900">{current.phone}</p>
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1rem] border border-border bg-white p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-400">
                  <CalendarDays className="size-3.5" />
                  Preferred date
                </p>
                <p className="mt-2 font-semibold text-ink-900">{formatDate(current.preferredDate)}</p>
              </div>
              <div className="rounded-[1rem] border border-border bg-white p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-ink-400">Preferred time</p>
                <p className="mt-2 font-semibold text-ink-900">{current.preferredTime}</p>
              </div>
              <div className="rounded-[1rem] border border-border bg-white p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-ink-400">Related record</p>
                <p className="mt-2 truncate font-semibold text-ink-900">{relatedTitle(current)}</p>
              </div>
            </div>

            <div className="rounded-[1rem] border border-border bg-white p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-ink-400">Message</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-700">
                {current.message?.trim() || "No message was added for this booking."}
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="surface-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
              Booking lifecycle
            </p>
            <div className="mt-4 space-y-2 text-sm text-ink-600">
              <p>Created: {formatDateTime(current.createdAt)}</p>
              {current.confirmedAt ? <p>Confirmed: {formatDateTime(current.confirmedAt)}</p> : null}
              {current.cancelledAt ? <p>Cancelled: {formatDateTime(current.cancelledAt)}</p> : null}
              {current.completedAt ? <p>Completed: {formatDateTime(current.completedAt)}</p> : null}
            </div>
            {related ? (
              <Link href={related}>
                <Button variant="outline" className="mt-4 w-full rounded-full">
                  <ExternalLink className="size-4" />
                  Open related page
                </Button>
              </Link>
            ) : null}
          </div>

          <div className="surface-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
              Admin actions
            </p>
            <div className="mt-4 grid gap-2">
              <Button
                className="rounded-full"
                disabled={!canMoveTo("confirmed") || savingAction !== null}
                onClick={() => runAction("confirm")}
              >
                {savingAction === "confirm" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Confirm booking
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                disabled={!canMoveTo("completed") || current.status !== "confirmed" || savingAction !== null}
                onClick={() => runAction("complete")}
              >
                {savingAction === "complete" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                Mark completed
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-red-200 text-red-700 hover:bg-red-50"
                disabled={!canMoveTo("cancelled") || savingAction !== null}
                onClick={() => runAction("cancel")}
              >
                {savingAction === "cancel" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <XCircle className="size-4" />
                )}
                Cancel booking
              </Button>
            </div>

            {saved ? <p className="mt-3 text-sm font-medium text-emerald-700">{saved}</p> : null}
            {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
          </div>
        </aside>
      </div>
    </div>
  )
}
