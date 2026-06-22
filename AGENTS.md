<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Alivia Properties — Agent Build Guide

This document is the single source of truth for every AI agent working on this project.
Read it fully before writing a single line of code.

---

## 1. Project Overview

**Alivia Properties** is a dual-purpose real estate platform for Bangladesh.

| Purpose | Description |
|---------|-------------|
| Corporate Developer Website | Showcase Alivia's own projects, build brand trust, generate leads |
| Real Estate Marketplace | Owners/agents list properties; buyers search, save, compare, contact |

**Status:** Backend not ready. All data is dummy. All API calls hit mock route handlers under `/api/mock/`. The architecture is designed so that when the real backend is ready, only `src/services/` and `src/app/api/mock/` change — the UI does not.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.4 — **App Router only, no Pages Router** |
| Language | TypeScript (strict mode) |
| Runtime | React 19.2.4 |
| Styling | Tailwind CSS v4 — uses `@import "tailwindcss"`, no `tailwind.config.js` |
| Component library | shadcn/ui (base-nova preset, Tailwind v4 compatible) |
| Forms | React Hook Form 7 + Zod v4 + @hookform/resolvers |
| Icons | lucide-react |
| Date utilities | date-fns v4 |
| Charts | Recharts 3 |
| Theme | Light-mode only — no dark theme (next-themes removed) |
| Package manager | **pnpm only — never npm or yarn** |

### Critical version notes

- **Zod v4**: `required_error` is removed. Use `z.enum([...], "error message")` not `z.enum([...], { required_error: "..." })`.
- **Tailwind v4**: No `tailwind.config.js`. All theme tokens live in `src/app/globals.css` under `@theme inline { }`. No `theme.extend` — use CSS custom properties instead.
- **shadcn base-nova**: The `form` component was empty in this preset. It was written manually — do not attempt to reinstall it via `pnpm dlx shadcn add form`.
- **Next.js 16**: File-based routing in `src/app/`. `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx` conventions apply. Do not use `getServerSideProps` or `getStaticProps` — those are Pages Router patterns.

---

## 3. Repository Structure

