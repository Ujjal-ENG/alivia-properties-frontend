# Plan: Mobile touch-target & layout fixes for native-app feel

## Background

Alivia Properties frontend (Next.js 16 / Tailwind v4, `alivia-properties-frontend/`)
was audited for responsiveness across ~30 routes at 375/390/768/1024/1440px using
`agent-browser` (Chrome CDP) with the frontend dev server on :3000 and the NestJS
backend + Docker infra stack running locally. **No horizontal page overflow was
found anywhere** — the responsive foundation (container-page, breakpoints, the
existing `@media (max-width: 767px) { button, [role="button"] { min-height:44px
!important } }` rule in `src/app/globals.css`) is solid.

What the audit *did* find: a handful of concrete elements that render below the
44px comfortable mobile touch-target size (Apple HIG / Material minimum), one
squeezed/unusable search input on narrow phones, and one overcrowded dashboard
header that truncates the page title. These are isolated, independent fixes —
no shared files between tasks.

**Not in scope:** the marketplace-first homepage (`src/app/marketplace/page.tsx`,
served at `/`) intentionally does not include the full `SiteHeader`/`MobileNav`
site navigation (Blog, Agents, Compare, Login vs Register, etc.) — that's a
deliberate "marketplace-first" IA decision from a prior redesign, documented in
project memory. Do not add site-wide nav to that page; these tasks only fix
touch-target sizing and one layout bug within its existing structure.

## Global Constraints

- Package manager is **pnpm only**. Run all commands from
  `alivia-properties-frontend/` (the Next.js app root, which is also the git
  repo root for this branch).
- Tailwind v4, no `tailwind.config.js` — utility classes only, no new CSS files.
- Do not hand-edit `src/components/ui/*` (shadcn-generated primitives) — fix
  call sites instead, per project convention in `AGENTS.md`.
- Do not touch `next.config.ts`, `src/proxy.ts`, or any data/service files —
  every task here is presentational (JSX className changes only).
- Every task's diff must be verifiable with `pnpm lint` (must pass with zero
  new warnings/errors) **and** a live browser check at 375×812 viewport using
  the `agent-browser` CLI (already installed globally). The frontend dev
  server may already be running on :3000 — check with
  `lsof -i :3000 -sTCP:LISTEN -t` before starting a new one; if one is
  running, use it (Next.js dev server hot-reloads on save, no restart
  needed). If none is running, start one in the background:
  `pnpm dev > /tmp/frontend-dev.log 2>&1 &` and wait for "Ready" in the log
  before testing.
- Touch-target check snippet (paste into `agent-browser eval --stdin` after
  `agent-browser set viewport 375 812` and opening the target URL):
  ```js
  (() => {
    const els = Array.from(document.querySelectorAll('a[href], button, [role="button"]'));
    return els
      .map(el => {
        const r = el.getBoundingClientRect();
        return { text: (el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,30), w: Math.round(r.width), h: Math.round(r.height) };
      })
      .filter(e => e.w > 2 && e.h > 2 && (e.w < 44 || e.h < 44));
  })()
  ```
  A passing result for elements this plan targets is an **empty array** (or,
  for the search-input task, the specific measurement described in that task).
- Do not fix or flag anything outside each task's named files/elements, even
  if the touch-target snippet surfaces other pre-existing small targets
  elsewhere on the same page — those are out of scope for this plan (e.g.
  breadcrumb text links, inline prose links). Report anything you believe is
  a real bug outside scope as a concern in your report; do not fix it.

---

## Task 1: Footer touch targets

**Files:** `src/components/layout/site-footer.tsx`

`SiteFooter` is rendered on nearly every public page (site pages + the
marketplace homepage) and its links currently fall short of the 44px mobile
touch-target minimum used everywhere else in this codebase:

- The "Explore" quick links list (`QUICK_LINKS` map, the `<Link>` at
  approximately line 114) and the three "Contact" list items (phone, email,
  address — the `<a>`/`<span>` wrapper elements around lines 133, 141, 148)
  currently use `min-h-10` (40px). Change each to `min-h-11` (44px).
