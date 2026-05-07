"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle } from "lucide-react"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes.config"

const ROLES = ["seller", "buyer"] as const

const registerSchema = z
  .object({
    name:            z.string().min(2, "Name must be at least 2 characters"),
    email:           z.string().email("Invalid email address"),
    phone:           z.string().min(11, "Enter a valid phone number"),
    role:            z.enum(ROLES, "Select account type"),
    password:        z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterInput = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router   = useRouter()
  const [success, setSuccess] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "buyer" },
  })

  async function onSubmit() {
    // Dummy registration — in production, POST to /api/auth/register
    await new Promise((r) => setTimeout(r, 800))
    setSuccess(true)
    setTimeout(() => router.push(ROUTES.LOGIN), 2000)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
        <CheckCircle className="h-10 w-10 text-green-500" />
        <h3 className="font-bold">Account Created!</h3>
        <p className="text-sm text-muted-foreground">Redirecting you to login…</p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl><Input placeholder="Md. Rafiqul Islam" {...field} value={field.value ?? ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl><Input type="email" placeholder="you@example.com" {...field} value={field.value ?? ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl><Input placeholder="01700-000000" {...field} value={field.value ?? ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem>
            <FormLabel>Account Type</FormLabel>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                    field.value === r ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border hover:border-brand-300"
                  }`}
                >
                  <input type="radio" value={r} checked={field.value === r} onChange={() => field.onChange(r)} className="accent-brand-600" />
                  <div>
                    <p className="text-sm font-semibold capitalize">{r}</p>
                    <p className="text-xs text-muted-foreground">{r === "seller" ? "List properties" : "Find properties"}</p>
                  </div>
                </label>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input type="password" placeholder="Min 8 chars" {...field} value={field.value ?? ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="confirmPassword" render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl><Input type="password" placeholder="Repeat password" {...field} value={field.value ?? ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating account…" : "Create Account"}
        </Button>
      </form>
    </Form>
  )
}