```
alivia-properties-frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (site)/                   # Public website route group
│   │   ├── (auth)/                   # Auth pages route group
│   │   ├── (dashboard)/              # Dashboard route group
│   │   │   ├── admin/
│   │   │   ├── seller/
│   │   │   └── buyer/
│   │   ├── marketplace/              # Marketplace — standalone route group (no layout wrapper)
│   │   │   ├── page.tsx              # /marketplace — hero + category groups
│   │   │   ├── category/[slug]/page.tsx   # /marketplace/category/[slug] — supplier list
│   │   │   └── supplier/[slug]/page.tsx   # /marketplace/supplier/[slug] — profile + products
│   │   ├── api/
│   │   │   ├── mock/                 # Dummy API route handlers
│   │   │   └── _utils/              # Shared API helpers
│   │   ├── globals.css               # Design tokens + Tailwind theme
│   │   ├── layout.tsx                # Root layout
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   └── loading.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components (DO NOT EDIT)
│   │   ├── layout/                   # site-header, site-footer, dashboard-sidebar, etc.
│   │   ├── home/                     # Homepage section components
│   │   ├── projects/                 # Project card, gallery, specs, etc.
│   │   ├── properties/               # Property card, filter sidebar, etc.
│   │   ├── marketplace/              # Marketplace UI components
│   │   │   ├── CategoryCard.tsx      # Category grid card with image + hover
│   │   │   ├── CategorySection.tsx   # Group section (icon, heading, card grid)
│   │   │   ├── CategoryTabs.tsx      # Sticky scroll-spy tab bar (client)
│   │   │   ├── icon-by-name.tsx      # Dynamic lucide icon lookup by string name
│   │   │   ├── MarketplaceHero.tsx   # Hero banner on /marketplace
│   │   │   ├── HowItWorks.tsx        # 3-step process section
│   │   │   ├── SupplierCard.tsx      # Supplier card (links to profile page)
│   │   │   ├── SupplierCTA.tsx       # "List your business" CTA banner
│   │   │   └── ProductCard.tsx       # Product/service card with price + stock status
│   │   ├── forms/                    # All RHF+Zod form components
│   │   ├── dashboard/                # Stat cards, data tables, badges
│   │   ├── chat/                     # Live chat widget
│   │   ├── booking/                  # Calendar, time slot picker
│   │   ├── common/                   # Empty state, pagination, skeletons, etc.
│   │   └── seo/                      # Structured data components
│   │
│   ├── pages-sections/               # Page-specific composition (imports components)
│   │   ├── home/
│   │   ├── projects/
│   │   ├── properties/
│   │   ├── marketplace/
│   │   ├── admin/
│   │   ├── seller/
│   │   ├── buyer/
│   │   ├── consultation/
│   │   ├── contact/
│   │   └── blog/
│   │
│   ├── services/                     # All API calls — NEVER call APIs inside components
│   │   ├── http-client.ts
│   │   ├── projects.service.ts
│   │   ├── properties.service.ts
│   │   ├── inquiries.service.ts
│   │   ├── bookings.service.ts
│   │   ├── users.service.ts
│   │   ├── auth.service.ts
│   │   ├── dashboard.service.ts
│   │   └── mock-config.ts
│   │
│   ├── data/                         # Dummy data (Bangladesh-realistic)
│   │   ├── dummy-projects.ts         # 6 Alivia projects (2 ongoing, 2 upcoming, 2 completed)
│   │   ├── dummy-properties.ts       # 12 marketplace listings
│   │   ├── dummy-users.ts            # 1 admin, 3 sellers, 3 buyers
│   │   ├── dummy-inquiries.ts        # 5 inquiries
│   │   ├── dummy-bookings.ts         # 5 bookings
│   │   ├── dummy-blog-posts.ts       # 6 full-content blog articles
│   │   ├── locations.bd.ts           # 8 divisions, 20+ districts, 50+ areas
│   │   ├── property-types.ts         # Type/purpose/size-unit/price-range options
│   │   ├── amenities.ts              # 6 categories, 30+ amenity items
│   │   ├── dashboard-stats.ts        # Admin stats + chart data + activity feed
│   │   ├── marketplaceCategories.ts  # 5 groups, 62 category items with images + icons
│   │   ├── marketplaceSuppliers.ts   # 24 BD suppliers/providers; getSuppliersForCategory(), getSupplierBySlug()
│   │   └── marketplaceProducts.ts    # 96 products (4 per supplier); getProductsBySupplierId(), getProductsBySupplierSlug()
│   │
│   ├── schemas/                      # Zod v4 validation schemas
│   │   ├── auth.schema.ts
│   │   ├── property.schema.ts
│   │   ├── project.schema.ts         # project lead form
│   │   ├── inquiry.schema.ts
│   │   ├── booking.schema.ts
│   │   ├── contact.schema.ts
│   │   └── report.schema.ts
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── api.types.ts              # ApiResponse<T>, PaginationMeta, ApiError
│   │   ├── project.types.ts          # Project, ProjectStatus, ProjectQueryParams
│   │   ├── property.types.ts         # Property, PropertyType, PropertyStatus, PropertyPurpose
│   │   ├── user.types.ts             # User, Seller, Buyer, Admin, AuthUser, UserRole
│   │   ├── inquiry.types.ts          # Inquiry, InquiryStatus, InquiryType
│   │   ├── booking.types.ts          # Booking, BookingStatus, ConsultationType
│   │   ├── dashboard.types.ts        # DashboardStats, ChartDataPoint, ActivityItem
│   │   ├── marketplace.types.ts      # MarketplaceProduct, Supplier, SupplierKind
│   │   ├── agent.types.ts            # Agent, AgentSpecialty, AgentQueryParams
│   │   ├── review.types.ts           # Review, ReviewSummary, ReviewTargetType
│   │   ├── qa.types.ts               # QAItem, QAQueryParams
│   │   ├── notification.types.ts     # NotificationItem, NotificationType
│   │   ├── document.types.ts         # PropertyDocument, DocumentType
│   │   ├── offer.types.ts            # Offer, OfferStatus, OfferMessage
│   │   ├── bank.types.ts             # Bank
│   │   └── pre-approval.types.ts     # PreApprovalRequest, EmploymentType
│   │
│   ├── utils/
│   │   ├── cn.ts                     # Re-exports cn() from @/lib/utils
│   │   ├── format-price.ts           # BDT crore/lakh formatting with ৳ symbol
│   │   ├── format-date.ts            # date-fns wrappers (formatDate, formatRelative, etc.)
│   │   ├── slugify.ts
│   │   ├── build-query-string.ts
│   │   ├── pagination.ts
│   │   ├── filter-properties.ts      # Client-side property filter + sort
│   │   ├── auth-helpers.ts           # getDashboardRoute(role)
│   │   └── role-redirect.ts          # ROLE_ALLOWED_PREFIXES, isRouteAllowed()
│   │
│   ├── hooks/                        # Custom React hooks (to be created)
│   │
│   ├── config/
│   │   ├── site.config.ts            # Company info, contact, social, stats, founder
│   │   ├── nav.config.ts             # Public nav items with dropdown children
│   │   ├── dashboard-nav.config.ts   # Admin/seller/buyer nav with lucide icon names
│   │   ├── routes.config.ts          # All route path constants (ROUTES.*)
│   │   └── seo.config.ts             # defaultMetadata, organizationSchema(), propertyListingSchema()
│   │
│   ├── lib/
│   │   ├── utils.ts                  # cn() — clsx + tailwind-merge (DO NOT TOUCH)
│   │   ├── constants.ts              # LS keys, page sizes, time slots, status badge styles
│   │   ├── auth-placeholder.ts       # Dummy localStorage auth helpers
│   │   └── validations.ts            # Regex + pure validation helpers
│   │
│   ├── auth.ts                       # Auth.js v5 config — exports { auth, handlers, signIn, signOut }
│   ├── proxy.ts                      # Next.js 16 route protection (replaces middleware.ts)
│   └── types/
│       └── next-auth.d.ts            # Augments Session/JWT with role: UserRole, isVerified: boolean
│
├── components.json                   # shadcn/ui config
├── tsconfig.json                     # paths: "@/*" → "./src/*"
├── .env.example
├── .env.local                        # AUTH_SECRET (git-ignored)
├── .claude/commands/caveman.md       # /caveman debug slash command
├── .claude/skills/caveman/SKILL.md
└── AGENTS.md                         # This file
```

