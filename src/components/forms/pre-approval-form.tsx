"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { type Resolver, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"
import { formatPrice } from "@/utils/format-price"
import { banksService } from "@/services/banks.service"
import { preApprovalService } from "@/services/pre-approval.service"
import { ApiError } from "@/services/http-client"
import type { Bank } from "@/types/bank.types"

const EMPLOYMENT_TYPES = [
  { value: "salaried", label: "Salaried" },
  { value: "business-owner", label: "Business owner" },
  { value: "freelancer", label: "Freelancer" },
  { value: "government-service", label: "Government service" },
  { value: "expat", label: "Expat" },
  { value: "other", label: "Other" },
] as const

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(7, "Enter a valid phone number"),
  monthlyIncome: z.coerce.number().min(1, "Monthly income is required"),
  monthlyExpenses: z.coerce.number().min(0, "Expenses cannot be negative"),
  employmentType: z.enum(
    ["salaried", "business-owner", "freelancer", "government-service", "expat", "other"],
    "Select employment type",
  ),
  employerName: z.string().optional().default(""),
  yearsEmployed: z.coerce.number().min(0, "Years employed cannot be negative"),
  downPayment: z.coerce.number().min(0, "Down payment cannot be negative"),
  loanAmount: z.coerce.number().min(1, "Loan amount is required"),
  tenureYears: z.coerce.number().min(1).max(30),
  creditScore: z.coerce.number().min(300).max(900),
})

type FormValues = z.output<typeof schema>
type FormInput = {
  fullName: string
  email: string
  phone: string
  monthlyIncome: unknown
  monthlyExpenses: unknown
  employmentType: FormValues["employmentType"]
  employerName?: string
  yearsEmployed: unknown
  downPayment: unknown
  loanAmount: unknown
  tenureYears: unknown
  creditScore: unknown
}
type SubmissionResult = {
  approved: boolean
  approvedAmount?: number | null
  emi?: number | null
  dti?: number | null
}

export function PreApprovalForm() {
  const { data: session } = useSession()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<SubmissionResult | null>(null)
  const [banks, setBanks] = useState<Bank[]>([])

  const form = useForm<FormInput, undefined, FormValues>({
    resolver: zodResolver(schema) as Resolver<FormInput, undefined, FormValues>,
    defaultValues: {
      fullName: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
      phone: "",
      monthlyIncome: 150000,
      monthlyExpenses: 60000,
      employmentType: "salaried",
      employerName: "",
      yearsEmployed: 3,
      downPayment: 2500000,
      loanAmount: 9000000,
      tenureYears: 20,
      creditScore: 720,
    },
  })

  useEffect(() => {
    if (session?.user?.name) form.setValue("fullName", session.user.name)
    if (session?.user?.email) form.setValue("email", session.user.email)
  }, [form, session?.user?.email, session?.user?.name])

  useEffect(() => {
    void banksService.list().then(setBanks).catch(() => setBanks([]))
  }, [])

  const bestBank = useMemo(() => {
    if (banks.length === 0) return null
    return [...banks].sort((left, right) => left.interestRate - right.interestRate)[0]
  }, [banks])

  async function onSubmit(values: FormValues) {
    if (!session?.accessToken) {
      setSubmitError("Please sign in first so we can save your pre-approval request.")
      return
    }

    setSubmitError(null)

    try {
      const response = await preApprovalService.submit(
        {
          ...values,
          employerName: values.employerName || undefined,
          monthlyExpenses: values.monthlyExpenses || undefined,
          yearsEmployed: values.yearsEmployed || undefined,
          creditScore: values.creditScore || undefined,
        },
        session.accessToken,
      )

      setResult({
        approved: response.approved,
        approvedAmount: response.approvedAmount,
        emi: response.emi,
        dti: response.dti,
      })
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not submit your pre-approval request right now.",
      )
    }
  }

  return (
    <div className="space-y-5">
      {!session?.accessToken && (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
          Sign in to submit and save your pre-approval request.{" "}
          <Link href={ROUTES.LOGIN} className="font-semibold underline underline-offset-4">
            Go to login
          </Link>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="surface-card space-y-4 p-5">
          {submitError && (
            <div aria-live="polite" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} placeholder="+8801712345678" />
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
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="monthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly income (BDT) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthlyExpenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly expenses (BDT) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment type *</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
                      {EMPLOYMENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employer / business name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Optional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="yearsEmployed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years employed</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="loanAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan amount (BDT) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="downPayment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Down payment (BDT) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="tenureYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan tenure (years) *</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""}
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    >
                      {[10, 15, 20, 25, 30].map((year) => (
                        <option key={year} value={year}>{year} years</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="creditScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit score</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={300}
                      max={900}
                      {...field}
                      value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full rounded-full">
            {form.formState.isSubmitting ? "Checking eligibility…" : "Check Eligibility"}
          </Button>
        </form>
      </Form>

      {result && (
        <div className={`rounded-2xl border p-5 ${result.approved ? "border-brand-200 bg-brand-50" : "border-red-200 bg-red-50"}`}>
          <p className={`text-sm font-bold ${result.approved ? "text-brand-800" : "text-red-700"}`}>
            {result.approved ? "Pre-approved" : "Not eligible yet"}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.18em] text-ink-500">Approved amount</p>
              <p className="mt-1 text-base font-bold text-brand-700">
                {formatPrice(result.approvedAmount ?? 0, true)}
              </p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-[10px] uppercase tracking-[0.18em] text-ink-500">Estimated EMI</p>
              <p className="mt-1 text-base font-bold text-ink-900">
                {formatPrice(result.emi ?? 0, true)}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-white/80 px-4 py-3 text-sm text-ink-700">
            <p>DTI ratio: <span className="font-semibold">{((result.dti ?? 0) * 100).toFixed(1)}%</span></p>
            {bestBank && (
              <p className="mt-1">
                Best published rate right now: <span className="font-semibold">{bestBank.name}</span> at{" "}
                <span className="font-semibold">{bestBank.interestRate}%</span>.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
