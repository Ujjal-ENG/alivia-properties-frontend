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

type RefreshResult =
  | { ok: true; data: BackendLoginResponse }
  | { ok: false; message: string };

function parseBackendAuthPayload(json: unknown): BackendLoginResponse | null {
  if (!json || typeof json !== "object") return null;

  const payload =
    "data" in json
      ? (json as { data?: BackendLoginResponse }).data
      : (json as BackendLoginResponse);

  if (!payload?.user || !payload.accessToken || !payload.refreshToken) return null;
  return payload;
}

function getAccessTokenExpiresAt(accessToken: string): number {
  try {
    const [, rawPayload] = accessToken.split(".");
    if (!rawPayload) return Date.now() + 14 * 60 * 1000;

    const normalized = rawPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const parsed = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as {
      exp?: number;
    };

    if (typeof parsed.exp === "number") return parsed.exp * 1000;
  } catch {}

  return Date.now() + 14 * 60 * 1000;
}

async function refreshAccessToken(refreshToken: string): Promise<RefreshResult> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return { ok: false, message: "Network error while refreshing session." };
  }

  if (!res.ok) {
    return { ok: false, message: "Session expired. Please sign in again." };
  }

  const payload = parseBackendAuthPayload(await res.json());
  if (!payload) {
    return { ok: false, message: "Invalid refresh response from server." };
  }

  return { ok: true, data: payload };
}

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
  const payload = parseBackendAuthPayload(await res.json());
  if (!payload) {
    return {
      ok: false,
      status: 500,
      message: "Unexpected response from server.",
    };
  }
  return { ok: true, data: payload };
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
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
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role;
        token.isVerified = (user as { isVerified: boolean }).isVerified;
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.refreshToken = (user as { refreshToken?: string }).refreshToken;
        token.accessTokenExpires = token.accessToken
          ? getAccessTokenExpiresAt(token.accessToken as string)
          : undefined;
        token.error = undefined;
      }

      const expiresAt = token.accessTokenExpires as number | undefined;
      const hasFreshAccessToken =
        typeof token.accessToken === "string" &&
        typeof expiresAt === "number" &&
        Date.now() < expiresAt - 30_000;

      if (hasFreshAccessToken || typeof token.refreshToken !== "string") {
        return token;
      }

      const refreshed = await refreshAccessToken(token.refreshToken);
      if (!refreshed.ok) {
        token.accessToken = undefined;
        token.accessTokenExpires = undefined;
        token.refreshToken = undefined;
        token.error = "RefreshAccessTokenError";
        return token;
      }

      token.accessToken = refreshed.data.accessToken;
      token.refreshToken = refreshed.data.refreshToken;
      token.accessTokenExpires = getAccessTokenExpiresAt(refreshed.data.accessToken);
      token.role = normalizeRole(refreshed.data.user.role);
      token.isVerified = refreshed.data.user.isVerified;
      token.error = undefined;
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
      session.error = token.error as "RefreshAccessTokenError" | undefined;
      return session;
    },
  },
});
