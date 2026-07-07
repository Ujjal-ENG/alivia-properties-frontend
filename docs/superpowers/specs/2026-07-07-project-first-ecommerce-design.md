# Project-First Ecommerce Redesign

**Date:** 2026-07-07
**Product:** Alivia Properties frontend
**Scope:** Landing page, projects listing, properties listing, marketplace presentation

## Goal

Reshape the public experience into a project-first storefront with a stronger ecommerce vibe. The landing page should lead with Alivia projects, then properties, then marketplace categories. The projects and properties listing pages should remove classic pagination in favor of infinite scroll, and the projects page should gain a more discoverable, property-style filter experience.

## Audience

- Buyers exploring Alivia projects first
- Property seekers comparing verified listings
- Users browsing construction marketplace categories after real-estate discovery

## Single-page job

The public site should help a visitor understand where to go next within seconds:

- explore Alivia projects
- browse properties
- shop marketplace categories

## Approved Direction

The approved direction is a hybrid model with a primarily ecommerce vibe:

- project-first homepage structure
- property shelf second
- marketplace categories third
- cleaner storefront rhythm instead of a directory feel
- continuous infinite-scroll browsing on projects and properties

## Experience Structure

### Landing page

The root route `/` should render the real landing page again instead of forwarding to `/marketplace`.

The section order should be:

1. Project-led hero
2. Clear cross-navigation shortcuts to Projects, Properties, Marketplace
3. Expanded featured/flagship projects shelf
4. Properties shelf with stronger browse CTAs
5. Existing marketplace categories in a lower but still prominent storefront lane

### Navigation

Primary navigation should keep `Projects`, `Properties`, and `Marketplace` visibly available. The landing page should add stronger in-page and section-level calls to action so users can move directly to the projects page or properties page without menu hunting.

### Projects page

The projects listing page should stop feeling like a static portfolio grid. It should behave more like a collection page:

- shareable URL-based state
- search
- status filtering
- sort
- active filter visibility
- infinite scroll instead of pagination

### Properties page

The properties page already has a stronger filter system and should keep that structure. The main change is replacing numbered pagination with infinite scroll while preserving URL-based filters and sorting.

### Marketplace

The marketplace should keep its existing category architecture and live data wiring, but its presentation should feel more like ecommerce:

- stronger browse lanes
- clearer category entry points
- more obvious shelf rhythm
- higher scan speed

## Visual Direction

### Brand expression

Keep the current brand system:

- emerald as primary
- gold as accent
- light-mode-only customer-facing experience

Do not switch palettes or introduce a generic black/purple startup aesthetic.

### Ecommerce vibe

The ecommerce feel should come from structure and interaction, not from abandoning the premium real-estate tone. The UI should feel:

- browseable
- fast
- card-led
- shelf-led
- action-oriented

It should not feel like:

- a static brochure
- a plain directory
- a dashboard

### Signature element

The memorable design move is the storefront rhythm itself:

- projects as the hero product lane
- properties as the second shopping lane
- categories as the third lane

This ordering should be visually obvious and should make the homepage feel like a premium real-estate storefront rather than a general information site.

## Functional Requirements

### Landing page requirements

- Restore the landing page at `/`
- Keep a project-first hero
- Show more projects near the top than the current slim presentation
- Add strong section-level navigation to Projects, Properties, and Marketplace
- Keep the existing marketplace categories section but move it below projects and properties
- Maintain responsive behavior across mobile and desktop

### Projects listing requirements

- Preserve current backend-driven data flow through `projectsService`
- Replace pagination controls with infinite scroll
- Keep status filters
- Add search in the page UI using the existing `search` query support
- Add sort control using the existing `sort` query support
- Show result count and active filter state
- Reset the list when filters change
- Keep URL state shareable

### Properties listing requirements

- Preserve current filters and toolbar behavior
- Replace pagination controls with infinite scroll
- Keep URL-driven filter state
- Preserve grid/list view and sort behavior
- Show loading skeletons while more results load
- Show a clear end-of-results state

### Marketplace presentation requirements

- Preserve existing route structure and data services
- Strengthen the category/browse presentation to feel more like shopping
- Keep marketplace lower on the home page than projects and properties
- Keep CTAs action-oriented and easy to scan

## Technical Constraints

- Frontend only uses `pnpm`
- Frontend must keep using service-layer data access; no direct `fetch()` in components
- Public listing/filter state should remain URL-based
- The projects page should only expose filters that are supported by the current backend contract unless backend support is intentionally extended
- Infinite scroll can be implemented with paged API requests under the hood, but no visible pagination UI should remain on projects or properties
- Follow existing Next.js App Router and server-first patterns
- Use the existing brand tokens and helpers from `src/app/globals.css`
- Do not hard-code alternative color systems

## Data and API Notes

### Projects

Current backend support already exists for:

- `page`
- `limit`
- `search`
- `sort`
- `status`
- `featured`

The current backend does not expose a dedicated project location filter. The frontend should not invent a fake server-backed location filter unless the backend is intentionally extended in this same implementation.

### Properties

Current backend support already exists for the current property query surface used by the frontend, so the infinite-scroll change should be a presentation and interaction change, not a contract rewrite.

## Interaction Requirements

### Infinite scroll

For both projects and properties:

- initial page loads the first batch
- additional batches load automatically when the viewport nears the end
- loading state appears inline with skeleton cards
- when filters change, the list resets and starts from page 1
- when no more results remain, show a subtle end-of-list message

### Accessibility and motion

- visible keyboard focus must remain intact
- interactive controls must keep adequate touch size
- reduced motion should be respected
- heading hierarchy should stay sequential

## Copy Direction

Use plain, action-oriented ecommerce copy:

- View all projects
- Browse properties
- Shop categories
- Explore more
- No more projects
- No more properties

Avoid vague promotional filler and avoid directory-style labels that slow down recognition.

## Implementation Boundaries

The work should focus on:

1. restoring and reshaping the homepage
2. upgrading projects listing UX and filters
3. replacing projects/properties pagination with infinite scroll
4. strengthening ecommerce presentation language across the affected public surfaces

The work should not expand into unrelated backend refactors or unrelated dashboard/admin changes.

## Testing Expectations

- frontend build passes
- frontend lint passes
- affected listing flows are manually verified for:
  - filter reset behavior
  - URL state correctness
  - infinite scroll loading
  - end-of-results behavior
  - mobile layout stability

## Decisions Locked In

- Homepage priority is Projects first, Properties second, Marketplace categories third
- The overall feel should be ecommerce-forward, not just corporate
- Projects and Properties listing pages should use infinite scroll instead of visible pagination
- Projects page should evolve toward a collection/browse experience using only real supported filters unless backend work is added intentionally
