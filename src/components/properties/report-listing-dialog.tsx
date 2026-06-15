"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { reportSchema, REPORT_REASONS, type ReportInput } from "@/schemas/report.schema"
import { ApiError } from "@/services/http-client"
import { inquiriesService } from "@/services/inquiries.service"

interface ReportListingDialogProps {
  propertyId: string
}

const DEFAULTS: ReportInput = {
  propertyId: "",
  reason: "Incorrect information",
  message: "",
  name: "",
  email: "",
  phone: "",
}

export function ReportListingDialog({ propertyId }: ReportListingDialogProps) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ReportInput>({
    resolver: zodResolver(reportSchema),
    defaultValues: { ...DEFAULTS, propertyId },
  })

  async function onSubmit(values: ReportInput) {
    setError(null)
    try {
      await inquiriesService.create(
        {
          type: "REPORT",
          propertyId: values.propertyId,
          name: values.name,
          email: values.email,
          // Report-specific reporter phone is optional; the inquiry contract
          // expects a string, so fall back to an empty value.
          phone: values.phone?.trim() ?? "",
          // The inquiry model has no `reason` column, so fold the selected reason
          // into the message. The admin reports view parses this prefix back out.
          message: `Reason: ${values.reason}\n\n${values.message.trim()}`,
        },
        session?.accessToken,
      )
      setSubmitted(true)
      setTimeout(() => {
        setOpen(false)
        setSubmitted(false)
        form.reset({ ...DEFAULTS, propertyId })
      }, 1800)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not submit this report right now. Please try again.",
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={(
          <Button variant="outline" className="w-full rounded-full border-red-200 text-red-700 hover:bg-red-50" />
        )}
      >
          <AlertTriangle className="h-4 w-4" />
          Report Listing
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report This Listing</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-6 text-center text-sm text-emerald-800">
            <CheckCircle2 className="mx-auto size-7 text-emerald-600" />
            <p className="mt-2 font-semibold">Report submitted</p>
            <p className="mt-1 text-emerald-700">
              Thanks for flagging this. The Alivia team will review the listing
              shortly.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-sm text-ink-500">
                Tell us what&apos;s wrong with this listing. Reports go straight
                to our moderation team — the seller is not notified of who
                reported it.
              </p>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full rounded-[1rem] border border-border bg-white px-3 py-2 text-sm">
                        {REPORT_REASONS.map((reason) => (
                          <option key={reason} value={reason}>{reason}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl><Input autoComplete="name" placeholder="Your name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" autoComplete="email" placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="01XXXXXXXXX"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Details</FormLabel>
                    <FormControl><Textarea rows={5} placeholder="Describe the problem clearly…" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error ? (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full rounded-full bg-ink-900 text-white hover:bg-ink-800" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting…" : "Submit Report"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