- The bottom legal row (Privacy / Terms / Support `<Link>`s, around lines
  163–171) currently uses `min-h-9` (36px). Change each to `min-h-11` (44px).

Do not change any other classes on these elements (padding, colors, gaps,
grid layout). This is a minimal `min-h-10`→`min-h-11` and `min-h-9`→`min-h-11`
substitution across the elements described above — nothing else in the file
should change.

**Verification:**
1. `pnpm lint` passes.
2. With the dev server running, open `http://localhost:3000/about-us` (a
   plain (site)-group page that renders `SiteFooter`) at 375×812, scroll to
   the footer, and run the touch-target check snippet from Global
   Constraints scoped to the footer:
   ```js
   (() => {
     const footer = document.querySelector('footer');
     const els = Array.from(footer.querySelectorAll('a[href]'));
     return els.map(el => { const r = el.getBoundingClientRect(); return { text: el.textContent.trim().slice(0,25), h: Math.round(r.height) }; })
       .filter(e => e.h > 2 && e.h < 44);
   })()
   ```
   Must return `[]`.
3. Screenshot the footer at 375px width and confirm it still reads as a
   normal compact footer (no excessive whitespace/broken wrapping).

---

## Task 2: Dashboard header mobile crowding

**Files:** `src/components/layout/dashboard-header.tsx`

On mobile (`<lg`, i.e. below 1024px — this header's icons use `lg:hidden` to
show on mobile/tablet), the header row packs 5 controls into one line: the
hamburger menu button, the page title, a search icon button, a "back to
home" icon button, the notifications bell, and the avatar dropdown. At
375px width this squeezes the `<h1>` page title so hard it truncates to
just a few characters (e.g. "Dashboard" renders as "DAS…") — the single
most important piece of context on the screen becomes unreadable.

`DashboardSidebar` (rendered inside the mobile drawer that the hamburger
button opens) already has its own "Back to Home" link at the top of its
nav (see `src/components/layout/dashboard-sidebar.tsx`, the `<Link
href={ROUTES.HOME}>` right after the brand header, present in both
`variant="static"` and `variant="mobile"`). The header's standalone
"Back to home" icon button (the `<Link href={ROUTES.HOME} ... title="Back
to home">` around line 120–127 of `dashboard-header.tsx`) is therefore
redundant on mobile/tablet — it's reachable one tap away via the hamburger
drawer.

Fix: hide the header's "Back to home" icon button below the `lg` breakpoint
(add `hidden lg:flex` to its className, replacing the current unconditional
`flex`), so it only appears once the sidebar is permanently visible (at
which point the drawer/hamburger doesn't exist and this is the only way
back to the public site from the header). Do not remove the button
entirely — desktop users still need it. Do not change the mobile drawer's
"Back to Home" link in `dashboard-sidebar.tsx` — that one must stay.

Do not touch the search button, notifications bell, avatar dropdown, or
hamburger button — only the "Back to home" link's visibility.

**Verification:**
1. `pnpm lint` passes.
2. Log in as any demo role (open `http://localhost:3000/login`, click the
   "Seller" quick-fill button, then the "Sign In" button — or Admin/Buyer,
   any role reaches a `DashboardHeader`) and land on a dashboard page (e.g.
   `/seller/dashboard`).
3. At 375×812, screenshot the header. Confirm: (a) the "back to home" house
   icon is gone from the mobile row, (b) the page title now renders without
   truncating (or renders substantially more of the text than before — for
   a short title like "Dashboard" it should render in full).
4. Resize to 1280×800 (`agent-browser set viewport 1280 800`), reload, and
   confirm the "back to home" icon button is visible again in the header
   next to the notification bell.

---

## Task 3: Marketplace homepage header & search bar mobile fixes

**Files:** `src/app/marketplace/page.tsx`

This file renders the site's root `/` route (see the comment at the top of
`src/app/page.tsx` — root path renders this marketplace page directly, no
`SiteHeader`/`MobileNav`). It builds its own header inline. Three
independent mobile bugs in that header, all in this one file:

