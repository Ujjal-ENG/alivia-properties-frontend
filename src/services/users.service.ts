import { auth } from "@/auth"
import { httpClient, type Paginated } from "./http-client"
import { normalizeRole, type Seller, type Buyer, type User } from "@/types/user.types"

async function sessionToken(): Promise<string | undefined> {
  const session = await auth()
  return session?.accessToken
}

type BackendUser = {
  id: string
  name: string
  email: string
  phone?: string | null
  avatar?: string | null
  role: string
  isVerified: boolean
  createdAt?: string
  updatedAt?: string
}

function toUser<T extends User = User>(u: BackendUser): T {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone ?? undefined,
    avatar: u.avatar ?? undefined,
    role: normalizeRole(u.role),
    isVerified: u.isVerified,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  } as T
}

export const usersService = {
  async list(
    params: { page?: number; limit?: number; role?: string; search?: string } = {},
    token?: string,
  ): Promise<Paginated<User>> {
    const res = await httpClient.paginated<BackendUser>("/users", {
      query: params as Record<string, string | number | undefined>,
      token,
    })
    return { ...res, data: res.data.map(u => toUser(u)) }
  },

  /**
   * Convenience helper used by dashboards that previously read from
   * the dummy mock `/api/mock/users` endpoint, which returned
   * `{ sellers, buyers }`. We reproduce that shape from the backend
   * by filtering on role.
   */
  async getUsersGrouped(token?: string): Promise<{
    data: { admins: User[]; sellers: Seller[]; buyers: Buyer[] }
  }> {
    const [adminsRes, sellersRes, buyersRes] = await Promise.all([
      httpClient.paginated<BackendUser>("/users", {
        query: { role: "ADMIN", limit: 100 },
        token,
      }),
      httpClient.paginated<BackendUser>("/users", {
        query: { role: "SELLER", limit: 100 },
        token,
      }),
      httpClient.paginated<BackendUser>("/users", {
        query: { role: "BUYER", limit: 100 },
        token,
      }),
    ])
    return {
      data: {
        admins: adminsRes.data.map(u => toUser(u)),
        sellers: sellersRes.data.map(u => toUser<Seller>(u)),
        buyers: buyersRes.data.map(u => toUser<Buyer>(u)),
      },
    }
  },

  byId(id: string, token?: string): Promise<User> {
    return httpClient
      .get<BackendUser>(`/users/${id}`, { token })
      .then(toUser)
  },

  me(token?: string): Promise<User> {
    return httpClient
      .get<BackendUser>("/users/me", { token })
      .then(toUser)
  },

  update(id: string, payload: unknown, token?: string): Promise<User> {
    return httpClient
      .patch<BackendUser>(`/users/${id}`, payload, { token })
      .then(toUser)
  },

  updateMe(payload: unknown, token?: string): Promise<User> {
    return httpClient
      .patch<BackendUser>("/users/me", payload, { token })
      .then(toUser)
  },
}

// Convenience helpers — pull token from session automatically so callers don't have to.
export async function getUsers(): Promise<{
  data: { admins: User[]; sellers: Seller[]; buyers: Buyer[] }
}> {
  return usersService.getUsersGrouped(await sessionToken())
}

export async function getSellers(): Promise<Seller[]> {
  const grouped = await usersService.getUsersGrouped(await sessionToken())
  return grouped.data.sellers
}

export async function getBuyers(): Promise<Buyer[]> {
  const grouped = await usersService.getUsersGrouped(await sessionToken())
  return grouped.data.buyers
}

export async function getMe(): Promise<User> {
  return usersService.me(await sessionToken())
}
