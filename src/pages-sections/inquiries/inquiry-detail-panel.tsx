"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquareReply,
  Phone,
} from "lucide-react"

import { InquiryStatusBadge } from "@/components/dashboard/inquiry-status-badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ROUTES } from "@/config/routes.config"
import { inquiriesService } from "@/services/inquiries.service"
import { ApiError } from "@/services/http-client"
import { formatDateTime } from "@/utils/format-date"
import type { Inquiry, InquiryStatus } from "@/types/inquiry.types"

const STATUS_OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "closed", label: "Closed" },
]

type InquiryDetailPanelProps = {
  inquiry: Inquiry
  token?: string
  role: "admin" | "seller" | "buyer"
  backHref: string
}

function subjectFor(inquiry: Inquiry) {
  return inquiry.propertyTitle ?? inquiry.projectName ?? "General inquiry"
}

function relatedHref(inquiry: Inquiry) {
  if (inquiry.propertySlug) return ROUTES.PROPERTY_DETAIL(inquiry.propertySlug)
  if (inquiry.projectSlug) return ROUTES.PROJECT_DETAIL(inquiry.projectSlug)
  return null
}

export function InquiryDetailPanel({
  inquiry,
  token,
  role,
  backHref,
}: InquiryDetailPanelProps) {
  const router = useRouter()
  const [current, setCurrent] = useState(inquiry)
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status)
  const [reply, setReply] = useState(inquiry.reply ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const canManage = role === "admin" || role === "seller"
  const related = relatedHref(current)

  async function save() {
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const updated = await inquiriesService.update(
        current.id,
        {
          status,
          reply: reply.trim() !== (current.reply ?? "").trim() ? reply.trim() : undefined,
        },
        token,
      )
      setCurrent(updated)
      setStatus(updated.status)
      setReply(updated.reply ?? reply)
      setSaved(true)
      router.refresh()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not update this inquiry.",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
      >
        <ArrowLeft className="size-4" />
        Back to inquiries
      </Link>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="surface-card overflow-hidden">
          <div className="border-b border-border/70 bg-ink-950 px-5 py-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">
                {current.type} inquiry
              </p>
              <InquiryStatusBadge status={current.status} />
            </div>
            <h1 className="mt-3 text-2xl font-semibold">{subjectFor(current)}</h1>
            <p className="mt-2 text-sm text-white/70">
              Received {formatDateTime(current.createdAt)}
            </p>
          </div>

          <div className="space-y-5 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1rem] border border-border bg-white p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-ink-400">From</p>
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

            <div className="rounded-[1rem] border border-border bg-white p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-ink-400">Message</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-700">
                {current.message}
              </p>
            </div>

            {current.reply ? (
              <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 p-5">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  <MessageSquareReply className="size-4" />
                  Latest reply
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-emerald-950">
                  {current.reply}
                </p>
                {current.repliedAt ? (
                  <p className="mt-3 text-xs text-emerald-700">
                    Sent {formatDateTime(current.repliedAt)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="surface-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
              Related record
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink-900">{subjectFor(current)}</h2>
            <p className="mt-2 text-sm capitalize text-ink-500">{current.type}</p>
            {related ? (
              <Link href={related}>
                <Button variant="outline" className="mt-4 w-full rounded-full">
                  <ExternalLink className="size-4" />
                  Open related page
                </Button>
              </Link>
            ) : null}
          </div>

          {canManage ? (
            <div className="surface-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                Seller action
              </p>

              <label className="mt-4 block text-sm font-medium text-ink-800" htmlFor="inquiry-status">
                Status
              </label>
              <select
                id="inquiry-status"
                value={status}
                onChange={(event) => setStatus(event.target.value as InquiryStatus)}
                className="mt-2 h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label className="mt-4 block text-sm font-medium text-ink-800" htmlFor="inquiry-reply">
                Reply note
              </label>
              <Textarea
                id="inquiry-reply"
                rows={7}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Write the seller reply or internal follow-up note..."
                className="mt-2"
              />

              {error ? (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
              {saved ? (
                <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="size-4" />
                  Inquiry updated
                </p>
              ) : null}

              <Button
                type="button"
                onClick={save}
                disabled={saving}
                className="mt-4 w-full rounded-full bg-brand-700 text-white hover:bg-brand-800"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <MessageSquareReply className="size-4" />}
                Save response
              </Button>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
