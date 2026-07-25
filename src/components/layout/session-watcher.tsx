// DISABLED — paired with the refresh-token flow that used to live in
// src/auth.ts (see the header comment there). This component forced a real
// sign-out whenever `session.error` was set, which no longer happens now
// that auth.ts just uses the access token as-is with no expiry/refresh
// logic. Kept here, fully commented, in case that flow is restored later.
//
// "use client"
//
// import { ROUTES } from "@/config/routes.config"
// import { useSession, signOut } from "next-auth/react"
// import { usePathname, useRouter } from "next/navigation"
// import { useEffect } from "react"
//
// export function SessionWatcher() {
//   const { data: session } = useSession()
//   const router = useRouter()
//   const pathname = usePathname()
//
//   useEffect(() => {
//     if (!session?.error) return
//     signOut({ redirect: false }).then(() => {
//       const loginUrl = new URL(ROUTES.LOGIN, window.location.origin)
//       if (pathname) loginUrl.searchParams.set("callbackUrl", pathname)
//       router.push(`${loginUrl.pathname}${loginUrl.search}`)
//     })
//   }, [session?.error, pathname, router])
//
//   return null
// }
