# Dashboard Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every listing page in the admin, seller, and buyer dashboards gets real server-side, URL-synced pagination (currently they fetch flat arrays with limit 50–100, or silently truncate at the backend's default limit of 20).

**Architecture:** URL is the source of truth (`?page=2&status=pending`). Server pages read `searchParams` (a Promise in Next 16), pass `page`/`limit`/filters to the existing service layer, which already returns `Paginated<T> = { data, meta: { page, limit, total, totalPages } }` from the NestJS backend. A new shared `<TablePagination meta={...}/>` client component renders the pager; existing client-side filter pills are converted to write URL params instead of `useState` (backend DTOs already support these filters server-side). Tables keep their optimistic-mutation `rows` state; server pages pass a `key` composed of the URL params so the table remounts with fresh props on every page/filter change.

**Tech Stack:** Next.js 16 App Router (frontend, `pnpm`), NestJS + Prisma (backend, `pnpm`). Two repos:
- Frontend: `/Users/ujjal/code/alivia/alivia-properties-frontend`
- Backend: `/Users/ujjal/code/alivia/alivia-properties-backend`

## Global Constraints

- Page size for ALL dashboard lists: `DASHBOARD_PAGE_SIZE` (= 10) imported from `@/lib/constants` — never hardcode 10.
- URL params are the single source of truth for list state: `page`, `status`, `type`, `role`, `verified`. No `useState` for filters in tables.
- Filter changes call `router.replace` and delete the `page` param (reset to page 1). Page changes call `router.push`.
- Every converted list page renders `<TablePagination meta={res.meta} />` directly below its table/grid.
- Every converted server page passes `key={...all url params...}` to its client table so remount resets the optimistic `rows` state.
- Next 16: `searchParams` is a Promise — `const sp = await searchParams`. Type it `Promise<Record<string, string | undefined>>`.
- Keep the existing visual language exactly: pill filter buttons (`rounded-full border px-3 py-1 text-xs font-semibold`, active = `border-brand-700 bg-brand-700 text-white`), `size-8 rounded-full` icon buttons. Do NOT redesign tables.
- Use `@/` import alias, never relative paths. `pnpm` only.
- Frontend verification per task: `pnpm build` and `pnpm lint` both pass (run from frontend repo root). Backend: `pnpm build` passes.
- Do not touch: marketplace category tree pages (hierarchical, ~62 static rows), `seller/marketplace-catalogue` (few rows per seller), `buyer/recent-searches` (localStorage, capped at 8), dashboard-home widget lists (top-N by design), the public `(site)` pages, `src/components/ui/*`.
- The pre-existing uncommitted change in `src/app/marketplace/page.tsx` is NOT yours — never commit or revert it.
- Commits: conventional messages (`feat: …`), commit only the files your task touched.

## Existing building blocks (do not recreate)

- `src/components/common/pagination.tsx` — controlled `<Pagination page totalPages onChange />`, renders numbered rounded-full buttons with ellipsis, returns `null` when `totalPages <= 1`. Already styled to the design system.
- `src/services/http-client.ts` — exports `PaginationMeta`, `Paginated<T>`; `httpClient.paginated<T>(path, { query, token })` unwraps `{ data, meta }`.
- `src/lib/constants.ts` — `DASHBOARD_PAGE_SIZE = 10` (currently unused).
- Backend `src/common/dto/pagination.dto.ts` — `PaginationQueryDto` (`page` default 1, `limit` default 20 max 100, `search`, `sort`, computed `.skip`, `.buildOrderBy()`) and `paginate(data, total, page, limit)` helper.
- Backend role scoping is already in place: `GET /inquiries` scopes SELLER→`sellerId`, BUYER→`buyerId`; `GET /bookings` scopes SELLER→`assignedTo`, BUYER→`userId`; admin sees all. Frontend `getInquiries()`/`getBookings()` wrappers inject the session token automatically via `auth()`.

