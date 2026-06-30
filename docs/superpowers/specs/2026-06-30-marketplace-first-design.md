# Marketplace-First Public Experience Design

Date: 2026-06-30
Status: Approved direction, ready for implementation plan

## Goal

Keep the existing public landing page visual direction and header copy intact. Make `/marketplace` become the ecommerce-style front door for three marketplace verticals:

1. Projects
2. Properties
3. Construction marketplace categories

The marketplace page should feel closer to Amazon or AliExpress discovery than a corporate brochure, while keeping Alivia's premium Bangladesh property brand: emerald, gold, trust, verified supply, and local support.

## Scope

In scope:

- Preserve the public homepage's existing color combination, hero/header text, and composition.
- Rework `/marketplace` into a dense, search-first marketplace page.
- Show marketplace content in this order on `/marketplace`: projects first, properties second, construction categories third.
- Keep projects and properties as real listing verticals with links to their existing detail pages.
- Keep construction marketplace categories connected to the existing RFQ flow and category pages.
- Use existing frontend service functions for data:
  - `projectsService.list`
  - `propertiesService.list`
  - `marketplaceService.listCategories`
  - `marketplaceService.listSuppliers`
  - `marketplaceService.listProducts`
- Keep backend API contracts unchanged.

Out of scope:

- No backend schema changes.
- No new checkout/cart system.
- No replacement of detail pages for projects, properties, products, suppliers, or RFQ.
- No dummy data imports in new feature code.

## Recommended Direction

Use the approved "Bazaar Department Store" direction, softened with a guided RFQ trust layer.

This means:

- A strong marketplace search area.
- Department-style navigation for Projects, Properties, Materials, Services, and RFQ.
- Product/listing rails with compact cards, badges, price/location metadata, and clear CTAs.
- A guided quote path for users who do not know exact categories.
- The existing landing page remains the brand gateway; `/marketplace` becomes the shopping gateway.

## Homepage Design

The homepage is intentionally unchanged in this implementation. Its existing color combination, hero/header text, and composition stay as they were before this marketplace redesign.

## Marketplace Page Design

`/marketplace` becomes the main ecommerce-style page.

### First Screen

- Search-first hero.
- Marketplace department rail:
  - Projects
  - Properties
  - Materials
  - Services
  - RFQ
- Trust badges:
  - Verified listings
  - Verified suppliers
  - Guided RFQ support
  - Bangladesh-local pricing and locations
- Quick CTA:
  - Request a quote
  - Browse all categories

### Section Order

1. Projects rail
   - Show live projects from `projectsService.list`.
   - Compact horizontal/grid cards.
   - Include name, location, status, starting price when available, and link to project detail.
   - CTA: view all projects.

2. Properties rail
   - Show live properties from `propertiesService.list`.
   - Use marketplace-style cards, not large editorial cards.
   - Include price, purpose/type, location, verification/featured signals when available.
   - CTA: browse properties.

3. Construction categories
   - Use live marketplace category tree/list.
   - Group by department.
   - Keep existing sticky category tabs if they remain useful.
   - Categories should feel like ecommerce departments with image tiles and quote-ready CTAs.

4. Featured suppliers/products
   - Use live supplier/product totals and sampled data where available.
   - Keep this below the core verticals unless the API data is strong enough to support a richer product rail.

5. RFQ and business CTA
   - Keep the guided request path prominent but not repetitive.
   - Supplier signup remains secondary to buyer discovery.

## Components

Likely new or changed components:

- `MarketplaceSearchDeck`
  - Expand search language to cover projects, properties, suppliers, products, and categories conceptually.
  - Keep client behavior leaf-level.

- New marketplace rail components:
  - `MarketplaceProjectRail`
  - `MarketplacePropertyRail`
  - Optional shared `MarketplaceRailHeader`

- Existing category components:
  - `CategoryGroupSection`
  - `CategoryImageCard`
  - `CategoryGroupTabs`
  - Adjust visual density and ecommerce styling without changing their routing contract.

- Homepage:
  - Do not modify `src/app/(site)/page.tsx` for this scope.

## Data Flow

Pages stay as React Server Components by default.

`src/app/marketplace/page.tsx` should fetch independent data in parallel with `Promise.allSettled`:

- projects
- properties
- categories
- supplier count
- product count

Partial failures should not crash the whole page. If one vertical fails, render a compact empty/error state for that vertical and keep the other verticals visible.

New or changed UI components must receive data through props. They must not call `fetch()` or import `src/data/*`.

## Visual System

Use the existing Alivia tokens:

- Brand emerald for primary navigation, active state, trust, and marketplace identity.
- Gold for offer/featured/RFQ emphasis.
- Ink scale for dense ecommerce surfaces.
- Existing Cinzel + Manrope pairing, but use Cinzel with restraint. Ecommerce sections should favor readable Manrope headings and data.

Signature element:

- A "department store" marketplace header: sticky/near-sticky search plus compact department shortcuts. It should make users feel they can shop across projects, properties, and construction needs from one place.

Avoid:

- Raw hex colors in components.
- One-note decorative gradients.
- Oversized corporate hero sections.
- Cards inside cards.
- Emoji icons.
- Large marketing copy blocks on the marketplace page.

## Accessibility And UX

- All touch targets should be at least 44px tall.
- Icon-only controls need accessible labels.
- Hover effects must have focus-visible equivalents.
- Text inside cards and buttons must wrap safely on mobile.
- Product/listing cards must reserve image aspect ratio to avoid layout shift.
- Empty states should tell users what to do next: browse all, request quote, or call marketplace desk.

## Performance

- Keep pages server-first.
- Use `Promise.allSettled` or `Promise.all` for independent service calls.
- Do not introduce heavy client-side filtering unless required.
- Use `next/image` for real images.
- Keep client components small and leaf-level.
- Avoid large animation libraries.

## Testing And Verification

Run from `alivia-properties-frontend/`:

- `pnpm build`
- `pnpm lint`

Visual checks:

- Desktop width around 1440px.
- Tablet width around 768px.
- Mobile width around 375px.
- Confirm no horizontal overflow.
- Confirm the first `/marketplace` viewport makes the marketplace purpose obvious.
- Confirm section order on `/marketplace`: Projects, Properties, Categories.

## Open Decisions

- Whether supplier/product rails appear above or below category groups depends on available live data quality.