---

## 4. Architecture Rules — Must Follow

### 4.1 Data flow
```
Page (Server Component)
  └── calls service function
        └── service → httpClient.get(ROUTES.API.PROPERTIES)
              └── mock route handler → reads dummy data → returns ApiResponse<T>
```

- **Never** fetch inside a UI component.
- **Never** import from `src/data/` inside a component — only services and mock route handlers do that.
- **Always** go through `src/services/`.

### 4.2 Server vs Client Components

- Default: **Server Components**. No `"use client"` unless you need browser APIs, state, or event handlers.
- Client components live in `src/components/` and are small, focused pieces.
- Pages in `src/app/` are Server Components that call service functions at the top.
- Wrap Client Components in Suspense with a skeleton fallback.

### 4.3 API response shape

Every mock route handler must return this exact shape:

```typescript
type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  meta?: { page: number; limit: number; total: number; totalPages: number }
}
```

Use `src/app/api/_utils/api-response.ts` helpers — do not build raw Response objects in route handlers.

### 4.4 Import alias

Always use `@/` not relative paths. Example: `import { ROUTES } from "@/config/routes.config"`.

### 4.5 cn() usage

```typescript
import { cn } from "@/lib/utils"   // preferred (shadcn standard)
// or
import { cn } from "@/utils/cn"    // re-export — both work
```

### 4.6 Styling rules

- Use Tailwind utilities. No inline `style={{}}` except for dynamic values (e.g. computed widths).
- Use brand tokens: `bg-brand-600`, `text-brand-700`, `bg-gold-400` — defined in `globals.css`.
- Use semantic helpers defined in `globals.css`: `.container-page`, `.section-y`, `.text-h1`, `.text-eyebrow`, `.text-lead`.
- Status badge colors are pre-defined in `src/lib/constants.ts` → `PROPERTY_STATUS_STYLES`, `BOOKING_STATUS_STYLES`, etc.

### 4.7 Forms

All forms use React Hook Form + Zod v4 + shadcn `Form` component pattern:

```typescript
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { inquirySchema, type InquiryInput } from "@/schemas/inquiry.schema"

const form = useForm<InquiryInput>({ resolver: zodResolver(inquirySchema) })
```

### 4.8 Price formatting

Always use `formatPrice()` from `@/utils/format-price.ts`. Never write raw BDT numbers in UI.

```typescript
formatPrice(13_500_000)        // "৳1 Crore 35 Lakh"
formatPrice(13_500_000, true)  // "৳1.35 Cr"
formatRent(65_000)             // "৳65,000/month"
```

### 4.9 localStorage keys

Use constants from `@/lib/constants.ts`:
- `LS_SAVED_PROPERTIES` = `"alivia_saved_properties"`
- `LS_COMPARE_LIST` = `"alivia_compare_list"`
- `LS_RECENT_SEARCHES` = `"alivia_recent_searches"`
- `LS_AUTH_USER` = `"alivia_auth_user"`

---

## 5. Design System

### 5.1 Brand colors (Tailwind utilities)

| Utility | Use |
|---------|-----|
| `bg-brand-600` / `text-brand-700` | Primary CTAs, links, active states |
| `bg-brand-50` / `text-brand-800` | Subtle brand tints, pill backgrounds |
| `bg-gold-400` / `text-gold-700` | Luxury highlight, verified badge, featured badge |
| `bg-ink-100` | Alternate section backgrounds |
| `text-success` / `text-warning` / `text-danger` | Status colors |

### 5.2 Typography utilities (defined in globals.css)

| Class | Use |
|-------|-----|
| `.text-display` | Hero banners, 4.5rem |
| `.text-h1` | Page titles, 4–5xl |
| `.text-h2` | Section titles, 3–4xl |
| `.text-h3` | Card headings, 2–3xl |
| `.text-eyebrow` | Small uppercase labels above headings |
| `.text-lead` | Subtitle text under headings |
| `.text-meta` | Property specs, dates, labels |
| `.text-caption` | Tiny helper text |

### 5.3 Layout helpers

```html
<main class="container-page">          <!-- max-w-7xl, responsive gutters -->
<section class="section-y">           <!-- py-16 md:py-24 -->
<section class="section-y-sm">        <!-- py-10 md:py-14 -->
```

### 5.4 Shadows (CSS variables)

```css
var(--shadow-card)      /* subtle card shadow */
var(--shadow-elevated)  /* hover / active cards */
var(--shadow-pop)       /* modals, dropdowns */
```

Use with inline style or extend Tailwind: `style={{ boxShadow: "var(--shadow-elevated)" }}`.

---

## 6. Build Steps — Status & Detailed Instructions

### ✅ STEP 1 — Foundation (COMPLETE)

