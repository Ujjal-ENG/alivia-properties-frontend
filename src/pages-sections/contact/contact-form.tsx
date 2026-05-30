"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { inquiriesService } from "@/services/inquiries.service"
import { ApiError } from "@/services/http-client"

export function ContactForm() {
  const { data: session } = useSession()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Capture the form node synchronously: after the `await` below, React has
    // finished dispatching the event and resets `e.currentTarget` to null.
    const form = e.currentTarget
    setSubmitting(true)
    setSubmitError(null)

    const formData = new FormData(form)
    const name = String(formData.get("name") ?? "").trim()
    const phone = String(formData.get("phone") ?? "").trim()
    const email = String(formData.get("email") ?? "").trim()
    const subject = String(formData.get("subject") ?? "").trim()
    const message = String(formData.get("message") ?? "").trim()

    try {
      await inquiriesService.create(
        {
          type: "GENERAL",
          name,
          phone,
          email,
          message: subject ? `${subject}\n\n${message}` : message,
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
            : "Could not send your message right now.",
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
        <h3 className="text-base font-bold text-ink-900">Message sent</h3>
        <p className="mt-1 text-sm text-ink-600">We&apos;ll get back to you within 24 hours.</p>
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
          <label htmlFor="contact-name" className="text-xs font-medium text-ink-700">Full Name *</label>
          <input id="contact-name" name="name" required className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="Your name" />
        </div>
        <div className="space-y-1">
          <label htmlFor="contact-phone" className="text-xs font-medium text-ink-700">Phone *</label>
          <input id="contact-phone" name="phone" required type="tel" className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="+8801712345678" />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="contact-email" className="text-xs font-medium text-ink-700">Email Address *</label>
        <input id="contact-email" name="email" required type="email" className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="you@example.com" />
      </div>

      <div className="space-y-1">
        <label htmlFor="contact-subject" className="text-xs font-medium text-ink-700">Subject *</label>
        <input id="contact-subject" name="subject" required className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="How can we help?" />
      </div>

      <div className="space-y-1">
        <label htmlFor="contact-message" className="text-xs font-medium text-ink-700">Message *</label>
        <textarea id="contact-message" name="message" required rows={5} className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="Tell us more about your inquiry…" />
      </div>

      <Button type="submit" className="w-full rounded-full" disabled={submitting}>
        {submitting ? "Sending…" : "Send Message"}
      </Button>
    </form>
  )
}
