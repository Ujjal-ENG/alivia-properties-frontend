# Plan: Marketplace landing page account link ignores login state

## Background

The site's root route `/` renders `src/app/marketplace/page.tsx` directly
(see the comment at the top of `src/app/page.tsx` — a documented TEMP
arrangement where the marketplace page IS the homepage). That page builds
its own header inline and does **not** reuse `src/components/layout/
site-header.tsx`.

Bug: both of this page's "account" controls — the compact icon-only
`<Link>` (mobile/tablet, `aria-label="My account"`, ~line 476) and the
labeled `<Link>My Account</Link>` (desktop `xl:` block, ~line 517) — are
hardcoded to `href={ROUTES.LOGIN}` unconditionally. The page never reads
the auth session at all (confirmed: zero occurrences of `useSession`,
`auth()`, or `getDashboardRoute` anywhere in the file). So a user who logs
in and returns to `/` (the app's landing page) always sees "My Account"
linking back to `/login`, never a link to their actual dashboard — this is
what was reported as "after login, the landing page still shows the login
route rather than the dashboard route based on the role."

Compare with `src/components/layout/site-header.tsx` (~line 304-327),
which gets this right already and is the pattern to mirror:
```tsx
{session?.user?.role ? (
  <Link href={getDashboardRoute(session.user.role as UserRole)}>
    <Button size="sm" variant="outline" className="cursor-pointer gap-1.5 rounded-full px-4 text-[0.82rem]">
      <LayoutDashboard className="h-3.5 w-3.5" />
      Dashboard
    </Button>
  </Link>
) : (
  <Link href={authNav.login.href}>
    <Button variant="ghost" size="sm" className="cursor-pointer rounded-full px-4 text-[0.82rem] text-ink-700 hover:bg-ink-100/70 hover:text-ink-900">
      Login
    </Button>
  </Link>
)}
```
That file gets the session client-side via `useSession()` from
`next-auth/react` (it's a `"use client"` component). `marketplace/page.tsx`
is different: it's a **Server Component** (`export default async function
MarketplacePage(...)`, no `"use client"` directive, already `async` and
already awaiting other data). The idiomatic server-side equivalent, per
this codebase's own documented convention ("Server: `await auth()` from
`@/auth`; Client: `useSession()` from `next-auth/react`" — see `AGENTS.md`
§9 in this repo and the shared workspace `context/ui.md`), is to call
`await auth()` directly in the page component.

## Global Constraints

- Package manager is pnpm only. Run all commands from
  `alivia-properties-frontend/` (repo root for this branch).
- This is a **Server Component** fix — do not add `"use client"` to
  `src/app/marketplace/page.tsx`. Do not introduce a new client component
  just for this; call `await auth()` directly in the existing async page
  function, the same way other server pages in this codebase do (e.g.
  `src/app/layout.tsx` already does `const session = await auth()`).
- Do not change `src/components/layout/site-header.tsx` — it already
  behaves correctly and is only referenced here as the pattern to mirror.
- Do not touch anything else in `marketplace/page.tsx` outside the two
  account-link blocks described below.
- Verify with `pnpm lint` (must pass) plus a live browser check using the
  `agent-browser` CLI against the running dev server (:3000) and backend
  (:3001) — log in as any demo role, navigate to `/`, and confirm the
  header shows a "Dashboard" control instead of "My Account" and that
  clicking it lands on the correct role-based dashboard route
  (`getDashboardRoute(role)`: `/admin/dashboard`, `/seller/dashboard`, or
  `/buyer/dashboard`). Also confirm the **logged-out** case is unchanged
  (still shows "My Account" → `/login`).

## Task 1: Make the marketplace landing page's account link session-aware

**Files:** `src/app/marketplace/page.tsx`

**The fix:**

1. Add to the existing imports:
   ```tsx
   import { auth } from "@/auth";
   import { getDashboardRoute } from "@/utils/auth-helpers";
   import type { UserRole } from "@/types/user.types";
   ```
   Add `LayoutDashboard` to the existing `lucide-react` import list (it
   already imports many icons from `lucide-react` in one destructured
   import — add `LayoutDashboard` alongside them, keep the list
   alphabetically/consistently ordered the way the existing list already
   is).

2. Inside `export default async function MarketplacePage({ searchParams }: MarketplacePageProps) { ... }`, near the top of the function body (alongside or right after any other early `await`s already there — read the current function start to place it naturally, e.g. near where `searchParams` is awaited/destructured), add:
   ```tsx
   const session = await auth();
   const dashboardHref = session?.user?.role
     ? getDashboardRoute(session.user.role as UserRole)
     : null;
   ```

3. Replace the **compact icon-only account link** (~line 475-481):
   ```tsx
   <Link
     href={ROUTES.LOGIN}
     aria-label="My account"
     className="flex size-11 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
   >
     <User aria-hidden="true" className="size-4.5" />
   </Link>
   ```
   with a version that switches destination, icon, and label based on
   `dashboardHref`:
   ```tsx
   <Link
     href={dashboardHref ?? ROUTES.LOGIN}
     aria-label={dashboardHref ? "Go to dashboard" : "My account"}
     className="flex size-11 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
   >
     {dashboardHref ? (
       <LayoutDashboard aria-hidden="true" className="size-4.5" />
     ) : (
       <User aria-hidden="true" className="size-4.5" />
     )}
   </Link>
   ```
   Do not change the sizing/className, only the `href`, `aria-label`, and
   which icon renders.

4. Replace the **labeled desktop account link** (~line 516-522):
   ```tsx
   <Link
     href={ROUTES.LOGIN}
     className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
   >
     <User aria-hidden="true" className="size-4" />
     My Account
   </Link>
   ```
   with:
   ```tsx
   <Link
     href={dashboardHref ?? ROUTES.LOGIN}
     className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
   >
     {dashboardHref ? (
       <LayoutDashboard aria-hidden="true" className="size-4" />
     ) : (
       <User aria-hidden="true" className="size-4" />
     )}
     {dashboardHref ? "Dashboard" : "My Account"}
   </Link>
   ```
   Same className/sizing preserved, only content/destination changes.

Do not touch the cart `<Link>`/`<Button>` blocks right next to these (both
the compact and labeled versions) — only the account link in each block.

**Verification:**
1. `pnpm lint` passes.
2. **Logged out:** open `http://localhost:3000/` in a fresh session (clear
   cookies or use a fresh `agent-browser` session/profile). At both
   1440px and 375px, confirm the account control still shows the person
   icon / "My Account" text and links to `/login` (unchanged from
   current behavior).
3. **Logged in:** log in as any demo role (`http://localhost:3000/login`
   → click a role quick-fill button → "Sign In"), then navigate to
   `http://localhost:3000/`. At 1440px, confirm the labeled control now
   reads "Dashboard" with a `LayoutDashboard` icon; click it and confirm
   it lands on the correct role-based route (e.g. Seller →
   `/seller/dashboard`). At 375px, confirm the compact icon-only control
   now shows the `LayoutDashboard` icon (not the person icon) and has
   `aria-label="Go to dashboard"`; click/tap it and confirm the same
   correct destination.
4. Repeat step 3 for at least one other role (e.g. Admin or Buyer) to
   confirm `getDashboardRoute` branches correctly, not just one hardcoded
   path.
5. Confirm no console errors and no horizontal overflow introduced at
   375px (`document.documentElement.scrollWidth <= window.innerWidth`).