Everything is set up. Do not redo:
- `src/` directory structure
- `tsconfig.json` path alias
- All npm dependencies
- shadcn/ui + 22 components
- `src/app/globals.css` design tokens

---

### ✅ STEP 2 — Data Backbone (COMPLETE)

Do not recreate:
- All files in `src/types/`
- All files in `src/schemas/`
- All files in `src/config/`
- All files in `src/data/`
- All files in `src/utils/`
- All files in `src/lib/`

---

### ✅ STEP 3 — Mock API Route Handlers (COMPLETE)

All route handlers live under `src/app/api/mock/`. Do not recreate.

**Built:**
- `src/app/api/_utils/api-response.ts` — `ok()`, `created()`, `notFound()`, `badRequest()`
- `src/app/api/_utils/pagination.ts` — `paginateArray<T>()`
- `src/app/api/mock/projects/route.ts` — GET with status/featured/page/limit filters
- `src/app/api/mock/projects/[slug]/route.ts` — GET by slug
- `src/app/api/mock/properties/route.ts` — GET (filtered) + POST
- `src/app/api/mock/properties/[slug]/route.ts` — GET + PATCH + DELETE
- `src/app/api/mock/properties/store.ts` — in-memory mutable store for POST/PATCH/DELETE
- `src/app/api/mock/inquiries/route.ts` — GET + POST
- `src/app/api/mock/bookings/route.ts` — GET + POST
- `src/app/api/mock/users/route.ts` — GET (sellers + buyers, no passwords)
- `src/app/api/mock/dashboard-stats/route.ts` — GET stats + chart data + activity
- `src/app/api/mock/auth/route.ts` — POST login (superseded by Auth.js but kept)

---

### ✅ STEP 4 — Service Layer + Custom Hooks (COMPLETE)

Do not recreate.

**Services (`src/services/`):**
- `http-client.ts` — uses absolute URL server-side via `NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"` fallback
- `mock-config.ts`
- `projects.service.ts`, `properties.service.ts`, `inquiries.service.ts`, `bookings.service.ts`
- `users.service.ts`, `auth.service.ts`, `dashboard.service.ts`

**Hooks (`src/hooks/`):**
- `use-debounce.ts`, `use-property-filters.ts`, `use-save-property.ts`
- `use-compare-properties.ts`, `use-mobile.ts`

**Critical note — server-side fetch:** All server components that call services must add:
```typescript
export const dynamic = "force-dynamic"
```
Without this, Next.js 16 tries to statically generate the page at build time, which fails because relative URLs have no host.

---

### ✅ STEP 5 — Shared Layout + Common Components (COMPLETE)

Do not recreate.

**Layout components (`src/components/layout/`):**
- `site-header.tsx` — sticky, scroll-shadow, session-aware CTA, mobile hamburger
- `site-footer.tsx` — 4-column, inline SVG social icons (lucide-react v1.14 dropped Facebook/Instagram/Youtube/Linkedin)
- `dashboard-sidebar.tsx` — dynamic lucide icon lookup, active highlight, mobile-collapsible
- `dashboard-shell.tsx` — sidebar + main area composition wrapper
- `dashboard-header.tsx` — breadcrumb + user avatar dropdown with logout
- `mobile-nav.tsx` — Sheet-based slide-in nav

**Common components (`src/components/common/`):**
- `section-header.tsx`, `page-container.tsx`, `empty-state.tsx`, `error-state.tsx`
- `loading-card.tsx`, `image-placeholder.tsx`, `pagination.tsx`, `verified-badge.tsx`

**SEO:** `src/components/seo/structured-data.tsx`

**Note:** lucide-react v1.14 removed social icons. `site-footer.tsx` uses inline SVG components (`FacebookIcon`, `InstagramIcon`, `YoutubeIcon`, `LinkedinIcon`) — do not attempt to import these from lucide.

---

### ✅ STEP 6 — Public Site Pages (COMPLETE)

Do not recreate. Route group: `src/app/(site)/`

**Built pages:**
- `/` — Homepage (hero search, project tabs, property grid, stats, trust, testimonials, CTA, blog preview)
- `/projects` — Project listing with status tabs
- `/projects/[slug]` — Project detail (gallery, specs, amenities, lead form)
- `/properties` — Property listing (filter sidebar, grid/list toggle, sort, URL-synced filters)
- `/properties/[slug]` — Property detail (gallery, specs, contact card, inquiry form, mortgage calc, similar)
- `/map-search` — Split view with map placeholder
- `/compare` — Side-by-side comparison table (localStorage-driven)
- `/consultation` — Booking form with date/time picker
- `/about-us` — Company story, founder, timeline, stats
- `/contact-us` — Contact form + info
- `/blog` — Category-filtered post grid
- `/blog/[slug]` — Full article with related posts

