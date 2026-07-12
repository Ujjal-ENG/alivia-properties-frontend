# Projects Mobile Responsive Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two verified mobile-layout bugs on the Projects feature (project detail unit-pricing table, and the site-wide live-chat widget) so they render correctly on iPhone- and Samsung-class phones, without touching the existing Liquid Glass styling.

**Architecture:** Both fixes are surgical CSS/className changes to existing markup — no new components, no new dependencies, no breakpoint-conditional duplicate markup. Task 1 turns an already-narrow data table into a horizontally-scrollable table (the same `overflow-x-auto` pattern already used by `ProjectAtAGlance` and `ProjectGallery` elsewhere in this codebase). Task 2 makes the live-chat panel's width responsive to viewport width instead of a fixed `22rem`, reusing the existing `cn()` helper already used throughout the codebase for conditional classes.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4 (utility classes only, no config file — see `alivia-properties-frontend/AGENTS.md`).

## Global Constraints

- Package manager is `pnpm` only — never npm/yarn (workspace `AGENTS.md`).
- No dark mode, no `dark:` utilities — this app is light-mode only (`design-direction-liquid-glass` memory).
- Do not modify `.liquid-glass*` / `.surface-card` / `.surface-panel` class definitions in `src/app/globals.css` — the glass system already applies at every breakpoint site-wide and both bugs here are layout bugs, not glass-styling bugs.
- Verification in this repo is `pnpm build && pnpm lint` (no Jest/Vitest/Playwright is installed — confirmed via `package.json`). "Tests" in this plan means: build clean, lint clean, and a manual visual check with `agent-browser` at two mobile viewports.
- Use two device widths for every visual check: **iPhone 14** (`agent-browser set device "iPhone 14"`, 390×844) and **Galaxy S25** (`agent-browser set device "Galaxy S25"`, 360×800 — the narrower of the two, and the one that exposes both bugs most clearly).
- The frontend dev server must be running on `http://localhost:3000` (`pnpm dev` from `alivia-properties-frontend/`) and the backend on `http://localhost:3001` (`pnpm dev:up` then `pnpm start:dev` from `alivia-properties-backend/`, after `pnpm prisma:generate` + `pnpm db:push`) for the visual checks — the `/projects` routes call the live API (`export const dynamic = "force-dynamic"`), they do not fall back to mock data.
- A known project slug for manual testing: `/projects/alivia-heights-2` (has 2 unit types, so the pricing table is populated).

---

### Task 1: Make the project detail "Unit Types & Pricing" table horizontally scrollable on mobile

**Problem (verified via agent-browser screenshots):** On `/projects/[slug]`, the "Unit Types & Pricing" table (`src/app/(site)/projects/[slug]/page.tsx`) is wrapped in a `overflow-hidden` div with no horizontal scroll. Its 4 columns (Type, Size, Price Range, Available) have no `whitespace-nowrap`, so on a 390px iPhone viewport the "Price Range" cell text wraps to 2 lines, and on a 360px Galaxy viewport it wraps to 4 lines (e.g. `৳96.3\nL –\n৳96.3\nL`), making the table look broken and hard to read. `ProjectAtAGlance` (`src/components/projects/project-at-a-glance.tsx:38`) already solves an equivalent problem correctly with `<div className="overflow-x-auto">` — this task applies the same established pattern here.

**Files:**
- Modify: `src/app/(site)/projects/[slug]/page.tsx:369-417` (the "Unit price table" block)

**Interfaces:**
- Consumes: `project.units` (`Project["units"]`, already destructured in this file as `hasUnits = (project.units ?? []).length > 0`) — no signature changes.
- Produces: nothing consumed by later tasks — this file is not touched by Task 2.

- [ ] **Step 1: Confirm the current (broken) rendering**

With both dev servers running, in a terminal run:

```bash
agent-browser set device "Galaxy S25"
agent-browser open http://localhost:3000/projects/alivia-heights-2
agent-browser wait --load networkidle
agent-browser find text "Unit Types" scrollintoview 2>/dev/null || true
agent-browser scroll down 100
agent-browser screenshot /tmp/task1-before.png
```

Expected: `/tmp/task1-before.png` shows the "Price Range" column text wrapped across 3-4 lines inside each row.

