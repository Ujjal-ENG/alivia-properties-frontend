# Project details gallery and sidebar design

## Goal

Improve the public project-details page with a reference-inspired image preview experience and a useful right sidebar. The result must use the existing Alivia visual system and live `Project` data.

## Chosen direction

Use a large active image with a horizontal clickable thumbnail rail, previous/next controls, an image counter, and the existing full-screen lightbox. This replaces the current static mosaic because it lets visitors inspect every project image without navigating away.

The desktop content layout remains two-thirds main content and one-third sidebar. The sidebar becomes sticky and contains, in order:

1. A softly glowing “Developed by” identity card when `developerName` exists.
2. A “Project at a glance” two-column facts table.
3. The existing price card.
4. The existing enquiry actions.

On smaller screens, these cards stack in the normal page flow.

## Data mapping

The facts table only renders rows whose source data exists:

- Address: `address`, falling back to the existing resolved location text.
- Land area: `landSize` and `landSizeUnit`.
- Floors: `totalFloors`.
- Total units: `totalUnits`.
- Available units: `availableUnits`.
- Handover: `handoverDate` formatted as month and year.
- Unit size: minimum and maximum sizes derived from `units`.
- Bedrooms: minimum and maximum bedroom counts derived from `units`.
- Bathrooms: minimum and maximum bathroom counts derived from `units`.

No launch date, apartment-per-floor value, or other unsupported field will be invented.

## Components

- `ProjectGallery`: a focused client component managing the active image, thumbnail selection, arrow navigation, and keyboard-accessible buttons. It reuses `next/image` and the existing lightbox trigger.
- `ProjectAtAGlance`: a server-rendered presentation component receiving prepared rows and rendering semantic table markup.
- The route remains a server component and prepares all derived values before passing them to the focused UI components.

## Visual treatment

The gallery uses the current rounded Alivia surfaces and brand-green controls. The facts table uses quiet alternating rows, compact icons, and strong value hierarchy. The developer card is the single visual accent: a restrained brand/gold radial glow, subtle border, and developer name prominence. Motion is limited to hover/focus transitions and respects reduced-motion preferences.

## Empty and edge states

- No gallery is rendered when there are no images.
- One image hides previous/next controls and does not show a redundant thumbnail strip.
- Missing fact values remove their rows rather than displaying misleading placeholders.
- The developer card is omitted when no developer name exists.
- Long addresses and developer names wrap without widening the sidebar.

## Verification

- Add focused tests for facts-row derivation and gallery navigation behavior where the existing test setup supports them.
- Run frontend lint and production build.
- Inspect the project-details page at desktop and mobile widths with browser automation, including keyboard focus and image navigation.
