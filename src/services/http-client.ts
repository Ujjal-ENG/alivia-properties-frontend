/**
 * Thin fetch wrapper for the NestJS backend.
 *
 * Backend response envelope (see TransformInterceptor):
 *   - non-paginated:  { data: T }
 *   - paginated:      { data: T[], meta: { page, limit, total, totalPages } }
 *
 * This client unwraps that envelope for callers — services receive the raw
 * `T` (or `{ data, meta }` for paginated endpoints — see `httpClient.paginated`).
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3001/api/v1";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Turns a thrown `fetch` rejection into an ApiError with status 0 and a clear,
 * user-facing message. Browsers report network-level failures with opaque text
 * — Chrome "Failed to fetch", Safari "Load failed", Firefox "NetworkError…".
 * These all mean the request never reached the server or the response was
 * blocked: server down, wrong API URL, HTTP/HTTPS mixed-content, or CORS — NOT
 * an HTTP error response (those have a real status code and reach the `!res.ok`
 * branch). The raw text is preserved on `.body` for console/debugging.
 */
function toNetworkError(err: unknown): ApiError {
  const raw = err instanceof Error ? err.message : "Network error";
  const isNetwork = /failed to fetch|load failed|networkerror|fetch failed/i.test(raw);
  return new ApiError(
    isNetwork
      ? "Can't reach the server. Check your internet connection. If it keeps happening the API may be down, or blocked by HTTPS/CORS configuration."
      : raw,
    0,
    raw,
  );
}

type RequestOptions = RequestInit & {
  /** Query string params (will be appended to URL) */
  query?: Record<string, string | number | boolean | null | undefined>;
  /** Auth token (bearer) — usually injected by callers from the session */
  token?: string;
  /** Next.js fetch options (cache, revalidate, tags) */
  next?: { revalidate?: number | false; tags?: string[] };
};

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const base = path.startsWith("http")
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  if (!query) return base;
  const url = new URL(base);
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { query, token, next, headers, body, ...rest } = options;
  const url = buildUrl(path, query);

  // When body is FormData let the browser set Content-Type (includes multipart boundary).
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const init: RequestInit & { next?: RequestOptions["next"] } = {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body,
    next,
  };

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    throw toNetworkError(err);
  }

  const text = await res.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const msg = (payload as { message?: string | string[] })?.message
      ? Array.isArray((payload as { message?: string | string[] }).message)
        ? (payload as { message: string[] }).message.join(", ")
        : (payload as { message: string }).message
      : `HTTP ${res.status}`;
    throw new ApiError(msg, res.status, payload);
  }

  // Backend envelope: { data: T }  or  { data: T[], meta: {...} }
  if (payload && typeof payload === "object" && "data" in payload) {
    // For paginated calls, the caller will use `httpClient.paginated` which
    // returns the whole envelope. For normal `get/post/...`, unwrap `data`.
    return (payload as { data: T }).data;
  }

  return payload as T;
}

async function requestPaginated<T>(
  path: string,
  options: RequestOptions = {},
): Promise<Paginated<T>> {
  const { query, token, next, headers, body, ...rest } = options;
  const url = buildUrl(path, query);
  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {}),
      },
      body,
      next,
    } as RequestInit & { next?: RequestOptions["next"] });
  } catch (err) {
    throw toNetworkError(err);
  }

  const text = await res.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const msg = (payload as { message?: string | string[] })?.message
      ? Array.isArray((payload as { message?: string | string[] }).message)
        ? (payload as { message: string[] }).message.join(", ")
        : (payload as { message: string }).message
      : `HTTP ${res.status}`;
    throw new ApiError(msg, res.status, payload);
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    "meta" in payload
  ) {
    return payload as Paginated<T>;
  }

  // If the response is a bare array, synthesize meta from the array length.
  const arr = Array.isArray(payload) ? (payload as T[]) : [];
  return {
    data: arr,
    meta: { page: 1, limit: arr.length, total: arr.length, totalPages: 1 },
  };
}

export const httpClient = {
  baseUrl: API_BASE_URL,

  get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return request<T>(path, { ...options, method: "GET" });
  },

  paginated<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<Paginated<T>> {
    return requestPaginated<T>(path, { ...options, method: "GET" });
  },

  post<T>(
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const isForm = typeof FormData !== "undefined" && body instanceof FormData;
    return request<T>(path, {
      ...options,
      method: "POST",
      body:
        body == null
          ? undefined
          : isForm
            ? (body as FormData)
            : JSON.stringify(body),
    });
  },

  patch<T>(
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "PATCH",
      body: body == null ? undefined : JSON.stringify(body),
    });
  },

  put<T>(
    path: string,
    body?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    return request<T>(path, {
      ...options,
      method: "PUT",
      body: body == null ? undefined : JSON.stringify(body),
    });
  },

  delete<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