- [ ] **Step 2: Edit the table markup**

In `src/app/(site)/projects/[slug]/page.tsx`, replace the `hasUnits` block (currently lines 369-417):

```tsx
            {/* Unit price table */}
            {hasUnits ? (
              <div>
                <h2 className="text-h3 mb-4">Unit Types & Pricing</h2>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-ink-50 text-xs uppercase text-muted-foreground">
                      <tr>
                        {["Type", "Size", "Price Range", "Available"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-4 py-2.5 text-left font-semibold"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(project.units ?? []).map((unit) => (
                        <tr
                          key={unit.type ?? unit.name}
                          className="hover:bg-ink-50"
                        >
                          <td className="px-4 py-3 font-medium">
                            {unit.type ?? unit.name}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {unit.size}
                          </td>
                          <td className="px-4 py-3 text-brand-700 font-semibold">
                            {unit.priceFrom != null && unit.priceTo != null
                              ? formatPriceRange(unit.priceFrom, unit.priceTo)
                              : unit.price != null
                                ? formatPriceRange(unit.price, unit.price)
                                : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {unit.available ?? "—"}/
                            {unit.total ?? unit.available ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
```

with:

```tsx
            {/* Unit price table */}
            {hasUnits ? (
              <div>
                <h2 className="text-h3 mb-4">Unit Types & Pricing</h2>
                <div className="overflow-x-auto rounded-xl border border-border [scrollbar-width:thin] [scrollbar-color:var(--color-brand-300)_transparent]">
                  <table className="w-full text-sm">
                    <thead className="bg-ink-50 text-xs uppercase text-muted-foreground">
                      <tr>
                        {["Type", "Size", "Price Range", "Available"].map(
                          (h) => (
                            <th
                              key={h}
                              className="whitespace-nowrap px-4 py-2.5 text-left font-semibold"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(project.units ?? []).map((unit) => (
                        <tr
                          key={unit.type ?? unit.name}
                          className="hover:bg-ink-50"
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-medium">
                            {unit.type ?? unit.name}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                            {unit.size}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-brand-700 font-semibold">
                            {unit.priceFrom != null && unit.priceTo != null
                              ? formatPriceRange(unit.priceFrom, unit.priceTo)
                              : unit.price != null
                                ? formatPriceRange(unit.price, unit.price)
                                : "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {unit.available ?? "—"}/
                            {unit.total ?? unit.available ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
```

The only changes: the wrapper div's className (`overflow-hidden` → `overflow-x-auto` + thin scrollbar styling, matching `ProjectGallery`'s existing scrollbar treatment at `src/components/projects/project-gallery.tsx:64`), and `whitespace-nowrap` added to all four `<th>` and `<td>` class strings.

- [ ] **Step 3: Run build and lint**

Run: `pnpm build && pnpm lint`
Expected: both exit 0, no new errors or warnings.

- [ ] **Step 4: Verify visually on both viewports**

```bash
agent-browser set device "iPhone 14"
agent-browser open http://localhost:3000/projects/alivia-heights-2
agent-browser wait --load networkidle
agent-browser scroll down 900
agent-browser screenshot /tmp/task1-after-iphone.png

agent-browser set device "Galaxy S25"
agent-browser reload
agent-browser wait --load networkidle
agent-browser scroll down 900
agent-browser screenshot /tmp/task1-after-galaxy.png
```

Expected in both screenshots: every table cell renders on a single line; if the table is wider than the viewport, the table itself scrolls horizontally within its rounded border (the rest of the page does not gain horizontal scroll — confirm with `agent-browser eval "({scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth})"`, both values must be equal).

- [ ] **Step 5: Commit**

```bash
git add "src/app/(site)/projects/[slug]/page.tsx"
git commit -m "fix: make project unit pricing table horizontally scrollable on mobile"
```

---

### Task 2: Fix the live-chat widget overflowing the viewport on narrow phones

