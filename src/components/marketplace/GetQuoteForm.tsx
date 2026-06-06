"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useForm, useWatch } from "react-hook-form"
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
import { AttachmentUploader } from "@/components/marketplace/AttachmentUploader"
import type {
  CategoryAttribute,
  CategoryVariant,
  ProductVariant,
  SpecValue,
} from "@/types/marketplace.types"
import type { QuoteAttachment, QuoteSpec } from "@/types/quote.types"

export type QuoteContext = {
  supplierId?: string
  supplierName?: string
  productId?: string
  productName?: string
  variantId?: string
  variantName?: string
  /** Supplier product variants (when quoting a specific product). */
  variants?: ProductVariant[]
  categorySlug?: string
  categoryName?: string
  /** Admin-configured variants for the sub-category (RFQ-level quote). */
  categoryVariants?: CategoryVariant[]
  /** Admin-configured spec fields buyers fill in for the sub-category. */
  categoryAttributes?: CategoryAttribute[]
}

type Props = {
  context?: QuoteContext
  /** Called on successful submit (single-quote id, or batchId in batch mode) */
  onSuccess?: (quoteId: string) => void
  /** Show a header (used in dialog vs. standalone page contexts differently) */
  showHeader?: boolean
  /** When true, redirects to the thank-you page on success */
  redirectOnSuccess?: boolean
  /**
   * Batch mode (wizard): the selected supplier ids. When provided the form
   * submits to the batch endpoint (one quote per supplier; empty = match me).
   */
  supplierIds?: string[]
  mode?: "single" | "batch"
  /** Offer the file-attachment field (logged-in buyers only). Default true. */
  enableAttachments?: boolean
  className?: string
}

// Variant picker + dynamic spec fields are disabled for now — quote requests are
// kept to contact + requirement only and the support team follows up on variant /
// size / finish details after the quote is created. Flip to `true` to re-enable
// both the UI and the variant/spec payload.
const ENABLE_VARIANTS_SPECS = false

/** Compact summary of a product variant's generic spec values. */
function specDetail(specs?: SpecValue[] | null) {
  if (!specs?.length) return ""
  return specs
    .map((spec) => `${spec.value}${spec.unit ? ` ${spec.unit}` : ""}`)
    .filter(Boolean)
    .join(" / ")
}

type VariantOption = { id: string; name: string; unit?: string | null; detail?: string }

