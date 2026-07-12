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

## Final Verification

- [ ] Run `pnpm build && pnpm lint` one more time from a clean state — both must pass.
- [ ] With both dev servers running, re-open `/projects` and `/projects/alivia-heights-2` at both `iPhone 14` and `Galaxy S25` device emulation and click through: status tabs, filter accordion open/close, project card tap-through, unit pricing table scroll, live-chat open/close. Confirm no regressions to the existing Liquid Glass styling (`.surface-card`, `.surface-panel`, `.liquid-glass-nav` should look unchanged — this plan does not touch `globals.css`).
