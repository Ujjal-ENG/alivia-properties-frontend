import { auth } from "@/auth"
import { getMe } from "@/services/users.service"
import { notFound } from "next/navigation"
import type { Buyer, Seller } from "@/types/user.types"

// proxy.ts already redirects unauthenticated / wrong-role requests before these
// functions run. We fall back to the Auth.js session when the backend is
// unavailable so dashboard pages render without the NestJS backend running.

export async function getCurrentSeller(): Promise<Seller> {
  const session = await auth()
  if (!session?.user?.id) notFound()

  const me = await getMe().catch(() => null)
  if (me) return me as Seller

  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: "seller",
    isVerified: session.user.isVerified,
    avatar: session.user.image ?? undefined,
  } as Seller
}

export async function getCurrentBuyer(): Promise<Buyer> {
  const session = await auth()
  if (!session?.user?.id) notFound()

  const me = await getMe().catch(() => null)
  if (me) return me as Buyer

  return {
    id: session.user.id,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    role: "buyer",
    isVerified: session.user.isVerified,
    avatar: session.user.image ?? undefined,
  } as Buyer
}
