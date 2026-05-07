"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"

const schema = z.object({ email: z.string().email("Invalid email address") })
type Input = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const form = useForm<Input>({ resolver: zodResolver(schema) })

  async function onSubmit() {
    await new Promise((r) => setTimeout(r, 600))
    setSent(true)
  }

  return (
    <>
      <Link href={ROUTES.LOGIN} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your registered email and we&apos;ll send you a reset link.
        </p>
      </div>

      {sent ? (
        <div className="flex flex-col items-center py-6 text-center gap-3">
          <CheckCircle className="h-10 w-10 text-green-500" />
          <h3 className="font-bold">Check your inbox</h3>
          <p className="text-sm text-muted-foreground">
            If an account exists for that email, a reset link has been sent.
          </p>
          <Link href={ROUTES.LOGIN} className="text-sm text-brand-700 hover:underline mt-2">Return to Login</Link>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl><Input type="email" placeholder="you@example.com" {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Sending…" : "Send Reset Link"}
            </Button>
          </form>
        </Form>
      )}
    </>
  )
}
