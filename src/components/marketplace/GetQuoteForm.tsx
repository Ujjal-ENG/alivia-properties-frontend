"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Loader2, SendHorizontal, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { quoteSchema, type QuoteFormValues } from "@/schemas/quote.schema"
import { quotesService } from "@/services/quotes.service"
import { ApiError } from "@/services/http-client"

export type QuoteContext = {
  supplierId?: string
  supplierName?: string
  productId?: string
  productName?: string
  categorySlug?: string
  categoryName?: string
}

type Props = {
  context?: QuoteContext
  /** Called on successful submit */
  onSuccess?: (quoteId: string) => void
  /** Show a header (used in dialog vs. standalone page contexts differently) */
  showHeader?: boolean
  /** When true, redirects to the thank-you page on success */
  redirectOnSuccess?: boolean
  className?: string
}

export function GetQuoteForm({
  context,
  onSuccess,
  showHeader = false,
  redirectOnSuccess = false,
  className,
}: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const [submitState, setSubmitState] = React.useState<
    | { status: "idle" }
    | { status: "submitting" }
    | { status: "success"; quoteId: string }
    | { status: "error"; message: string }
  >({ status: "idle" })

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      supplierId: context?.supplierId,
      productId: context?.productId,
      categorySlug: context?.categorySlug,
      name: "",
      email: "",
      phone: "",
      company: "",
      city: "",
      quantity: undefined,
      unit: "",
      budget: undefined,
      deliveryDate: "",
      message: "",
    },
  })

  // Keep hidden context fields in sync if props change
  React.useEffect(() => {
    if (context?.supplierId) form.setValue("supplierId", context.supplierId)
    if (context?.productId) form.setValue("productId", context.productId)
    if (context?.categorySlug) form.setValue("categorySlug", context.categorySlug)
  }, [context?.supplierId, context?.productId, context?.categorySlug, form])

  React.useEffect(() => {
    if (session?.user?.name && !form.getValues("name")) {
      form.setValue("name", session.user.name)
    }
    if (session?.user?.email && !form.getValues("email")) {
      form.setValue("email", session.user.email)
    }
  }, [form, session?.user?.email, session?.user?.name])

  async function onSubmit(values: QuoteFormValues) {
    setSubmitState({ status: "submitting" })
    try {
      // Strip empty-string optional fields
      const payload = {
        ...values,
        company: values.company || undefined,
        city: values.city || undefined,
        unit: values.unit || undefined,
        deliveryDate: values.deliveryDate || undefined,
        quantity:
          values.quantity === undefined || values.quantity === ("" as unknown)
            ? undefined
            : Number(values.quantity),
        budget:
          values.budget === undefined || values.budget === ("" as unknown)
            ? undefined
            : Number(values.budget),
      }

      const quote = await quotesService.create(payload, session?.accessToken)
      setSubmitState({ status: "success", quoteId: quote.id })
      form.reset({ ...form.getValues(), name: "", email: "", phone: "", company: "", city: "", quantity: undefined, unit: "", budget: undefined, deliveryDate: "", message: "" })

      if (redirectOnSuccess) {
        router.push(`/marketplace/quote/thank-you?id=${quote.id}`)
        return
      }
      onSuccess?.(quote.id)
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not submit your request. Please try again."
      setSubmitState({ status: "error", message })
    }
  }

  if (submitState.status === "success" && !redirectOnSuccess && !onSuccess) {
    return (
      <div className={className}>
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">Quote request sent</p>
            <p className="mt-1 text-sm text-green-800">
              Reference <span className="font-mono">{submitState.quoteId.slice(-8)}</span> — the
              supplier will contact you shortly. We&apos;ve also emailed a copy to {form.getValues("email") || "you"}.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setSubmitState({ status: "idle" })}
            >
              Submit another request
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const submitting = submitState.status === "submitting"

  return (
    <div className={className}>
      {showHeader && (
        <div className="mb-4 border-b border-border/60 pb-4">
          <p className="text-eyebrow mb-1">Request a Quote</p>
          <h2 className="font-heading text-xl font-semibold text-ink-900">
            {context?.productName
              ? `Get a quote for ${context.productName}`
              : context?.supplierName
                ? `Get a quote from ${context.supplierName}`
                : context?.categoryName
                  ? `Get a quote — ${context.categoryName}`
                  : "Get a Quote"}
          </h2>
          <p className="mt-1 text-sm text-ink-600">
            Share your requirement — verified suppliers usually reply within 24 hours.
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          {(context?.supplierName || context?.productName || context?.categoryName) && (
            <div className="rounded-lg border border-brand-100 bg-brand-50/60 px-3 py-2 text-xs text-brand-800">
              <span className="font-medium">Requesting from: </span>
              {[
                context?.productName,
                context?.supplierName,
                context?.categoryName,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Rahim Uddin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input placeholder="+8801712345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC Construction Ltd." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Dhaka" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="500"
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
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input placeholder="bags / sft / pcs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget (BDT)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="any"
                      placeholder="250000"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="deliveryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desired delivery / start date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ""} />
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
                <FormLabel>Requirement details *</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder="Tell us about your project, specs, delivery location, timeline…"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {submitState.status === "error" && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{submitState.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <SendHorizontal className="size-4" />
                  Submit Quote Request
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