---

### Task 1: Backend — paginate saved properties + `verified` filter on users

**Repo:** `/Users/ujjal/code/alivia/alivia-properties-backend` (branch `feat/dashboard-pagination`)

**Files:**
- Modify: `src/modules/properties/properties.controller.ts` (the `@Get('me/saved')` handler, ~line 39–45)
- Modify: `src/modules/properties/properties.service.ts` (`findSaved`, ~line 262–268)
- Modify: `src/modules/users/users.controller.ts` (`UserQueryDto`, ~line 21–26, and the `GET /users` list handler that calls `users.findAll`)
- Modify: `src/modules/users/users.service.ts` (`findAll`, ~line 17–41)

**Interfaces:**
- Produces: `GET /properties/me/saved?page=&limit=` → real paginated envelope (Task 2 frontend `propertiesService.saved(params, token)` consumes this).
- Produces: `GET /users?role=SELLER&verified=true|false&page=&limit=` (Task 7 consumes).

- [ ] **Step 1: Paginate `findSaved`**

In `properties.controller.ts`, bind the query DTO (`PaginationQueryDto` is already imported in this file for `findAll`; if not, import from `../../common/dto/pagination.dto`):

```typescript
@ApiBearerAuth()
@Roles(Role.BUYER)
@Get('me/saved')
@ApiOperation({ summary: "List the current buyer's saved properties" })
saved(@Query() query: PaginationQueryDto, @CurrentUser() user: CurrentUserPayload) {
  return this.properties.findSaved(user, query);
}
```

In `properties.service.ts` replace `findSaved` with:

```typescript
async findSaved(user: CurrentUserPayload, query: PaginationQueryDto) {
  const u = await this.prisma.user.findUnique({ where: { id: user.id } });
  if (!u) throw new NotFoundException();
  if (u.savedPropertyIds.length === 0) return paginate([], 0, query.page, query.limit);
  const where: Prisma.PropertyWhereInput = { id: { in: u.savedPropertyIds } };
  const [data, total] = await Promise.all([
    this.prisma.property.findMany({
      where,
      skip: query.skip,
      take: query.limit,
      orderBy: query.buildOrderBy('createdAt', 'desc'),
    }),
    this.prisma.property.count({ where }),
  ]);
  return paginate(data, total, query.page, query.limit);
}
```

- [ ] **Step 2: Add `verified` filter to users**

In `users.controller.ts`, extend `UserQueryDto` (add imports: `Transform` from `class-transformer`, `IsBoolean` from `class-validator`):

```typescript
class UserQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ description: 'Filter by verification state (true/false)' })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : undefined,
  )
  @IsBoolean()
  verified?: boolean;
}
```

Do NOT use `@Type(() => Boolean)` here — it coerces the string `"false"` to `true`.

Find the `GET /users` list handler in the same controller; it currently forwards `query` and a role to `users.findAll(...)`. Pass `query.verified` through as an extra argument, keeping the existing role argument exactly as it is passed today.

In `users.service.ts` change the signature and where-clause:

```typescript
async findAll(query: PaginationQueryDto, role?: Role, verified?: boolean) {
  const where: Prisma.UserWhereInput = {};
  if (role) where.role = role;
  if (typeof verified === 'boolean') where.isVerified = verified;
  // ... rest unchanged (search OR-clause, findMany/count, paginate)
}
```

- [ ] **Step 3: Build**

Run: `pnpm build` (from backend repo root). Expected: exit 0, no TS errors.

- [ ] **Step 4: Commit**

```bash
git add src/modules/properties src/modules/users
git commit -m "feat: paginate saved properties, add verified filter to users list"
```

---

### Task 2: Frontend foundation — `TablePagination`, `useUrlFilter`, saved-properties service params

**Repo:** `/Users/ujjal/code/alivia/alivia-properties-frontend` (branch `feat/dashboard-pagination`)

