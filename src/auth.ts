import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { DUMMY_AUTH_USERS } from "@/data/dummy-users"
import type { UserRole } from "@/types/user.types"

type DummyUser = {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
  isVerified: boolean
  password: string
}

function findUser(email: string, password: string): DummyUser | null {
  const allUsers: DummyUser[] = [
    DUMMY_AUTH_USERS.admin as DummyUser,
    ...DUMMY_AUTH_USERS.sellers as DummyUser[],
    ...DUMMY_AUTH_USERS.buyers as DummyUser[],
  ]
  return allUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  ) ?? null
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        const email    = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        const user = findUser(email, password)
        if (!user) return null

        return {
          id:         user.id,
          name:       user.name,
          email:      user.email,
          image:      user.avatar ?? null,
          role:       user.role,
          isVerified: user.isVerified,
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role       = (user as DummyUser).role
        token.isVerified = (user as DummyUser).isVerified
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id         = token.sub ?? ""
        session.user.role       = token.role as UserRole
        session.user.isVerified = (token.isVerified as boolean | undefined) ?? false
      }
      return session
    },
  },
})
