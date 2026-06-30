# Marketplace-First Public Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the public homepage unchanged and make `/marketplace` show Projects, then Properties, then construction marketplace categories.

**Architecture:** Keep the change frontend-only. Reuse existing services, route helpers, image handling, and formatting helpers; do not add dependencies or backend fields.

**Tech Stack:** Next.js 16 App Router, React Server Components, Tailwind v4, lucide-react, existing service layer.

---

## File Structure

- Create: `scripts/check-marketplace-first.mjs`
  - Small Node smoke check that asserts `/marketplace` contains the intended section order.
- Modify: `src/app/marketplace/page.tsx`
  - Add live project/property fetches and rails above the existing construction category groups.

### Task 1: Add Smoke Check

**Files:**
- Create: `scripts/check-marketplace-first.mjs`

- [ ] **Step 1: Write the failing check**

Create a Node script that reads `src/app/marketplace/page.tsx`.

It must assert:

- marketplace page contains `marketplace-projects`
- marketplace page contains `marketplace-properties`
- marketplace page contains `marketplace-categories`
- those three marketplace ids appear in that order.

- [ ] **Step 2: Run the check to verify it fails**

Run: `node scripts/check-marketplace-first.mjs`

Expected: non-zero exit because the new ids do not exist yet.

### Task 2: Marketplace Page Rails

**Files:**
- Modify: `src/app/marketplace/page.tsx`

- [ ] **Step 1: Fetch projects and properties**

Extend the existing `Promise.allSettled` call to fetch:

- `projectsService.list({ limit: 6 })`
- `propertiesService.list({ limit: 6 })`

- [ ] **Step 2: Render the approved order**

Before existing construction category sections, render:

- `id="marketplace-projects"`
- `id="marketplace-properties"`
- existing `id="marketplace-categories"`

Project cards link to `ROUTES.PROJECT_DETAIL(project.slug)`. Property cards link to `ROUTES.PROPERTY_DETAIL(property.slug)`.

- [ ] **Step 3: Keep the existing category/RFQ flow**

Do not change category URLs, quote URLs, or service calls.

### Task 3: Verify

**Files:**
- Run checks only.

- [ ] **Step 1: Run smoke check**

Run: `node scripts/check-marketplace-first.mjs`

Expected: pass.

- [ ] **Step 2: Run build**

Run: `pnpm build`

Expected: exit 0.

- [ ] **Step 3: Run lint**

Run: `pnpm lint`

Expected: exit 0.