**3a. Top utility strip touch targets too small.**
Around lines 415–446, the top black utility strip
(`<section className="bg-brand-950 ...">`) has a fixed `h-9` (36px)
container holding four links: "Be a Supplier", "Be an Investor", "My
Orders", "Help & Support". None of the four `<Link>`/`<a>` elements have
any height styling, so they render at ~18px tall — well under the 44px
target and even under WCAG's 24px legal minimum comfort zone. The
equivalent utility strip in `src/components/layout/site-header.tsx` (the
"Top info strip" `<div>`) uses a `h-11` (44px) container for exactly this
reason. Match that convention here:
- Change the strip's container height from `h-9` to `min-h-11 py-1` (so it
  can grow to fit 44px children instead of clipping them — `h-9` is a fixed
  height, `min-h-11` is not).
- Add `min-h-11` to each of the four links' existing className strings
  (the two `<Link>` elements for "Be a Supplier"/"Be an Investor", the
  `<Link>` for "My Orders", and the `<a>` for "Help & Support").

**3b. Compact account/cart icon buttons under 44px.**
Around lines 474–493 (the "Compact account/cart icons" block, visible
below the `xl` breakpoint — i.e. on every mobile/tablet viewport), the "My
account" `<Link>` uses `size-10` (40px) and the cart `<Button size="icon">`
uses `className="relative size-10 ..."` (also 40px). Bump both from
`size-10` to `size-11` (44px). Do not change the `xl:` desktop versions of
these controls (the "Labeled account/cart" block further down, ~line
515–534) — those are already `min-h-11`/`h-11`.

**3c. Compact search bar's text input collapses to ~32px wide on narrow
phones.**
The local `MarketplaceSearchForm` function (defined near the bottom of this
file, ~line 912 onward) renders, in `compact` mode (used in the sticky
header — see the `<MarketplaceSearchForm compact ... />` call around line
505), a CSS grid: `grid-cols-[minmax(0,1fr)_auto_3rem]` holding
`[inputControl, selectControl, submit button]`. The middle `auto` column
(the department `<select>`) has no explicit width — a native `<select>`
with `w-full` inside an `auto` grid track ends up sized by browser-internal
heuristics that, at 375px viewport width, leave the free-text search input
(`inputControl`, the `minmax(0,1fr)` column) squeezed to roughly 32px wide
— effectively unusable; a user can't see what they're typing.

Fix by giving the select control an explicit width in compact mode instead
of relying on the `auto` track to size it correctly. In the
`selectControl` JSX (the `<div className="relative"> ... <select ...>
... </div>` block), change the wrapping div's className from `"relative"`
to a value that adds a fixed width **only when `compact` is true** (the
`compact` prop is already in scope in this function) — e.g.
`cn("relative", compact && "w-28 shrink-0 sm:w-36")`. This guarantees the
grid's `auto` track resolves to a known, reasonable width (112px on
phones, 144px from `sm:` up) so the remaining `minmax(0,1fr)` space goes to
the actual search input. Do not change the non-compact (hero) search bar's
behavior — its grid already gives the select a fixed `11rem` track via
`md:grid-cols-[11rem_minmax(0,1fr)_3rem]`, so `compact && ...` naturally
leaves it untouched.

