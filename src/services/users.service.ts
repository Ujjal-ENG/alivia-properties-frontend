import { auth } from "@/auth"
import { ApiError, httpClient, type Paginated } from "./http-client"
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
    // Fetch each role independently. We tolerate a partial failure (one role
    // query failing won't blank the others), but if EVERY query fails — almost
    // always an auth problem — we rethrow so the page can show a real message
    // instead of a silently empty table. limit is capped at 100 by the backend.
    const fetchRole = (role: "ADMIN" | "SELLER" | "BUYER") =>
      httpClient
        .paginated<BackendUser>("/users", { query: { role, limit: 100 }, token })
        .then((res) => res.data)

    const results = await Promise.allSettled([
      fetchRole("ADMIN"),
      fetchRole("SELLER"),
      fetchRole("BUYER"),
    ])

    if (results.every((r) => r.status === "rejected")) {
      throw (results.find((r) => r.status === "rejected") as PromiseRejectedResult).reason
    }

    const val = (i: number) =>
      results[i].status === "fulfilled"
        ? (results[i] as PromiseFulfilledResult<BackendUser[]>).value
        : []

    return {
      data: {
        admins: val(0).map((u) => toUser(u)),
        sellers: val(1).map((u) => toUser<Seller>(u)),
        buyers: val(2).map((u) => toUser<Buyer>(u)),
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

function loadErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 403) {
      return "Your admin session has expired. Please sign out and sign back in to load users."
    }
    return `Couldn't load users (HTTP ${err.status}). ${err.message}`
  }
  return "Couldn't load users. Make sure the API server is running."
}

export type GroupedUsersResult = {
  data: { admins: User[]; sellers: Seller[]; buyers: Buyer[] }
  error: string | null
}

const EMPTY_GROUPED = { admins: [], sellers: [], buyers: [] }

// Convenience helpers — pull token from session automatically so callers don't
// have to, and return an `error` instead of throwing/blanking, so pages can
// distinguish "no users" from "couldn't load (e.g. session expired)".
export async function getUsers(): Promise<GroupedUsersResult> {
  const token = await sessionToken()
  if (!token) {
    return {
      data: EMPTY_GROUPED,
      error: "Your admin session has expired. Please sign out and sign back in to load users.",
    }
  }
  try {
    const grouped = await usersService.getUsersGrouped(token)
    return { data: grouped.data, error: null }
  } catch (err) {
    return { data: EMPTY_GROUPED, error: loadErrorMessage(err) }
  }
}

export async function getSellers(): Promise<{ sellers: Seller[]; error: string | null }> {
  const { data, error } = await getUsers()
  return { sellers: data.sellers, error }
}

export async function getBuyers(): Promise<{ buyers: Buyer[]; error: string | null }> {
  const { data, error } = await getUsers()
  return { buyers: data.buyers, error }
}

export async function getMe(): Promise<User> {
  return usersService.me(await sessionToken())
}
