"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { AdminFormNotice } from "@/components/common/admin-form-notice"
import { ROUTES } from "@/config/routes.config"
import { bookingsService } from "@/services/bookings.service"
import { ApiError } from "@/services/http-client"

const CONSULTATION_TYPES = [
  { value: "BUYING", label: "Buying a property" },
  { value: "INVESTMENT", label: "Investment advice" },
  { value: "PROJECT_SPECIFIC", label: "Apartment inquiry" },
  { value: "SITE_VISIT", label: "Site visit request" },
] as const

const TIME_SLOTS = ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"]

export function ConsultationForm() {
  const { data: session } = useSession()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Admins receive these consultation bookings — they manage them from the
  // dashboard rather than submitting the public form themselves.
  if (session?.user?.role === "admin") {
    return <AdminFormNotice manageHref={ROUTES.ADMIN_BOOKINGS} />
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Capture the form node synchronously: after the `await` below, React has
    // finished dispatching the event and resets `e.currentTarget` to null.
    const form = e.currentTarget
    setSubmitting(true)
    setSubmitError(null)

    const formData = new FormData(form)

    try {
      await bookingsService.create(
        {
          consultationType: String(formData.get("consultationType")),
          name: String(formData.get("name") ?? "").trim(),
          phone: String(formData.get("phone") ?? "").trim(),
          email: String(formData.get("email") ?? "").trim(),
          preferredDate: String(formData.get("preferredDate") ?? ""),
          preferredTime: String(formData.get("preferredTime") ?? ""),
          message: String(formData.get("message") ?? "").trim() || undefined,
        },
        session?.accessToken,
      )
      setSubmitted(true)
      form.reset()
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not book the consultation right now.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl bg-brand-50 p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
          <svg className="h-6 w-6 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-ink-900">Booking received</h3>
        <p className="mt-1 text-sm text-ink-600">Our team will confirm within 2 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && (
        <div aria-live="polite" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="consult-name" className="text-xs font-medium text-ink-700">Full Name *</label>
          <input id="consult-name" name="name" required className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="Your name" />
        </div>
        <div className="space-y-1">
          <label htmlFor="consult-phone" className="text-xs font-medium text-ink-700">Phone *</label>
          <input id="consult-phone" name="phone" required type="tel" className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="+8801712345678" />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="consult-email" className="text-xs font-medium text-ink-700">Email *</label>
        <input id="consult-email" name="email" required type="email" className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="you@example.com" />
      </div>

      <div className="space-y-1">
        <label htmlFor="consult-type" className="text-xs font-medium text-ink-700">Consultation type *</label>
        <select id="consult-type" name="consultationType" required className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
          <option value="">Select type…</option>
          {CONSULTATION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="consult-date" className="text-xs font-medium text-ink-700">Preferred date *</label>
          <input id="consult-date" name="preferredDate" required type="date" className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
        </div>
        <div className="space-y-1">
          <label htmlFor="consult-time" className="text-xs font-medium text-ink-700">Preferred time *</label>
          <select id="consult-time" name="preferredTime" required className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
            <option value="">Select time…</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="consult-message" className="text-xs font-medium text-ink-700">Message</label>
        <textarea id="consult-message" name="message" rows={3} className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="Any specific apartments, areas, or requirements…" />
      </div>

      <Button type="submit" className="w-full rounded-full" disabled={submitting}>
        {submitting ? "Booking…" : "Book Free Consultation"}
      </Button>
    </form>
  )
}