**Advanced property features (also built in this step):**
- `src/components/properties/save-button.tsx` — heart toggle, uses `useSaveProperty()`
- `src/components/properties/compare-button.tsx` — uses `useCompareProperties()`, max 4
- `src/components/properties/compare-float-bar.tsx` — floating bar when ≥ 2 selected
- `src/components/properties/filter-sidebar.tsx` — all filter fields, URL-synced
- `src/components/properties/report-listing-dialog.tsx` — Dialog + `reportSchema`
- `src/components/properties/mortgage-calculator.tsx` — EMI formula, shown in property detail sidebar
- `src/components/properties/recent-search-recorder.tsx` — writes to `LS_RECENT_SEARCHES`
- `src/components/projects/project-card.tsx`
- `src/components/properties/property-card.tsx`
- `src/components/chat/live-chat-widget.tsx` — floating chat, dummy auto-reply, mounted in root layout

---

### ✅ STEP 7 — Auth Pages + Route Protection (COMPLETE)

Do not recreate.

**Auth setup:**
- `src/auth.ts` — Auth.js v5 (next-auth@beta) with Credentials provider; JWT strategy; `role` + `isVerified` in token/session
- `src/types/next-auth.d.ts` — augments `User`, `Session`, `JWT` with `role: UserRole` and `isVerified: boolean`
- `src/app/api/auth/[...nextauth]/route.ts` — `export const { GET, POST } = handlers`
- `.env.local` — `AUTH_SECRET` set

**⚠ Next.js 16 breaking change:** Route protection file is `src/proxy.ts`, NOT `src/middleware.ts`. Next.js 16 deprecated `middleware.ts` in favour of `proxy.ts`. The file exports `auth` from `src/auth.ts` as default and a `config` matcher.

**Auth pages (`src/app/(auth)/`):**
- `/login` — Credentials form + demo quick-fill buttons (admin/seller/buyer); `signIn("credentials", { redirect: false })` → role-based redirect via `getDashboardRoute()`
- `/register` — Name/email/phone/role/password form; dummy success → redirect login
- `/forgot-password` — Email field, dummy success message

**Unauthorized:** `src/app/unauthorized/page.tsx`

**Session in components:** Use `useSession()` from `next-auth/react` (client) or `auth()` from `@/auth` (server). Root layout is async and passes server session to `SessionProvider`.

---

### ✅ STEP 8 — Admin Dashboard (COMPLETE)

Do not recreate. Route group: `src/app/(dashboard)/admin/`

**Shared dashboard components (`src/components/dashboard/`):**
- `stat-card.tsx` — icon, label, value, trend badge
- `data-table.tsx` — generic typed table with column renderer
- `listing-status-badge.tsx`, `inquiry-status-badge.tsx`, `booking-status-badge.tsx`
- `dashboard-page-header.tsx` — title + description + actions slot

**Admin layout:** `src/app/(dashboard)/admin/layout.tsx` — renders `DashboardShell` with `adminNav`

**Built pages:**
- `/admin/dashboard` — 8 stat cards, bar chart (Recharts), pie chart, recent activity feed
- `/admin/properties` — data table with status/type filter bar, action buttons
- `/admin/pending-listings` — pre-filtered to `status=pending`, Approve/Reject prominent
- `/admin/projects` — Alivia projects table with status toggle
- `/admin/users` — tabbed (All/Sellers/Buyers) user table
- `/admin/sellers` — seller verification table
- `/admin/inquiries` — inquiry management table
- `/admin/bookings` — booking management table
- `/admin/reports` — report submissions table
- `/admin/blog` — blog posts with publish toggle
- `/admin/settings` — placeholder settings form

---

### ✅ STEP 9 — Seller Dashboard (COMPLETE)

Do not recreate. Route group: `src/app/(dashboard)/seller/`

**Seller layout:** `src/app/(dashboard)/seller/layout.tsx` — renders `DashboardShell` with `sellerNav`

**Built pages:**
- `/seller/dashboard` — stat cards, recent inquiries table, recent listings
- `/seller/properties` — seller's own properties table with edit/delete
- `/seller/properties/create` — full property form via `src/components/forms/property-form.tsx`
- `/seller/properties/[id]/edit` — same form pre-filled
- `/seller/inquiries` — inquiries for seller's properties
- `/seller/bookings` — bookings related to seller's properties
- `/seller/profile` — edit profile form

**Shared form:** `src/components/forms/property-form.tsx` — reusable RHF+Zod form used by both create and edit pages

---

### ✅ STEP 10 — Buyer Dashboard + Advanced Features (COMPLETE)

Do not recreate. Route group: `src/app/(dashboard)/buyer/`

**Buyer layout:** `src/app/(dashboard)/buyer/layout.tsx` — renders `DashboardShell` with `buyerNav`

**Built pages:**
- `/buyer/dashboard` — stat cards, saved properties grid, recent searches list
- `/buyer/saved-properties` — reads `LS_SAVED_PROPERTIES`, grid view
- `/buyer/recent-searches` — reads `LS_RECENT_SEARCHES`, list with "Search again" links
- `/buyer/inquiries` — buyer's sent inquiries table
- `/buyer/bookings` — buyer's consultation bookings table
- `/buyer/profile` — edit profile form

---

### ✅ STEP 11 — Listing Depth, Transaction Tools, Social + Trust (COMPLETE)

