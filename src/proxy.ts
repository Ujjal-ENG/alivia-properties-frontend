import { auth } from "@/auth"
import { NextResponse } from "next/server"

const ROLE_PREFIXES: Record<string, string> = {
  "/admin":  "admin",
  "/seller": "seller",
  "/buyer":  "buyer",
}

export default auth((req) => {
  const { nextUrl, auth: session } = req
  // isLoggedIn = !!session && !session.error // DISABLED — session.error is no longer produced, see src/auth.ts header comment
  const isLoggedIn = !!session

  const matchedPrefix = Object.keys(ROLE_PREFIXES).find((p) =>
    nextUrl.pathname.startsWith(p),
  )
  if (!matchedPrefix) return NextResponse.next()

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  const requiredRole = ROLE_PREFIXES[matchedPrefix]
  if (session?.user?.role !== requiredRole) {
    return NextResponse.redirect(new URL("/unauthorized", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/buyer/:path*"],
}
