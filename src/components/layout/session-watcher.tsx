"use client"

import { ROUTES } from "@/config/routes.config"
import { useSession, signOut } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

// Once the `jwt` callback in src/auth.ts flags a session as dead
// (RefreshAccessTokenError, or SessionExpired for non-"remember me" sessions
// past the 15-minute access-token window), this clears the broken cookie via
// a real sign-out instead of leaving the UI in a half-authenticated state
// where every API call 401s but the user still looks logged in.
export function SessionWatcher() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!session?.error) return
    signOut({ redirect: false }).then(() => {
      const loginUrl = new URL(ROUTES.LOGIN, window.location.origin)
      if (pathname) loginUrl.searchParams.set("callbackUrl", pathname)
      router.push(`${loginUrl.pathname}${loginUrl.search}`)
    })
  }, [session?.error, pathname, router])

  return null
}