Three feature bundles added on top of the existing detail page + new top-level pages. Compact, data-dense UI: tight padding, small type, info-rich rows. Brand teal + gold tokens unchanged.

**New types (`src/types/`):**
- `agent.types.ts` — `Agent`, `AgentSpecialty`, `AgentQueryParams`
- `review.types.ts` — `Review`, `ReviewSummary`, `ReviewTargetType`, `ReviewQueryParams`
- `qa.types.ts` — `QAItem`, `QAQueryParams`
- `notification.types.ts` — `NotificationItem`, `NotificationType`
- `document.types.ts` — `PropertyDocument`, `DocumentType`
- `offer.types.ts` — `Offer`, `OfferStatus`, `OfferMessage`, `OfferQueryParams`
- `bank.types.ts` — `Bank`
- `pre-approval.types.ts` — `PreApprovalRequest`, `EmploymentType`

**New Zod schemas (`src/schemas/`):** `review.schema.ts`, `qa.schema.ts`, `offer.schema.ts`, `pre-approval.schema.ts`

**New dummy data (`src/data/`):** `dummy-agents.ts` (6), `dummy-reviews.ts` (6), `dummy-qa.ts` (4), `dummy-notifications.ts` (7), `dummy-documents.ts` (6), `dummy-banks.ts` (7 BD partner banks), `dummy-offers.ts` (2)

**New mock API routes (`src/app/api/mock/`):**
- `agents/route.ts` (GET filtered) + `agents/[slug]/route.ts` (GET)
- `reviews/route.ts` (GET with summary, POST)
- `qa/route.ts` (GET, POST question, POST `action:"answer"`)
- `notifications/route.ts` (GET unread count, PATCH read / mark-all)
- `documents/route.ts` (GET by propertyId)
- `banks/route.ts` (GET, sorted by interest rate)
- `offers/route.ts` (GET filtered, POST submit, POST `action:"counter"|"accept"|"reject"|"withdraw"`)
- `pre-approval/route.ts` (POST — DTI < 0.5 → approved; auto-EMI calc)

**New services (`src/services/`):** `agents.service.ts`, `reviews.service.ts`, `qa.service.ts`, `notifications.service.ts`, `documents.service.ts`, `banks.service.ts`, `offers.service.ts`, `pre-approval.service.ts`

**Listing-depth components (`src/components/properties/`):**
- `virtual-tour.tsx` — embedded 360° iframe with poster + fullscreen
- `floor-plan.tsx` — multi-level tabs, zoom, lightbox
- `photo-lightbox.tsx` — gallery + keyboard nav (←/→/Esc) modal
- `video-reel.tsx` — vertical 9:16 reel carousel with mute toggle
- `document-vault.tsx` — verified-count header, per-doc verified/pending state

**Transaction-tools components:**
- `properties/emi-bank-compare.tsx` — sortable table across 7 banks (rate / EMI / approval days / rating)
- `properties/roi-calculator.tsx` — gross/net yield, total return, break-even with 5 sliders
- `properties/moving-checklist.tsx` — 16 tasks × 8 weeks, persists to `localStorage` key `alivia_moving_checklist`
- `properties/offer-flow.tsx` — Dialog form with contingency chips, +/- vs list price
- `forms/pre-approval-form.tsx` — RHF + Zod, indicative result tile

**Social + Trust components:**
- `common/star-rating.tsx` — `<StarRating value count showValue size />`
- `properties/reviews-section.tsx` — distribution bars + post-review form (target = property | agent | project)
- `properties/qa-section.tsx` — upvote, agent-answered card, ask-question form
- `agents/agent-card.tsx` — compact card with rating, areas, response time
- `layout/notifications-bell.tsx` — bell + unread badge + dropdown panel + mark-all

**New pages (route group `(site)`):**
- `/agents` + `/agents/[slug]` — listing + agent profile (cover, bio, contact, specialties, listings, reviews tied to `targetType: "agent"`)
- `/pre-approval` — pre-approval form
- `/moving-checklist` — checklist
- `/notifications` — full activity list

**Property detail integration (`/properties/[slug]`):**
Added below Description: VirtualTour + FloorPlan side-by-side, VideoReel, DocumentVault, RoiCalculator + EmiBankCompare (sale only), QASection, ReviewsSection. Sidebar adds OfferFlow above MortgageCalculator (sale only).

**Routes added to `routes.config.ts`:**
- Public: `AGENTS`, `AGENT_DETAIL(slug)`, `PRE_APPROVAL`, `MOVING_CHECKLIST`, `OFFER_NEW(slug)`, `NOTIFICATIONS`
- API: `AGENTS`, `AGENT(slug)`, `REVIEWS`, `QA`, `NOTIFICATIONS`, `DOCUMENTS`, `BANKS`, `OFFERS`, `PRE_APPROVAL`

**Public nav update (`nav.config.ts`):** new top-level **Agents** link + **Tools** dropdown (Pre-Approval, Moving Checklist, Compare, Consultation).

**Lint quirk:** React Compiler's `react-hooks/set-state-in-effect` rule is strict. New components that load data via `useEffect` use `// eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps` above the `load()` call. Don't refactor away — this is intentional fetch-on-mount and the rule does not understand it.