**Verification (do all three in one pass since they're in the same file):**
1. `pnpm lint` passes.
2. At 375×812, open `http://localhost:3000/`. Screenshot the full header
   area (top strip + search row).
3. Run the touch-target check snippet from Global Constraints scoped to the
   top strip and account/cart icons:
   ```js
   (() => {
     const strip = document.querySelector('section.bg-brand-950');
     const els = Array.from(strip.querySelectorAll('a[href]'));
     const acctIcons = Array.from(document.querySelectorAll('a[aria-label="My account"], a[aria-label="Cart"] button'));
     return [...els, ...acctIcons].map(el => { const r = el.getBoundingClientRect(); return { text:(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,20), w: Math.round(r.width), h: Math.round(r.height) }; })
       .filter(e => e.h > 2 && (e.h < 44));
   })()
   ```
   Must return `[]` (or only entries with `h >= 44`).
4. Measure the compact search input's actual rendered width:
   ```js
   (() => {
     const input = document.getElementById('marketplace-header-search');
     const r = input.getBoundingClientRect();
     return { width: Math.round(r.width) };
   })()
   ```
   Width must be comfortably larger than the ~32px broken baseline — at
   least 100px at 375px viewport width (the exact number depends on logo/
   icon widths in the same row; the point is it must no longer be a sliver).
5. Re-check at 768px and 1440px (`agent-browser set viewport <w> <h>`,
   reload) that the header still looks correct and no horizontal page
   overflow was introduced (`document.documentElement.scrollWidth <=
   window.innerWidth`).

---

## Task 4: Undersized inline CTA links (property detail + seller dashboard)

**Files:** `src/app/(site)/properties/[slug]/page.tsx`,
`src/app/(dashboard)/seller/dashboard/page.tsx`

Two unrelated pages, same pattern: a plain `<a>`/`<Link>` styled as a small
text CTA with no minimum height, rendering under 44px tall on mobile.

**4a.** In `src/app/(site)/properties/[slug]/page.tsx`, the "Get
directions" link (around line 302–309, `<a href={mapsUrl} ... className="inline-flex
items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3
py-1.5 text-xs font-semibold text-brand-700 ...">`) renders at ~32px tall.
Change `py-1.5` to `py-2.5` and add `min-h-10` to the className. (Full
44px would visually overwhelm this small secondary pill next to an inline
`<h2>`; 40px is the established secondary-pill size used elsewhere in this
codebase and clears WCAG's 24px minimum comfortably.)

**4b.** In `src/app/(dashboard)/seller/dashboard/page.tsx`, the "Edit
Listing" link inside the Recent Listings card list (around line 124–126,
`<Link href={ROUTES.SELLER_PROPERTY_EDIT(property.id)}
className="text-xs font-semibold text-brand-700 hover:underline">Edit
Listing</Link>`) renders at ~18px tall — it's bare text with no padding at
all. Add `inline-flex min-h-11 items-center` to its className so the tap
target reaches 44px while the visible text stays the same size.

**Verification:**
1. `pnpm lint` passes.
2. At 375×812: open a property detail page, e.g.
   `http://localhost:3000/properties/4-bed-apartment-for-sale-in-khalishpur-khalishpur`
   (if that slug 404s, fetch any current slug via
   `curl -s http://localhost:3001/api/v1/properties?limit=1` — backend
   must be running, see Global Constraints troubleshooting note below —
   and use `data[0].slug`). Confirm the "Get directions" pill is now
   ≥40px tall via `agent-browser get box` or the touch-target snippet.
3. Log in as Seller (see Task 2 verification step 2) and land on
   `/seller/dashboard`. If it has at least one listing, confirm each "Edit
   Listing" link is ≥44px tall the same way. If the seller has zero
   listings the card list won't render — that's fine, just confirm via
   Read that the className change is present in the file.
4. **Backend note:** both of these pages call live backend services and
   need the NestJS API running on :3001 (with its Docker infra: Mongo,
   Redis, MinIO) to render real data instead of erroring. Check with
   `curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/api/v1/health`
   — if it doesn't return `200`, bring the stack up from
   `alivia-properties-backend/`: `pnpm dev:up` (Docker infra), then
   `pnpm prisma:generate && pnpm db:push`, then
   `pnpm start:dev > /tmp/backend-api.log 2>&1 &` and wait for "Nest
   application successfully started" in the log.

---

## Task 5: MarketplaceMegaMenu mobile trigger width (root-cause fix for the compact search bar)

**Files:** `src/components/marketplace/MarketplaceMegaMenu.tsx`

**Why this task exists:** Task 3's sub-fix 3c gave the compact search bar's
department `<select>` an explicit width, on the theory that the select's
browser-heuristic auto-sizing was squeezing the free-text search input down
to ~32px wide (unusable) at 375px viewport width. Task 3's implementer
built that fix correctly, but live measurement proved the real bottleneck
is elsewhere: at 375px, the header row shared between the
`MarketplaceMegaMenu` trigger button and the `MarketplaceSearchForm`
totals ~343px (`375 - 32px` container-page gutters). The MegaMenu's
trigger button (defined in this file, around lines 156–176:
`<button ref={triggerRef} ... className="flex h-11 w-full items-center
gap-2 rounded-md bg-gold-400 px-3 ...">`, containing a `LayoutGrid` icon
plus `<span className="whitespace-nowrap">All Categories</span>`) cannot
shrink below its content's intrinsic width because the label has
`whitespace-nowrap` and flex items default to `min-width: auto` (i.e. they
refuse to shrink below their content's minimum size unless told
otherwise). That rigidly consumes ~168px of the ~343px row, leaving only
~119px to split between the select, the search input, and the submit
button — mathematically too little for a usable search box no matter how
the select is sized. (Confirmed via live `agent-browser` DOM measurement,
not guessed — see `.superpowers/sdd/task-3-report.md` in this repo for the
full trace, though that file is git-ignored scratch and won't exist in a
fresh clone; the description above is complete on its own.)

This exact "abbreviate the label below `sm`" pattern is already used
elsewhere in this same feature area — see
`src/app/marketplace/page.tsx` around line 682–685:
```tsx
<span className="hidden sm:inline">See all {group.name}</span>
<span className="sm:hidden">See all</span>
```
Apply the equivalent idea to the trigger button's label so it stops being
rigid on narrow phones, freeing the row for the search input.

**The fix:**
In the trigger `<button>` JSX (~line 172–176), change:
```tsx
<span className="whitespace-nowrap">All Categories</span>
```
to hide the label below `sm` (640px) and show it from `sm` up:
```tsx
<span className="hidden whitespace-nowrap sm:inline">All Categories</span>
```
The button already has `aria-label="All categories"` on the `<button>`
element itself (~line 161), so hiding the visible label on small screens
does not regress accessibility — screen readers still announce "All
categories" via the aria-label regardless of the visible content.

Do not change the button's padding/height/icon or any other class — only
the label span's visibility. Do not touch the desktop hover panel or the
mobile drawer (`drawerOpen` block) — this task is only about the trigger
button's own footprint in the header row.

**Verification:**
1. `pnpm lint` passes.
2. At 375×812, open `http://localhost:3000/`. Screenshot the header row
   (MegaMenu trigger + search form). Confirm the trigger button now shows
   icon-only (no "All Categories" text) and is visibly narrower.
3. Measure the compact search input width the same way Task 3 did:
   ```js
   (() => {
     const input = document.getElementById('marketplace-header-search');
     const r = input.getBoundingClientRect();
     return { width: Math.round(r.width) };
   })()
   ```
   This must now be substantially wider than the ~32px broken baseline —
   at least 100px at 375px viewport width, matching Task 3's original
   acceptance bar (now achievable since the actual bottleneck is fixed).
4. Confirm the trigger button is still keyboard/screen-reader accessible:
   check `aria-label` is still present and unchanged on the `<button>`
   (`agent-browser get attr` or inspect the diff — it shouldn't need to
   change since it was never on the `<span>`).
5. Re-check at 640px (`sm` breakpoint) and above that the "All Categories"
   label reappears and the trigger looks like it did before this fix (no
   regression at tablet/desktop widths). Re-check 768px and 1440px for no
   horizontal page overflow, same method as Task 3.
6. Confirm the desktop hover dropdown panel (opens on hover/click at
   `md:` and up — the `{open && (...)}` block) and the mobile drawer (the
   `{drawerOpen && (...)}` block) both still work and are visually
   unchanged — click the trigger at a mobile viewport width to open the
   drawer, screenshot it, confirm it matches Task 3's pre-existing
   behavior (departments list, drill-down, "Browse All Apartments"
   button at the bottom).
