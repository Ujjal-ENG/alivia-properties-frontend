import { notFound } from "next/navigation"
import { getMe } from "@/services/users.service"
import { requireRole } from "@/utils/dashboard-auth"
import type { Buyer, Seller } from "@/types/user.types"

export async function getCurrentSeller(): Promise<Seller> {
  await requireRole("seller")
  try {
    return (await getMe()) as Seller
  } catch {
    notFound()
  }
}

export async function getCurrentBuyer(): Promise<Buyer> {
  await requireRole("buyer")
  try {
    return (await getMe()) as Buyer
  } catch {
    notFound()
  }
}