**Files:**
- Create: `src/components/dashboard/table-pagination.tsx`
- Create: `src/hooks/use-url-filter.ts`
- Modify: `src/services/properties.service.ts` (`saved`, ~line 128–133)
- Modify: every caller of `propertiesService.saved` / `getSavedProperties` (grep for both; at minimum `src/app/(dashboard)/buyer/saved-properties/page.tsx` and possibly the buyer dashboard stats) — update call sites to the new signature, passing `{}` where no paging is wanted yet (Task 8 wires the real params).

**Interfaces:**
- Produces: `TablePagination({ meta, className }: { meta?: PaginationMeta; className?: string })` — renders "Showing X–Y of Z" + pager; returns `null` if `!meta || meta.total === 0`. All later tasks import it from `@/components/dashboard/table-pagination`.
- Produces: `useUrlFilter(): (key: string, value: string) => void` — sets/deletes a URL param (deletes when value is `""` or `"all"`), always deletes `page`, `router.replace`. All later tasks import from `@/hooks/use-url-filter`.
- Produces: `propertiesService.saved(params: { page?: number; limit?: number } = {}, token?: string): Promise<Paginated<Property>>`.

- [ ] **Step 1: Create `src/components/dashboard/table-pagination.tsx`**

```tsx
"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Pagination } from "@/components/common/pagination"
import type { PaginationMeta } from "@/services/http-client"
import { cn } from "@/lib/utils"

/** URL-synced pager for dashboard tables. The `page` search param is the
 *  source of truth — clicking a page pushes a new URL and the server page
 *  refetches. Renders nothing for an empty list. */
export function TablePagination({ meta, className }: { meta?: PaginationMeta; className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (!meta || meta.total === 0) return null

  const start = (meta.page - 1) * meta.limit + 1
  const end = Math.min(meta.page * meta.limit, meta.total)

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className={cn("mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between", className)}>
      <p className="text-xs text-ink-500">
        Showing {start}–{end} of {meta.total}
      </p>
      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={goTo} />
    </div>
  )
}
```

(`Pagination` already returns `null` when `totalPages <= 1`, so single-page lists show just the count line.)

- [ ] **Step 2: Create `src/hooks/use-url-filter.ts`**

```tsx
"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

/** Returns a setter that writes a dashboard filter into the URL.
 *  `"all"` / empty clears the key. Changing a filter always resets `page`.
 *  Uses `replace` so filter clicks don't pile up in browser history. */
export function useUrlFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (!value || value === "all") params.delete(key)
      else params.set(key, value)
      params.delete("page")
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, searchParams],
  )
}
```

- [ ] **Step 3: Update `propertiesService.saved`**

```typescript
saved(params: { page?: number; limit?: number } = {}, token?: string): Promise<Paginated<Property>> {
  return httpClient
    .paginated<BackendProperty>(`${BASE}/me/saved`, { query: params, token, cache: "no-store" })
    // keep whatever mapping the current implementation applies to res.data
}
```

Match the existing body's mapping (it maps `BackendProperty` → `Property`); only add the `params` argument and `query: params`. Grep `propertiesService.saved\|getSavedProperties` and fix every call site to the new arg order (`saved({}, token)`).

- [ ] **Step 4: Build + lint**

Run: `pnpm build && pnpm lint`. Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/table-pagination.tsx src/hooks/use-url-filter.ts src/services/properties.service.ts <other touched call sites>
git commit -m "feat: add TablePagination + useUrlFilter, paginate saved-properties service"
```

---

## The conversion recipe (referenced by Tasks 3–9)

Every remaining task applies this same two-part change. The recipe is spelled out once here with complete code; per-task sections give the exact files, params, and deviations.

**Part A — server page** (pattern, using admin/inquiries as the exemplar):

```tsx
export const dynamic = "force-dynamic"