**Avoid:**
- Importing dummy data inside components (only services/mock routes — same rule as before)
- Replacing brand teal/gold tokens with the design-system suggestion's teal palette — design system was used for compact/data-dense layout decisions only; brand colors stay
- Re-importing social icons from `lucide-react` (still removed in v1.14)
- Putting `<Button>` *inside* `<DialogTrigger>` — Base-UI uses `render={<Button .../>}`. See `offer-flow.tsx` and `report-listing-dialog.tsx`

---

### ✅ STEP 12 — Marketplace (COMPLETE)

Do not recreate. Marketplace lives at `src/app/marketplace/` (outside all route groups — no shared layout, uses root layout directly).

**New routes added to `routes.config.ts`:**
- `MARKETPLACE` = `"/marketplace"`
- `MARKETPLACE_CATEGORY(slug)` = `"/marketplace/category/${slug}"`
- `MARKETPLACE_SUPPLIER(slug)` = `"/marketplace/supplier/${slug}"`

**Header changes (`src/components/layout/site-header.tsx`):**
- Gold shimmer pill added to top info strip: `<Link href={ROUTES.MARKETPLACE}>` with `ShoppingBag` + `Sparkles` icons and a shine-sweep hover animation
- Nav link added to `nav.config.ts` with `highlight: true`
- `siteConfig.marketplaceUrl` added to `site.config.ts` (defaults to `"/marketplace"`)

**Data files (all in `src/data/`):**
- `marketplaceCategories.ts` — 5 `MarketplaceGroup` objects, 62 `MarketplaceItem` entries, each with `name`, `slug`, `description`, `icon` (lucide name), `imageUrl` (Unsplash), optional `badge`. Exports `marketplaceGroups`.
- `marketplaceSuppliers.ts` — 24 Bangladesh-realistic `Supplier` objects (mix of `"supplier"` and `"service"` kind). Tagged with `categories: string[]` array. Exports `getSuppliersForCategory(slug)` and `getSupplierBySlug(slug)`.
- `marketplaceProducts.ts` — 96 `MarketplaceProduct` objects (4 per supplier). Exports `getProductsBySupplierId(id)`, `getProductsBySupplierSlug(slug)`, `getProductsByCategory(slug)`.

**Types (`src/types/marketplace.types.ts`):**
- `MarketplaceProduct` — id, slug, name, supplierId, categorySlug, image, price (BDT number), unit, description, inStock, moq?, leadTimeDays?, brand?, rating?, reviewCount?, badge?
- `SupplierKind` — `"supplier" | "service"`
- `Supplier` — full profile type with categories, serviceAreas, brands, certifications, priceRange, isVerified, isFeatured

**Components (`src/components/marketplace/`):**
- `icon-by-name.tsx` — client component with double-cast dynamic lucide lookup: `((Icons as unknown) as Record<string, Icons.LucideIcon>)[name] ?? Icons.Circle`
- `CategoryCard.tsx` — 4:3 image + gradient + icon chip + badge chip; links to `/marketplace/category/[slug]`
- `CategorySection.tsx` — group heading (icon square + eyebrow + title + tagline) + 6-col card grid; `scroll-mt-32 md:scroll-mt-36` for sticky bar offset
- `CategoryTabs.tsx` — **client**; sticky scroll-spy tab bar with: shadow-on-scroll elevation, brand→gold gradient progress stripe, icon chip per tab, count badge, gold underline indicator on active, horizontal gradient edge fades, tab rail auto-scrolls to active on click
- `MarketplaceHero.tsx` — hero banner on the main marketplace page
- `SupplierCTA.tsx` — "List your business" call-to-action section
- `HowItWorks.tsx` — 3-step process illustration
- `SupplierCard.tsx` — 16:9 cover image wrapped in `<Link href={ROUTES.MARKETPLACE_SUPPLIER(s.slug)}>`, rating chip, kind/featured badges, meta row, price-range strip with verified badge, brand chips, Call + WhatsApp buttons
- `ProductCard.tsx` — 4:3 image, badge/stock chip, rating chip, brand pill, name, description, MOQ/lead-time meta, formatted price (auto BDT Lakh for ≥10L), in-stock indicator

**Pages:**
- `src/app/marketplace/page.tsx` — Server Component; renders `MarketplaceHero`, `CategoryTabs` (client), then maps `marketplaceGroups` → `CategorySection`; then `SupplierCTA` + `HowItWorks`
- `src/app/marketplace/category/[slug]/page.tsx` — Server Component; hero with cover image + gradient, supplier count/verified/featured chips, `getSuppliersForCategory(slug)` → grid of `SupplierCard`, empty-state card, sidebar with consult card + related categories
- `src/app/marketplace/supplier/[slug]/page.tsx` — Server Component; hero with cover image + gradient, supplier stats strip, product grid via `getProductsBySupplierId`, empty-state, sidebar with contact buttons + service areas + brands + certifications + category links

