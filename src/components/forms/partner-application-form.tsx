"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, CheckCircle2, Loader2, SendHorizontal } from "lucide-react"

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
import { inquiriesService } from "@/services/inquiries.service"
import { ApiError } from "@/services/http-client"
import {
  partnerApplicationSchema,
  type PartnerApplicationInput,
} from "@/schemas/partner.schema"

type PartnerType = "supplier" | "investor"

const COPY: Record<
  PartnerType,
  { purposeLabel: string; purposePlaceholder: string; detailsLabel: string; detailsPlaceholder: string }
> = {
  supplier: {
    purposeLabel: "What do you want to supply",
    purposePlaceholder: "e.g. Cement, tiles, steel, electrical fittings, services…",
    detailsLabel: "Details of your supply offering",
    detailsPlaceholder:
      "Tell us about your products / services, brands, monthly capacity, delivery areas, and any certifications.",
  },
  investor: {
    purposeLabel: "Purpose of investment",
    purposePlaceholder: "e.g. Apartment project, land, commercial space…",
    detailsLabel: "Details of your investment interest",
    detailsPlaceholder:
      "Tell us about your budget range, preferred locations, expected timeline, and what you're looking for.",
  },
}

export function PartnerApplicationForm({ type }: { type: PartnerType }) {
  const { data: session } = useSession()
  const copy = COPY[type]
  const [state, setState] = React.useState<
    | { status: "idle" }
    | { status: "submitting" }
    | { status: "success" }
    | { status: "error"; message: string }
  >({ status: "idle" })

  const form = useForm<PartnerApplicationInput>({
    resolver: zodResolver(partnerApplicationSchema),
    defaultValues: { name: "", email: "", phone: "", organization: "", purpose: "", details: "" },
  })

  // Prefill from session when available
  React.useEffect(() => {
    if (session?.user?.name && !form.getValues("name")) form.setValue("name", session.user.name)
    if (session?.user?.email && !form.getValues("email")) form.setValue("email", session.user.email)
  }, [form, session?.user?.email, session?.user?.name])

  async function onSubmit(values: PartnerApplicationInput) {
    const message = [
      values.organization ? `Organization: ${values.organization}` : null,
      `Purpose: ${values.purpose}`,
      "",
      values.details,
    ]
      .filter((line) => line !== null)
      .join("\n")

    setState({ status: "submitting" })
    try {
      await inquiriesService.create(
        {
          type: type.toUpperCase(),
          name: values.name,
          email: values.email,
          phone: values.phone,
          message,
        },
        session?.accessToken,
      )
      setState({ status: "success" })
      form.reset()
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not submit your application. Please try again."
      setState({ status: "error", message: msg })
    }
  }

  if (state.status === "success") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-5 text-green-900">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-medium">Application received</p>
          <p className="mt-1 text-sm text-green-800">
            Thanks! Our team will review your {type} application and reach out shortly.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setState({ status: "idle" })}
          >
            Submit another
          </Button>
        </div>
      </div>
    )
  }

  const submitting = state.status === "submitting"

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
                <FormLabel>Mobile *</FormLabel>
                <FormControl>
                  <Input placeholder="+8801712345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company / Organization</FormLabel>
                <FormControl>
                  <Input placeholder="ABC Trading Ltd. (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.purposeLabel} *</FormLabel>
              <FormControl>
                <Input placeholder={copy.purposePlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.detailsLabel} *</FormLabel>
              <FormControl>
                <Textarea rows={5} placeholder={copy.detailsPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {state.status === "error" && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{state.message}</span>
          </div>
        )}

        <div className="flex justify-end border-t border-border/60 pt-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <SendHorizontal className="size-4" />
                Submit application
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
