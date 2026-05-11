import { notFound } from "next/navigation"
import { getUsers } from "@/services/users.service"
import { requireRole } from "@/utils/dashboard-auth"
import type { Buyer, Seller } from "@/types/user.types"

export async function getCurrentSeller(): Promise<Seller> {
  const session = await requireRole("seller")
  const users = await getUsers()
  const seller = users.data.sellers.find((item) => item.id === session.user.id)

  if (!seller) {
    notFound()
  }

  return seller
}

export async function getCurrentBuyer(): Promise<Buyer> {
  const session = await requireRole("buyer")
  const users = await getUsers()
  const buyer = users.data.buyers.find((item) => item.id === session.user.id)

  if (!buyer) {
    notFound()
  }

  return buyer
}
