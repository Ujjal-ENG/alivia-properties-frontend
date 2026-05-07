"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getDashboardRoute } from "@/utils/auth-helpers"
import { ROUTES } from "@/config/routes.config"
import type { UserRole } from "@/types/user.types"

const loginSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})
type LoginInput = z.infer<typeof loginSchema>

const DEMO_USERS: { role: UserRole; label: string; email: string; password: string; color: string }[] = [
  { role: "admin",  label: "Admin",  email: "admin@aliviaproperties.com", password: "admin123",  color: "bg-purple-100 text-purple-700 border-purple-200" },
  { role: "seller", label: "Seller", email: "tanvir@example.com",         password: "seller123", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { role: "buyer",  label: "Buyer",  email: "rahim@example.com",          password: "buyer123",  color: "bg-green-100 text-green-700 border-green-200" },
]

export function LoginForm() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")
  const [showPass, setShowPass]  = useState(false)
  const [error, setError]        = useState<string | null>(null)

  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginInput) {
    setError(null)
    const result = await signIn("credentials", {
      email:    data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
      return
    }

    // Fetch updated session to get role for redirect
    const { getSession } = await import("next-auth/react")
    const session = await getSession()
    const role = session?.user?.role as UserRole | undefined
    const destination = callbackUrl ?? (role ? getDashboardRoute(role) : ROUTES.HOME)
    router.push(destination)
    router.refresh()
  }

  function fillDemo(email: string, password: string) {
    form.setValue("email", email)
    form.setValue("password", password)
  }

  return (
    <div className="space-y-5">
      {/* Demo quick-fill */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Quick demo login:</p>
        <div className="flex gap-2">
          {DEMO_USERS.map((u) => (
            <button
              key={u.role}
              type="button"
              onClick={() => fillDemo(u.email, u.password)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${u.color}`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl><Input type="email" placeholder="you@example.com" autoComplete="email" {...field} value={field.value ?? ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link href={ROUTES.FORGOT_PASSWORD} className="text-xs text-brand-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                    value={field.value ?? ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-700 text-white gap-2"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              "Signing in…"
            ) : (
              <><LogIn className="h-4 w-4" /> Sign In</>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