**Problem (verified via agent-browser screenshot):** `LiveChatWidget` (`src/components/chat/live-chat-widget.tsx`) is mounted globally (root layout) and appears on every page, including all `/projects` pages. Its open-state panel is a fixed `w-[22rem]` (352px) anchored with `right-5` (20px). On a 360px-wide viewport (Galaxy S25 and similarly-sized Samsung phones) this needs 372px of horizontal room and doesn't have it — the panel's left edge renders 12px past the left screen edge, so the header bar, message bubbles, and the "Ask about listings…" input all render flush against (and partly clipped by) the screen edge with zero left margin. On the iPhone 14 viewport (390px) it barely fits (18px to spare) but leaves no margin for smaller iPhones (e.g. iPhone SE at 375px, which would clip by 2px).

**Files:**
- Modify: `src/components/chat/live-chat-widget.tsx`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: nothing consumed by later tasks. `LiveChatWidget` remains a self-contained, prop-less component.

- [ ] **Step 1: Confirm the current (broken) rendering**

```bash
agent-browser set device "Galaxy S25"
agent-browser open http://localhost:3000/projects
agent-browser wait --load networkidle
agent-browser find text "Live Chat" click
agent-browser screenshot /tmp/task2-before.png
```

Expected: `/tmp/task2-before.png` shows the chat panel's left edge and header text touching the raw left screen edge with no rounded corner or margin visible on that side.

- [ ] **Step 2: Add the `cn` import**

In `src/components/chat/live-chat-widget.tsx`, the current imports are:

```tsx
"use client"

import { useMemo, useState } from "react"
import { MessageSquare, Send, X } from "lucide-react"
```

Change to:

```tsx
"use client"

import { useMemo, useState } from "react"
import { MessageSquare, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"
```

- [ ] **Step 3: Make the outer positioning wrapper responsive to `open` state**

Find this line (currently line 59):

```tsx
    <div className="fixed bottom-5 right-5 z-50">
```

Replace with:

```tsx
    <div
      className={cn(
        "fixed z-50",
        open ? "inset-x-4 bottom-5 sm:inset-x-auto sm:right-5" : "bottom-5 right-5",
      )}
    >
```

When the panel is open on a narrow phone, this anchors it with a 1rem (16px) margin on *both* sides instead of a fixed right offset, so it can never be wider than the viewport. From the `sm` breakpoint (640px) up, it reverts to the original fixed-right positioning — desktop/tablet appearance is unchanged. When closed, the compact FAB keeps its original `bottom-5 right-5` position.

- [ ] **Step 4: Make the open panel's width responsive**

Find this line (currently line 61):

```tsx
        <div className="surface-panel w-[22rem] overflow-hidden p-0 shadow-pop">
```

Replace with:

```tsx
        <div className="surface-panel w-full overflow-hidden p-0 shadow-pop sm:w-[22rem]">
```