import { MessageSquare } from "lucide-react"
import { getInquiries } from "@/services/inquiries.service"
import { DASHBOARD_PAGE_SIZE } from "@/lib/constants"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"
import { TablePagination } from "@/components/dashboard/table-pagination"
import { AdminInquiriesTable } from "@/pages-sections/admin/admin-views"

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const status = sp.status
  const type = sp.type

  const res = await getInquiries({ page, limit: DASHBOARD_PAGE_SIZE, status, type })

  return (
    <div>
      <DashboardPageHeader ... />  {/* keep existing header exactly */}
      <AdminInquiriesTable
        key={`${page}-${status ?? "all"}-${type ?? "all"}`}
        inquiries={res.data}
        status={status ?? "all"}
        type={type ?? "all"}
      />
      <TablePagination meta={res.meta} />
    </div>
  )
}
```

**Part B — client table component** (in `src/pages-sections/admin/admin-views.tsx` unless stated):

1. Add props for the current filter values (e.g. `status = "all"`, `type = "all"` as strings).
2. Delete the filter `useState` lines and the `filtered` `useMemo` — render from `rows` (or the raw prop for tables without mutations) directly.
3. `const setFilter = useUrlFilter()` (import from `@/hooks/use-url-filter`).
4. Filter pill `onClick={() => setStatusFilter(f.value)}` becomes `onClick={() => setFilter("status", f.value)}`; active check `statusFilter === f.value` becomes `status === f.value`.
5. Delete the `"{filtered.length} of {rows.length}"` count span in the pill row — `TablePagination` now owns the count.
6. Keep everything else: `rows` state, mutations, dialogs, columns, empty states.

**Filter value note:** pill filter values are lowercase (`"pending"`, `"sold"`); services already upper-case them for the backend (`toBackendQuery`). Pass through unchanged.

---

### Task 3: Properties tables — admin/properties, admin/pending-listings, seller/properties

**Files:**
- Modify: `src/pages-sections/admin/admin-views.tsx` — `AdminPropertiesTable` (~line 264) and `SellerPropertiesTable` (~line 1957)
- Modify: `src/app/(dashboard)/admin/properties/page.tsx`
- Modify: `src/app/(dashboard)/admin/pending-listings/page.tsx`
- Modify: `src/app/(dashboard)/seller/properties/page.tsx`

**Interfaces:**
- Consumes: `TablePagination`, `useUrlFilter`, `DASHBOARD_PAGE_SIZE` (Task 2).
- Produces: `AdminPropertiesTable({ properties, status = "all", hideFilters = false })`; `SellerPropertiesTable({ properties, status = "all" })`.

- [ ] **Step 1: Convert `AdminPropertiesTable` per recipe Part B.** Replace the `defaultStatus` prop with `status = "all"` and add `hideFilters = false`; when `hideFilters` is true skip rendering the pill row entirely. The `rows`/mutation machinery stays.
- [ ] **Step 2: Convert `SellerPropertiesTable` per recipe Part B** (status pills → URL).
- [ ] **Step 3: Convert the three pages per recipe Part A.**
  - `admin/properties`: `getProperties({ page, limit: DASHBOARD_PAGE_SIZE, status: sp.status }, token)` — keep existing token plumbing (`auth()` / current code) exactly as the page does today; only add params. `key={`${page}-${sp.status ?? "all"}`}`.
  - `admin/pending-listings`: `getProperties({ page, limit: DASHBOARD_PAGE_SIZE, status: "pending" }, token)`, table gets `status="pending" hideFilters`, `key={String(page)}`.
  - `seller/properties`: keep the existing `sellerId` param, add `page`/`limit`/`status`.
- [ ] **Step 4: Build + lint** — `pnpm build && pnpm lint`, both exit 0.
- [ ] **Step 5: Commit** — `git commit -m "feat: paginate admin/seller property tables"`

---

### Task 4: Projects + Blog tables — admin/projects, admin/blog

**Files:**
- Modify: `src/pages-sections/admin/admin-views.tsx` — `AdminProjectsTable` (~line 944), `AdminBlogTable` (~line 1537)
- Modify: `src/app/(dashboard)/admin/projects/page.tsx`
- Modify: `src/app/(dashboard)/admin/blog/page.tsx`

**Interfaces:**
- Consumes: Task 2 exports.
- Produces: `AdminProjectsTable({ projects, status = "all" })`; `AdminBlogTable({ posts, token, status = "all" })`.

- [ ] **Step 1: Convert `AdminProjectsTable` per recipe Part B** (status pills → `setFilter("status", …)`).
- [ ] **Step 2: Convert `AdminBlogTable` per recipe Part B.** Its filter values are `"all" | "published" | "draft"`.
- [ ] **Step 3: Convert both pages per recipe Part A.**
  - `admin/projects`: `getProjects({ page, limit: DASHBOARD_PAGE_SIZE, status: sp.status })`.
  - `admin/blog`: `blogService.adminList({ page, limit: DASHBOARD_PAGE_SIZE, status: sp.status ?? "all" }, token)` — keep the existing token plumbing and `status:"all"` default the page already uses.
- [ ] **Step 4: Build + lint** — both exit 0.
- [ ] **Step 5: Commit** — `git commit -m "feat: paginate admin projects and blog tables"`

---

### Task 5: Inquiries family — admin/inquiries, investor-requests, supplier-requests, reports, seller/inquiries

**Files:**
- Modify: `src/pages-sections/admin/admin-views.tsx` — `AdminInquiriesTable` (~line 1268), `AdminReportsTable` (~line 1743)
- Modify: `src/app/(dashboard)/admin/inquiries/page.tsx`
- Modify: `src/app/(dashboard)/admin/investor-requests/page.tsx`
- Modify: `src/app/(dashboard)/admin/supplier-requests/page.tsx`
- Modify: `src/app/(dashboard)/admin/reports/page.tsx`
- Modify: `src/app/(dashboard)/seller/inquiries/page.tsx`

**Interfaces:**
- Consumes: Task 2 exports.
- Produces: `AdminInquiriesTable({ inquiries, lockedType?, basePath?, status = "all", type = "all" })` (keep `lockedType`/`basePath` semantics exactly — when `lockedType` is set the type pills are already hidden today); `AdminReportsTable({ reports, status = "all" })`.

- [ ] **Step 1: Convert `AdminInquiriesTable` per recipe Part B** — both `statusFilter` and `typeFilter` become URL-driven props. Keep the `lockedType` prop behavior (no type pills when locked; do not pass a `type` URL param from locked pages).
- [ ] **Step 2: Convert `AdminReportsTable` per recipe Part B.** Its pills are `ReportStatus` values; the page maps report-status → inquiry-status for the backend query (read the existing client-side mapping in the reports page/table and reuse it server-side).
- [ ] **Step 3: Convert the five pages per recipe Part A.**
  - `admin/inquiries`: exemplar code above — exactly that.
  - `admin/investor-requests`: `getInquiries({ page, limit: DASHBOARD_PAGE_SIZE, type: "investor", status: sp.status })`, table keeps `lockedType="investor"`.
  - `admin/supplier-requests`: same with `"supplier"`.
  - `admin/reports`: `getInquiries({ page, limit: DASHBOARD_PAGE_SIZE, type: "report", status: <mapped from sp.status> })`, keep the existing Inquiry→Report row mapping.
  - `seller/inquiries`: `getInquiries({ page, limit: DASHBOARD_PAGE_SIZE, status: sp.status })` — backend scopes to the seller from the JWT; do not pass sellerId.
- [ ] **Step 4: Build + lint** — both exit 0.
- [ ] **Step 5: Commit** — `git commit -m "feat: paginate inquiries, partner-request and report tables"`

---

### Task 6: Bookings — admin/bookings, seller/bookings

**Files:**
- Modify: `src/pages-sections/admin/admin-views.tsx` — `AdminBookingsTable` (~line 1424)
- Modify: `src/app/(dashboard)/admin/bookings/page.tsx`
- Modify: `src/app/(dashboard)/seller/bookings/page.tsx`

**Interfaces:**
- Consumes: Task 2 exports.
- Produces: `AdminBookingsTable({ bookings, status = "all" })`.

- [ ] **Step 1: Convert `AdminBookingsTable` per recipe Part B.**
- [ ] **Step 2: Convert `admin/bookings` per recipe Part A** — `getBookings({ page, limit: DASHBOARD_PAGE_SIZE, status: sp.status })`.
- [ ] **Step 3: Simplify `seller/bookings`.** Today it fetches ALL bookings plus the seller's properties and intersects client-side. Delete that: the backend already scopes `GET /bookings` to `assignedTo = seller` from the JWT. The page becomes recipe Part A: `getBookings({ page, limit: DASHBOARD_PAGE_SIZE, status: sp.status })` and nothing else — remove the `getProperties` call and the filtering code.
- [ ] **Step 4: Build + lint** — both exit 0.
- [ ] **Step 5: Commit** — `git commit -m "feat: paginate booking tables, drop client-side seller booking filter"`

---

### Task 7: Users + Sellers — admin/users, admin/sellers

**Files:**
- Modify: `src/pages-sections/admin/admin-views.tsx` — `AdminUsersTable` (~line 814), `AdminSellersTable` (~line 702)
- Modify: `src/app/(dashboard)/admin/users/page.tsx`
- Modify: `src/app/(dashboard)/admin/sellers/page.tsx`
- Possibly modify: `src/services/users.service.ts` — if `getUsers()`/`getSellers()` (the 3-parallel-fetch helpers) end up with zero remaining callers after this task, delete them; otherwise leave them.

**Interfaces:**
- Consumes: Task 2 exports; Task 1 backend `verified` filter.
- Produces: `AdminUsersTable({ users, role = "all" })`; `AdminSellersTable({ sellers, verified = "all" })` where `verified` is `"all" | "true" | "false"`.

- [ ] **Step 1: Convert `AdminUsersTable` per recipe Part B.** The role tabs (`all/Admin/Seller/Buyer`) become `setFilter("role", ...)` writing lowercase values (`"admin" | "seller" | "buyer"`); active tab from the `role` prop. Per-tab counts derived from the merged array must be dropped (single role query now) — tab labels become plain text.
- [ ] **Step 2: Convert `AdminSellersTable` per recipe Part B.** Pills `all/verified/pending` map to `setFilter("verified", "all" | "true" | "false")` (pending = `"false"`).
- [ ] **Step 3: Convert both pages per recipe Part A.**
  - `admin/users`: single call `usersService.list({ page, limit: DASHBOARD_PAGE_SIZE, role: sp.role ? sp.role.toUpperCase() : undefined }, token)` — token via the page's existing session plumbing (check how the page currently gets it; `getUsers` used `auth()` internally, so the page may need `const session = await auth()` + `session?.accessToken`). Replaces the 3-parallel-fetch merge.
  - `admin/sellers`: `usersService.list({ page, limit: DASHBOARD_PAGE_SIZE, role: "SELLER", verified: sp.verified }, token)` — extend the `list` params type with `verified?: string`.
- [ ] **Step 4: Grep `getUsers\|getSellers` in `src/`** — if no callers remain, delete both helpers from `users.service.ts`.
- [ ] **Step 5: Build + lint** — both exit 0.
- [ ] **Step 6: Commit** — `git commit -m "feat: paginate user and seller tables with server-side role/verified filters"`

---

### Task 8: Buyer pages — inquiries, bookings, saved-properties, marketplace-quotes

**Files:**
- Modify: `src/app/(dashboard)/buyer/inquiries/page.tsx` (inline `DataTable` page)
- Modify: `src/app/(dashboard)/buyer/bookings/page.tsx` (inline `DataTable` page)
- Modify: `src/app/(dashboard)/buyer/saved-properties/page.tsx` (PropertyCard grid)
- Modify: `src/app/(dashboard)/buyer/marketplace-quotes/page.tsx` + its table component `src/pages-sections/buyer/…` (find `BuyerMarketplaceQuotesTable`; convert any status pills per recipe Part B — if it has no filters, only the page changes)

**Interfaces:**
- Consumes: Task 2 exports (incl. new `propertiesService.saved(params, token)`); Task 1 backend pagination for saved.

- [ ] **Step 1: `buyer/inquiries`** — recipe Part A on the page itself: `getInquiries({ page, limit: DASHBOARD_PAGE_SIZE })`, add `searchParams`, `<TablePagination meta={res.meta} />` under the `DataTable`. No filters, no `key` needed (no client state — `DataTable` is presentational).
- [ ] **Step 2: `buyer/bookings`** — same: `getBookings({ page, limit: DASHBOARD_PAGE_SIZE })`.
- [ ] **Step 3: `buyer/saved-properties`** — `propertiesService.saved({ page, limit: DASHBOARD_PAGE_SIZE }, token)` (keep the page's existing token/session plumbing), `<TablePagination meta={res.meta} />` under the grid.
- [ ] **Step 4: `buyer/marketplace-quotes`** — `quotesService.list({ page, limit: DASHBOARD_PAGE_SIZE, status: sp.status if the table has status pills }, token)`; convert table pills per recipe Part B if present (add `key` on the table only if it holds `rows` state).
- [ ] **Step 5: Build + lint** — both exit 0.
- [ ] **Step 6: Commit** — `git commit -m "feat: paginate buyer dashboard lists"`

---

### Task 9: Admin marketplace — quotes + suppliers panel

**Files:**
- Modify: `src/app/(dashboard)/admin/marketplace-quotes/page.tsx` + its table `AdminMarketplaceQuotesTable` (own file — locate under `src/pages-sections/admin/`)
- Modify: `src/app/(dashboard)/admin/marketplace/suppliers/page.tsx` + `AdminMaterialsCatalogPanel` (locate its file)

**Interfaces:**
- Consumes: Task 2 exports.

- [ ] **Step 1: `admin/marketplace-quotes`** — recipe Part A: `quotesService.list({ page, limit: DASHBOARD_PAGE_SIZE, status: sp.status }, token)`; convert the table's status pills per recipe Part B if present (`QuoteQueryDto` supports `status` server-side). `key` on the table if it holds `rows` state.
- [ ] **Step 2: `admin/marketplace/suppliers`** — `marketplaceService.adminListSuppliers({ page, limit: DASHBOARD_PAGE_SIZE }, token)` + `<TablePagination meta={res.meta} />`. Convert any client-side filters in the panel per recipe Part B **only** for filters `MarketplaceQueryDto` supports server-side (`category`, `supplierId`, `kind`); a filter with no backend support stays client-side and is noted in the report. The nested `products` cap of 8 per supplier is backend-by-design — do not touch.
- [ ] **Step 3: Build + lint** — both exit 0.
- [ ] **Step 4: Commit** — `git commit -m "feat: paginate admin marketplace quotes and suppliers"`

---

## Final verification (controller, after all tasks)

- [ ] Whole-branch code review (both repos' diffs).
- [ ] Start backend (`pnpm start:dev` in backend repo — infra hosts are localhost, backend runs on host, not Docker) and drive 3–4 representative pages via the running frontend dev server (localhost:3000): admin/inquiries page 2, filter + page reset, seller/bookings, buyer/saved-properties.
- [ ] `pnpm build && pnpm lint` green in frontend; `pnpm build` green in backend.
