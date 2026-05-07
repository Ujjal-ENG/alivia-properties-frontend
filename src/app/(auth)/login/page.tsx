import Link from "next/link"
import { ROUTES } from "@/config/routes.config"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your Alivia Properties account</p>
      </div>

      <LoginForm />

      <div className="mt-4 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href={ROUTES.REGISTER} className="text-brand-700 font-medium hover:underline">
          Register
        </Link>
      </div>
    </>
  )
}