`w-full` now fills the `inset-x-4` space set on the parent in Step 3 (so it's exactly `100vw - 2rem` wide on phones); `sm:w-[22rem]` restores the original fixed desktop width.

- [ ] **Step 5: Run build and lint**

Run: `pnpm build && pnpm lint`
Expected: both exit 0, no new errors or warnings.

- [ ] **Step 6: Verify visually on both viewports, open and closed states**

```bash
agent-browser set device "Galaxy S25"
agent-browser open http://localhost:3000/projects
agent-browser wait --load networkidle
agent-browser find text "Live Chat" click
agent-browser eval "({scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth})"
agent-browser screenshot /tmp/task2-after-galaxy-open.png

agent-browser set device "iPhone 14"
agent-browser reload
agent-browser wait --load networkidle
agent-browser find text "Live Chat" click
agent-browser screenshot /tmp/task2-after-iphone-open.png
```

Expected: the `eval` call reports `scrollWidth === clientWidth` (no page overflow); both screenshots show the chat panel with visible margin/rounded corners on both left and right edges, header text and input field fully inside the panel with normal padding.

- [ ] **Step 7: Commit**

```bash
git add src/components/chat/live-chat-widget.tsx
git commit -m "fix: keep live-chat panel within viewport bounds on narrow phones"
```

---

### Task 3: Stop rendering raw map-link URLs as a project's "location" text

**Problem (verified via a real production screenshot on aliviaproperties.com, mobile):** The card for project "JBS Hasiba Garden In Uttara" on `/marketplace` (its `FlagshipProjects` section) shows the raw text `https://maps.google.com/?cid=17991559348273614309&g_mp=...&source=embed` where the location should be — some project records have a pasted Google Maps share link sitting in their `location` field instead of a plain-text address. With no line-clamp on that text, the long URL wraps across 3+ lines and breaks the card's layout on narrow phones (this is what the user saw as "responsive breaking").

This exact problem was already solved once, for the project **detail** page only: `src/app/(site)/projects/[slug]/page.tsx` has local `toMapEmbedUrl()` and `projectLocationText()` helpers that detect a Google-Maps-shaped URL and fall back to `project.area`/`project.division` instead. That logic was never extracted or reused, so four other places that render a project's location still show the raw field unguarded:

1. `src/app/marketplace/page.tsx` — builds the `FlagshipProject[]` passed to the marketplace page's flagship-projects section (this is the exact call site behind the reported screenshot).
2. `src/app/(site)/landing.tsx` — builds `HeroProjectCard[]` for the homepage hero (top 2 projects).
3. `src/app/(site)/landing.tsx` — builds `FlagshipProject[]` for the homepage's own flagship-projects section (same component, second usage).
4. `src/components/projects/project-card.tsx` — the `/projects` listing card already has `truncate` on the location `<span>` so it doesn't visually break, but it still shows a truncated URL instead of a real location, which is wrong.

Two display components render whatever `location` string they're given with **no line-clamp at all** (relying entirely on the data being clean), which is also worth hardening independently of the URL bug — a long real-world address (not a URL) could wrap the same way:

5. `src/pages-sections/home/flagship-projects.tsx` (line ~188) — the location line inside each project card.
6. `src/pages-sections/home/home-hero.tsx` (line ~323) — the location line in the second hero project.

**Files:**
- Create: `src/utils/project-location.ts`
- Modify: `src/app/marketplace/page.tsx` (import + the `flagship` mapping, ~lines 40, 350-361)
- Modify: `src/app/(site)/landing.tsx` (import + the `heroProjects` mapping ~lines 81-88, + the `flagship` mapping ~lines 90-105)
- Modify: `src/components/projects/project-card.tsx` (import + the location `<span>`, ~line 79)
- Modify: `src/pages-sections/home/flagship-projects.tsx` (the `<li>` and the location `<p>`, ~lines 143, 188-190)
- Modify: `src/pages-sections/home/home-hero.tsx` (the location `<p>`, ~lines 323-325)

**Interfaces:**
- Produces: `pickLocationText(candidates: Array<string | null | undefined>, fallback: string): string` — exported from `src/utils/project-location.ts`. Returns the first candidate that is non-empty and does not look like an `http(s)://` URL; returns `fallback` if every candidate is missing or URL-shaped.
- Consumes: nothing from Tasks 1-2 (different files entirely; safe to implement independently of them).

- [ ] **Step 1: Confirm the current (broken) rendering**

With the frontend dev server running and `pnpm dev` pointed at real API data (or by temporarily checking a project record with a URL-shaped `location`/`address` field via `pnpm -C ../alivia-properties-backend` / Mongo Express at `:8081`), open `/marketplace` and look at the flagship projects section for a card whose location line shows a `maps.google.com` URL instead of an address. If no current record reproduces it locally, that's fine — the fix does not depend on reproducing the exact record, only on the code path being correct; skip ahead to Step 2 but note in your report that reproduction wasn't possible locally.

- [ ] **Step 2: Create the shared utility**

Create `src/utils/project-location.ts`:

```ts
const URL_PATTERN = /^https?:\/\//i

function looksLikeUrl(value: string): boolean {
  return URL_PATTERN.test(value.trim())
}

// Some project records have a pasted Google Maps link sitting in the
// location/address field instead of a plain-text address — never show
// that to visitors.
export function pickLocationText(
  candidates: Array<string | null | undefined>,
  fallback: string,
): string {
  return candidates.find((value) => value && !looksLikeUrl(value)) ?? fallback
}
```

- [ ] **Step 3: Fix `src/app/marketplace/page.tsx`**

Add the import. Find:

```tsx
import { formatPrice } from "@/utils/format-price";
```

Change to:

```tsx
import { formatPrice } from "@/utils/format-price";
import { pickLocationText } from "@/utils/project-location";
```

Then find the `flagship` mapping:

```tsx
  const flagship: FlagshipProject[] = (
    projectsRes.status === "fulfilled" ? projectsRes.value.data : []
  ).map((p) => ({
    slug: p.slug,
    name: p.name,
    location: p.location,
    status: p.status,
    price:
      p.priceFrom && p.priceFrom > 0 ? formatPrice(p.priceFrom, true) : null,
    units: p.totalUnits ? `${p.totalUnits} units` : null,
    cover: p.coverImage ?? p.coverImageUrl ?? p.galleryImages?.[0] ?? null,
  }));
```

Replace with:

```tsx
  const flagship: FlagshipProject[] = (
    projectsRes.status === "fulfilled" ? projectsRes.value.data : []
  ).map((p) => ({
    slug: p.slug,
    name: p.name,
    location: pickLocationText(
      [p.location, p.area, p.division],
      "Location available on request",
    ),
    status: p.status,
    price:
      p.priceFrom && p.priceFrom > 0 ? formatPrice(p.priceFrom, true) : null,
    units: p.totalUnits ? `${p.totalUnits} units` : null,
    cover: p.coverImage ?? p.coverImageUrl ?? p.galleryImages?.[0] ?? null,
  }));
```

(`p` here is typed `Project`, which has optional `area` and `division` fields — same fields the detail page's existing fallback already uses.)

- [ ] **Step 4: Fix `src/app/(site)/landing.tsx`**

Add the import. Find:

```tsx
import { projectsService } from "@/services/projects.service";
```

Change to:

```tsx
import { projectsService } from "@/services/projects.service";
import { pickLocationText } from "@/utils/project-location";
```

Then find the `heroProjects` mapping:

```tsx
  const heroProjects: HeroProjectCard[] = projects.slice(0, 2).map((p) => ({
    slug: pick<string>(p, "slug", ""),
    name: pick<string>(p, "name", "Alivia Project"),
    location: pick<string>(p, "location", "Jolshiri Abashon, Rupganj"),
    status: pick<string>(p, "status", "ongoing"),
    price: projectPrice(p) ?? "Price on request",
    cover: projectCover(p),
  }));
```

Replace with:

```tsx
  const heroProjects: HeroProjectCard[] = projects.slice(0, 2).map((p) => ({
    slug: pick<string>(p, "slug", ""),
    name: pick<string>(p, "name", "Alivia Project"),
    location: pickLocationText(
      [
        pick<string | null>(p, "location", null),
        pick<string | null>(p, "area", null),
        pick<string | null>(p, "division", null),
      ],
      "Jolshiri Abashon, Rupganj",
    ),
    status: pick<string>(p, "status", "ongoing"),
    price: projectPrice(p) ?? "Price on request",
    cover: projectCover(p),
  }));
```

Then find the `flagship` mapping directly below it:

```tsx
  const flagship: FlagshipProject[] = projects.map((p) => {
    const total = pick<number | null>(p, "totalUnits", null);
    return {
      slug: pick<string>(p, "slug", ""),
      name: pick<string>(p, "name", "Alivia Project"),
      location: pick<string>(p, "location", "Jolshiri Abashon, Rupganj"),
      status: pick<string>(p, "status", "ongoing"),
      price: projectPrice(p),
      units: total ? `${total} units` : null,
      cover: projectCover(p),
      availableUnits: pick<number | null>(p, "availableUnits", null),
      totalUnits: total,
      isFeatured: pick<boolean>(p, "isFeatured", false),
      createdAt: pick<string | undefined>(p, "createdAt", undefined),
    };
  });
```

Replace with:

```tsx
  const flagship: FlagshipProject[] = projects.map((p) => {
    const total = pick<number | null>(p, "totalUnits", null);
    return {
      slug: pick<string>(p, "slug", ""),
      name: pick<string>(p, "name", "Alivia Project"),
      location: pickLocationText(
        [
          pick<string | null>(p, "location", null),
          pick<string | null>(p, "area", null),
          pick<string | null>(p, "division", null),
        ],
        "Jolshiri Abashon, Rupganj",
      ),
      status: pick<string>(p, "status", "ongoing"),
      price: projectPrice(p),
      units: total ? `${total} units` : null,
      cover: projectCover(p),
      availableUnits: pick<number | null>(p, "availableUnits", null),
      totalUnits: total,
      isFeatured: pick<boolean>(p, "isFeatured", false),
      createdAt: pick<string | undefined>(p, "createdAt", undefined),
    };
  });
```

- [ ] **Step 5: Fix `src/components/projects/project-card.tsx`**

Add the import. Find:

```tsx
import { PROJECT_STATUS_STYLES } from "@/lib/constants"
```

Change to:

```tsx
import { PROJECT_STATUS_STYLES } from "@/lib/constants"
import { pickLocationText } from "@/utils/project-location"
```

Then find:

```tsx
              <MapPin className="h-4 w-4 text-brand-600" />
              <span className="truncate">{project.location}</span>
```

Replace with:

```tsx
              <MapPin className="h-4 w-4 text-brand-600" />
              <span className="truncate">
                {pickLocationText(
                  [project.location, project.area, project.division],
                  "Location available on request",
                )}
              </span>
```

- [ ] **Step 6: Harden `src/pages-sections/home/flagship-projects.tsx` against long location text**

Find:

```tsx
            <li key={p.slug || p.name}>
```

Replace with:

```tsx
            <li key={p.slug || p.name} className="min-w-0">
```

(A `<li>` inside a CSS grid defaults to `min-width: auto`, which lets an unbroken long string force the grid track wider than its column — `min-w-0` lets the card actually shrink to the column width so `truncate` below can take effect.)

Then find:

```tsx
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-500">
                    <MapPin aria-hidden="true" className="h-3 w-3" /> {p.location}
                  </p>
```

Replace with:

```tsx
                  <p className="mt-1 flex items-center gap-1 text-xs text-ink-500">
                    <MapPin aria-hidden="true" className="h-3 w-3 shrink-0" />
                    <span className="truncate">{p.location}</span>
                  </p>
```

- [ ] **Step 7: Harden `src/pages-sections/home/home-hero.tsx` against long location text**

Find:

```tsx
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-500">
                    <MapPin aria-hidden="true" className="h-3 w-3" /> {secondProject.location}
                  </p>
```

Replace with:

```tsx
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
                    <MapPin aria-hidden="true" className="h-3 w-3 shrink-0" />
                    <span className="truncate">{secondProject.location}</span>
                  </p>
```

(The parent `<div className="min-w-0 flex-1 py-1">` two lines above already constrains width, so `truncate` on the inner `<span>` will work correctly here without further changes.)

- [ ] **Step 8: Run build and lint**

Run: `pnpm build && pnpm lint`
Expected: both exit 0, no new errors or warnings. Pay attention to any TypeScript error about `Project["area"]`/`Project["division"]` — both are optional (`area?: string`, `division?: string` in `src/types/project.types.ts`), which `pickLocationText`'s `Array<string | null | undefined>` parameter type already accommodates.

- [ ] **Step 9: Verify visually**

```bash
agent-browser set device "Galaxy S25"
agent-browser open http://localhost:3000/marketplace
agent-browser wait --load networkidle
agent-browser screenshot /tmp/task3-marketplace-galaxy.png
agent-browser open http://localhost:3000/
agent-browser wait --load networkidle
agent-browser screenshot /tmp/task3-home-galaxy.png
```

Expected: every project card's location line is a single line (ellipsized if long), never a wrapped multi-line URL. If no current record has a URL-shaped location, confirm instead that a normal address renders correctly and stays single-line, and note in the report that the URL-specific case couldn't be reproduced against current data.

- [ ] **Step 10: Commit**

```bash
git add src/utils/project-location.ts src/app/marketplace/page.tsx "src/app/(site)/landing.tsx" src/components/projects/project-card.tsx src/pages-sections/home/flagship-projects.tsx src/pages-sections/home/home-hero.tsx
git commit -m "fix: stop showing raw map-link URLs as project location text"
```

---

## Final Verification

- [ ] Run `pnpm build && pnpm lint` one more time from a clean state — both must pass.
- [ ] With both dev servers running, re-open `/projects` and `/projects/alivia-heights-2` at both `iPhone 14` and `Galaxy S25` device emulation and click through: status tabs, filter accordion open/close, project card tap-through, unit pricing table scroll, live-chat open/close. Confirm no regressions to the existing Liquid Glass styling (`.surface-card`, `.surface-panel`, `.liquid-glass-nav` should look unchanged — this plan does not touch `globals.css`).
