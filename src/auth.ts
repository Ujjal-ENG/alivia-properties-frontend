import { normalizeRole, type UserRole } from "@/types/user.types";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3001/api/v1";

type BackendLoginResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
    isVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
};

type LoginResult =
  | { ok: true; data: BackendLoginResponse }
  | { ok: false; status: number; message: string };

// Auth.js v5 forwards `code` to the client on signIn({ redirect: false }).
class BackendLoginError extends CredentialsSignin {
  code: string;
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}

async function loginAgainstBackend(
  email: string,
  password: string,
): Promise<LoginResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return {
      ok: false,
      status: 0,
      message: "Network error. Please check your connection and try again.",
    };
  }

  if (!res.ok) {
    let message = "Login failed. Please try again.";
    try {
      const errJson = (await res.json()) as {
        message?: string | string[];
      } | null;
      if (errJson) {
        if (Array.isArray(errJson.message)) message = errJson.message.join(", ");
        else if (typeof errJson.message === "string") message = errJson.message;
      }
    } catch {
      if (res.status === 429) {
        message = "Too many login attempts. Please wait a moment and try again.";
      } else if (res.status === 401) {
        message = "Invalid email or password.";
      }
    }
    return { ok: false, status: res.status, message };
  }

  // NestJS TransformInterceptor wraps responses in { data: ... }
  const json = (await res.json()) as
    | { data?: BackendLoginResponse }
    | BackendLoginResponse;
  const payload =
    json && typeof json === "object" && "data" in json
      ? (json as { data: BackendLoginResponse }).data
      : (json as BackendLoginResponse);

  if (!payload?.user || !payload.accessToken) {
    return {
      ok: false,
      status: 500,
      message: "Unexpected response from server.",
    };
  }
  return { ok: true, data: payload };
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) {
          throw new BackendLoginError("Email and password are required.");
        }

        const result = await loginAgainstBackend(email, password);
        if (!result.ok) {
          throw new BackendLoginError(result.message);
        }

        const { user, accessToken, refreshToken } = result.data;
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar ?? null,
          role: normalizeRole(user.role),
          isVerified: user.isVerified,
          accessToken,
          refreshToken,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role;
        token.isVerified = (user as { isVerified: boolean }).isVerified;
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.refreshToken = (user as { refreshToken?: string }).refreshToken;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as UserRole) ?? "buyer";
        session.user.isVerified =
          (token.isVerified as boolean | undefined) ?? false;
      }
      session.accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
});
