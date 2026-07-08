# Marketplace Plain-Language Simplicity Pass

**Date:** 2026-07-08
**Product:** Alivia Properties frontend — construction marketplace
**Scope:** Marketplace browse, quote wizard, and get-a-quote form only

## Goal

Push the buyer-facing marketplace shopping flow toward a usability bar so simple and low-jargon
that a first-time, non-expert visitor — the "could a 10-14 year old use it" benchmark — can find
what they need and ask for a price without hitting business jargon or a wall of form fields.

This is a usability benchmark for the existing BDT construction marketplace (adult
Bangladeshi buyers/sellers), not a literal children's redesign.

## Non-goals

- Landing page, projects listing, properties listing (covered by the separate 2026-07-07
  project-first ecommerce redesign spec; not touched here)
- Buyer/seller/admin dashboards, forms outside the marketplace quote flow
- Backend, Prisma schema, or API contract changes
- Visual/brand system changes (emerald/gold tokens, typography, Liquid Glass) — this pass is
  copy and form-structure only

## Approved direction

Approach A — plain-language + progressive-disclosure polish. Keep the existing wizard, category
grid, and quote form structure (already a sound foundation: image-led tiles, a 5-step guided
wizard, URL-shareable search). Edit copy and field visibility in place rather than building a
parallel "easy mode" flow or a new design-token system.

## Changes

### 1. Copy: jargon → plain language

| Current | New | File |
|---|---|---|
| Wizard step labels "Department / Category / Subcategory / Suppliers / Request" | "What / Type / Exact match / Sellers / Details" | `src/components/marketplace/wizard/QuoteWizard.tsx` — `STEP_LABELS` |
| Step 2 title "Choose a category in {dept}" | "Pick a type in {dept}" | `QuoteWizard.tsx` step 2 `StepShell` |
| Buyer-facing CTA "Request a Quote" | "Ask for a Price" | `src/app/marketplace/page.tsx`, `src/app/marketplace/quote/page.tsx` |
| Buyer-facing noun "Suppliers" | "Sellers" | `QuoteWizard.tsx`, `marketplace/page.tsx`, category pages |
| Top bar "Track Order" | "My Orders" | `src/app/marketplace/page.tsx` top utility bar |
| Search placeholder "Search materials, equipment, services..." | "What are you looking for?" | `MarketplaceSearchForm` in `marketplace/page.tsx` |

"Be a Supplier" / "Be an Investor" are unchanged — different audience (sellers/investors), not
buyer-facing jargon, out of scope.

### 2. Quote form: tiered disclosure

File: `src/components/marketplace/GetQuoteForm.tsx`. Schema requirements are unchanged
(`src/schemas/quote.schema.ts`): required fields remain `name`, `email`, `phone`,
`deliveryLocation`, `message`; optional fields remain `company`, `city`, `quantity`, `unit`,
`deliveryDate`.

**Always visible** (the 5 required fields plus the 2 most useful optional ones):
- Full name
- Phone
- Email
- "What do you need?" — the `message` textarea, promoted above the fold, relabeled from
  "Product Description"
- Delivery address — the existing `deliveryLocation` field, relabeled. The separate `city`
  field is removed from the visible form (it duplicates the question the address field already
  answers); its form value is simply left unset since it's optional in the schema
- Quantity + Unit — kept as one row, still optional
- Photo — the existing optional attachment uploader, kept visible (a photo often replaces a
  paragraph of description for a non-expert)

**Behind a closed-by-default "Add more details (optional)" disclosure:**
- Company
- Desired delivery / start date

Implementation: a plain `<details>` element or a small `useState` toggle button with
`aria-expanded` — no new dependency. Nothing required is ever hidden inside the disclosure.

### 3. Visual navigation

No structural change. The wizard's `TileButton` / `SubcategoryCard` and the marketplace
"Shop by Category" grid are already image-led with icon + single-line labels — this already
meets the visual-navigation bar. Only the label text changes from section 1 apply.

### 4. Search

No structural change. `MarketplaceSearchForm` is already a single text input + one department
dropdown + submit — already minimal. Resolved entirely by the placeholder copy change above.

## Interaction requirements

- The "Add more details" disclosure must be keyboard-operable and expose its state via
  `aria-expanded` (or use native `<details>`, which does this for free)
- Reduced-motion and existing focus-ring behavior must be preserved on any element touched
- No new required fields; no change to what the backend receives beyond dropping the unused
  `city` value from the visible form

## Testing expectations

- `pnpm build` and `pnpm lint` pass
- Manual walk: complete the quote wizard end to end (department → category → subcategory →
  sellers → details) and confirm no jargon labels ("Department", "Category", "Subcategory",
  "Suppliers", "Request a Quote") remain visible
- Manual walk: submit a quote using only the always-visible fields, without ever opening
  "Add more details" — confirm it still submits successfully
- Confirm the disclosure toggle works via keyboard (Tab + Enter/Space) and screen-reader
  landmarks are sane
- Mobile layout check on the wizard tiles and the quote form at a small viewport

## Decisions locked in

- Marketplace-only scope; landing/projects/properties untouched
- Copy and form-structure changes only — no backend, schema, or brand/token changes
- The quote form's required fields are unchanged; only their visibility/grouping changes
- "Be a Supplier" / "Be an Investor" language is out of scope (different audience)