**Architecture exception — direct data imports:**
Marketplace pages import directly from `src/data/marketplaceCategories`, `marketplaceSuppliers`, and `marketplaceProducts` without going through `src/services/`. This is intentional: marketplace catalogue data is static (no backend API exists for it). When a backend is added, create service functions and swap the imports in the three page files only. Do **not** import these data files inside any UI component — only the pages and any future mock route handlers may do so.

**Product price formatting:**
`ProductCard.tsx` uses a local `fmtPrice(price)` helper rather than the global `formatPrice()` utility, because product prices span a far wider range (৳11.5/brick → ৳25L/lift) than property prices and need different thresholds. Do not replace with `formatPrice()`.

**Avoid:**
- Creating a mock API route for marketplace catalogue data — it is static and consumed by Server Components directly
- Adding `export const dynamic = "force-dynamic"` to marketplace pages — they don't call any service/fetch
- Importing `marketplaceCategories/Suppliers/Products` inside any client component

---

## 7. Running the Project

```bash
pnpm dev          # development server
pnpm build        # production build — must pass before committing
pnpm lint         # ESLint — must pass before committing
pnpm start        # serve production build
```

**After every step, run `pnpm build` and `pnpm lint` and fix all errors before moving on.**

---

## 8. Quick Reference — Key File Locations

| What you need | Where it is |
|---------------|------------|
| All route paths | `src/config/routes.config.ts` → `ROUTES.*` |
| Site info / contact | `src/config/site.config.ts` → `siteConfig.*` |
| Public navigation | `src/config/nav.config.ts` → `publicNav` |
| Dashboard navigation | `src/config/dashboard-nav.config.ts` → `adminNav`, `sellerNav`, `buyerNav` |
| SEO metadata | `src/config/seo.config.ts` → `defaultMetadata`, `organizationSchema()` |
| Brand colors | `src/app/globals.css` → `--color-brand-*`, `--color-gold-*` |
| Typography classes | `src/app/globals.css` → `.text-h1`, `.text-eyebrow`, `.container-page` |
| Status badge styles | `src/lib/constants.ts` → `PROPERTY_STATUS_STYLES`, etc. |
| localStorage keys | `src/lib/constants.ts` → `LS_*` |
| BDT price format | `src/utils/format-price.ts` → `formatPrice(amount, short?)` |
| Date format | `src/utils/format-date.ts` → `formatDate(date, pattern?)` |
| Property filter | `src/utils/filter-properties.ts` → `filterProperties(properties, params)` |
| All TypeScript types | `src/types/*.types.ts` |
| All Zod schemas | `src/schemas/*.schema.ts` |
| Dummy data | `src/data/dummy-*.ts` |
| Static option lists | `src/data/locations.bd.ts`, `src/data/property-types.ts`, `src/data/amenities.ts` |
| Dummy auth helper | `src/lib/auth-placeholder.ts` → `getAuthUser()`, `setAuthUser()`, `clearAuthUser()` |

---

## 9. Common Mistakes to Avoid

| Wrong | Right |
|-------|-------|
| `import data from "@/data/dummy-properties"` inside a component | Import in service or route handler only |
| `fetch("/api/mock/properties")` inside a component | Call `propertiesService.getProperties()` |
| `z.enum(["a", "b"], { required_error: "..." })` | `z.enum(["a", "b"], "...")` (Zod v4) |
| `style="color: green"` | `className="text-success"` |
| Hard-coded price strings like `"৳1.35 Crore"` | `formatPrice(13_500_000, true)` |
| `"use client"` at the top of every file | Only add when you need state, effects, or browser APIs |
| `<img src="...">` | `<Image src="..." alt="..." width={} height={} />` from `next/image` |
| Relative imports: `../../lib/utils` | Alias: `@/lib/utils` |
| Adding shadcn form: `pnpm dlx shadcn add form` | Already written manually at `src/components/ui/form.tsx` |
| `DropdownMenuTrigger asChild` | Base Nova preset has no `asChild` — put content directly inside trigger |
| `import { Facebook } from "lucide-react"` | lucide-react v1.14 dropped social icons — use inline SVGs |
| `src/middleware.ts` for route protection | Next.js 16 deprecated this — use `src/proxy.ts` instead |
| `useSession()` in a Server Component | Server: `await auth()` from `@/auth`; Client: `useSession()` from `next-auth/react` |
| Server page fetching without `force-dynamic` | Add `export const dynamic = "force-dynamic"` to any page that calls a service |
| Accessing `params.slug` directly | Next.js 16: params is a Promise — use `const { slug } = await params` |
| `(Icons as Record<string, LucideIcon>)[name]` | Double cast: `((Icons as unknown) as Record<string, Icons.LucideIcon>)[name]` |
| Importing `marketplaceCategories/Suppliers/Products` in a UI component | Only marketplace **page files** and future mock route handlers may import these |
| Adding `export const dynamic = "force-dynamic"` to marketplace pages | Marketplace pages read static data files, not services — no fetch involved |
| Calling `formatPrice()` on marketplace product prices | Use the local `fmtPrice()` helper in `ProductCard.tsx` — product prices span ৳11.5 to ৳25L, a different range than property prices |
