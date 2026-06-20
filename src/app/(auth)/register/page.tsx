import Link from "next/link"
import { ROUTES } from "@/config/routes.config"
import { RegisterForm } from "./register-form"

export default function RegisterPage() {
  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-1">Create an account</h1>
        <p className="text-sm text-muted-foreground">Join Alivia Properties to list or find your perfect property</p>
      </div>

      <RegisterForm />

      <div className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={ROUTES.LOGIN}
          className="inline-flex min-h-11 min-w-12 items-center font-medium text-brand-700 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </>
  )
}