export function GetQuoteForm({
  context,
  onSuccess,
  showHeader = false,
  redirectOnSuccess = false,
  supplierIds,
  mode = "single",
  enableAttachments = true,
  className,
}: Props) {
  const { data: session } = useSession()
  const [submitState, setSubmitState] = React.useState<
    | { status: "idle" }
    | { status: "submitting" }
    | { status: "success"; quoteId: string; email: string }
    | { status: "error"; message: string }
  >({ status: "idle" })

  // Buyer answers to the sub-category's spec fields, keyed by attribute key.
  const [specValues, setSpecValues] = React.useState<Record<string, string>>({})
  const [specErrors, setSpecErrors] = React.useState<Record<string, boolean>>({})
  const [attachments, setAttachments] = React.useState<QuoteAttachment[]>([])

  // Spec fields + variant choices — disabled via ENABLE_VARIANTS_SPECS (see top).
  // When off, both arrays stay empty so nothing renders and nothing is sent.
  const attributes = ENABLE_VARIANTS_SPECS
    ? (context?.categoryAttributes ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : []

  // Variant choices: a specific product's variants take precedence; otherwise
  // the sub-category's admin-configured variants drive the picker.
  const variantOptions: VariantOption[] = !ENABLE_VARIANTS_SPECS
    ? []
    : context?.variants?.length
      ? context.variants
          .filter((v) => v.isActive !== false)
          .map((v) => ({ id: v.id, name: v.name, unit: v.unit, detail: specDetail(v.specs) }))
      : (context?.categoryVariants ?? [])
          .filter((v) => v.isActive !== false)
          .map((v) => ({ id: v.id, name: v.name, unit: v.unit, detail: v.description ?? "" }))

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      supplierId: context?.supplierId,
      productId: context?.productId,
      variantId: context?.variantId,
      categorySlug: context?.categorySlug,
      name: "",
      email: "",
      phone: "",
      company: "",
      city: "",
      deliveryLocation: "",
      quantity: undefined,
      unit: "",
      deliveryDate: "",
      message: "",
    },
  })

  // Keep hidden context fields in sync if props change
  React.useEffect(() => {
    if (context?.supplierId) form.setValue("supplierId", context.supplierId)
    if (context?.productId) form.setValue("productId", context.productId)
    if (context?.variantId) form.setValue("variantId", context.variantId)
    if (context?.categorySlug) form.setValue("categorySlug", context.categorySlug)
  }, [context?.supplierId, context?.productId, context?.variantId, context?.categorySlug, form])

  const selectedVariantId = useWatch({ control: form.control, name: "variantId" })
  const selectedVariant = variantOptions.find((v) => v.id === selectedVariantId)

  React.useEffect(() => {
    if (selectedVariant?.unit) form.setValue("unit", selectedVariant.unit)
  }, [form, selectedVariant?.unit])

  React.useEffect(() => {
    if (session?.user?.name && !form.getValues("name")) {
      form.setValue("name", session.user.name)
    }
    if (session?.user?.email && !form.getValues("email")) {
      form.setValue("email", session.user.email)
    }
  }, [form, session?.user?.email, session?.user?.name])

  function setSpec(key: string, value: string) {
    setSpecValues((prev) => ({ ...prev, [key]: value }))
    setSpecErrors((prev) => (prev[key] ? { ...prev, [key]: false } : prev))
  }

  async function onSubmit(values: QuoteFormValues) {
    if (variantOptions.length && !values.variantId) {
      form.setError("variantId", { message: "Select a variant" })
      return
    }

    // Required spec fields (mirrors backend validation)
    const missing: Record<string, boolean> = {}
    for (const attribute of attributes) {
      if (attribute.required && !(specValues[attribute.key] ?? "").trim()) {
        missing[attribute.key] = true
      }
    }
    if (Object.keys(missing).length) {
      setSpecErrors(missing)
      return
    }

    const specs: QuoteSpec[] = attributes
      .map((attribute) => ({
        key: attribute.key,
        label: attribute.label,
        value: (specValues[attribute.key] ?? "").trim(),
        unit: attribute.unit ?? undefined,
      }))
      .filter((spec) => spec.value !== "")

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
        specs: specs.length ? specs : undefined,
        attachments: attachments.length ? attachments : undefined,
      }

      const resetForm = () => {
        form.reset({ ...form.getValues(), name: "", email: "", phone: "", company: "", city: "", deliveryLocation: "", quantity: undefined, unit: "", deliveryDate: "", message: "" })
        setSpecValues({})
        setAttachments([])
      }

      if (mode === "batch") {
        // One quote per selected supplier (empty list = "let Alivia match me").
        // Drop the single-target fields — the batch DTO rejects them.
        const rest = { ...payload } as Record<string, unknown>
        delete rest.supplierId
        delete rest.productId
        const result = await quotesService.createBatch(
          { ...(rest as Omit<typeof payload, "supplierId" | "productId">), supplierIds: supplierIds ?? [] },
          session?.accessToken,
        )
        setSubmitState({ status: "success", quoteId: result.batchId, email: values.email })
        resetForm()
        if (redirectOnSuccess) {
          window.location.assign(
            `/marketplace/quote/thank-you?batch=${result.batchId}&count=${result.count}`,
          )
          return
        }
        onSuccess?.(result.batchId)
        return
      }

      const quote = await quotesService.create(payload, session?.accessToken)
      setSubmitState({ status: "success", quoteId: quote.id, email: values.email })
      resetForm()

      if (redirectOnSuccess) {
        window.location.assign(`/marketplace/quote/thank-you?id=${quote.id}`)
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

  if (submitState.status === "success" && !redirectOnSuccess) {
    return (
      <div className={className}>
        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">Quote request sent</p>
            <p className="mt-1 text-sm text-green-800">
              Reference <span className="font-mono">{submitState.quoteId.slice(-8)}</span> — the
              supplier will contact you shortly. We&apos;ve also emailed a copy to {submitState.email || "you"}.
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
  const selectedVariantName = context?.variantName ?? selectedVariant?.name

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
                selectedVariantName,
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

          {variantOptions.length > 0 && (
            <FormField
              control={form.control}
              name="variantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant *</FormLabel>
                  <FormControl>
                    <select
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <option value="">Select variant</option>
                      {variantOptions.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  {selectedVariant?.detail ? (
                    <p className="text-xs text-ink-500">{selectedVariant.detail}</p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Dynamic spec fields configured per sub-category by admin */}
          {attributes.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {attributes.map((attribute) => {
                const value = specValues[attribute.key] ?? ""
                const invalid = specErrors[attribute.key]
                const label = `${attribute.label}${attribute.unit ? ` (${attribute.unit})` : ""}${attribute.required ? " *" : ""}`
                return (
                  <div key={attribute.id} className="grid gap-1.5">
                    <label className="text-sm font-medium text-ink-800">{label}</label>
                    {attribute.type === "SELECT" ? (
                      <select
                        aria-label={attribute.label}
                        value={value}
                        onChange={(e) => setSpec(attribute.key, e.target.value)}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <option value="">Select…</option>
                        {(attribute.options ?? []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        aria-label={attribute.label}
                        type={attribute.type === "NUMBER" ? "number" : "text"}
                        value={value}
                        onChange={(e) => setSpec(attribute.key, e.target.value)}
                        placeholder={attribute.label}
                      />
                    )}
                    {invalid ? (
                      <p className="text-xs text-destructive">{attribute.label} is required</p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}

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

          <FormField
            control={form.control}
            name="deliveryLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery location *</FormLabel>
                <FormControl>
                  <Input placeholder="Road, area, city" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
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
                    <Input placeholder="bag / ton / CFT / sft" {...field} />
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
                <FormLabel>Product Description *</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
                    placeholder="Describe the product(s) you need — name, type, size, quantity, finish, brand, and any other details. Our team follows up to confirm specifics."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {enableAttachments && (
            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-ink-800">
                Attachments <span className="font-normal text-ink-500">(optional)</span>
              </label>
              <AttachmentUploader value={attachments} onChange={setAttachments} />
            </div>
          )}

          {submitState.status === "error" && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{submitState.message}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
            <Button type="button" disabled={submitting} onClick={form.handleSubmit(onSubmit)}>
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
