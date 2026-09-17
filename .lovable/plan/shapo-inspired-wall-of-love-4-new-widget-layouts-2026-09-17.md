# Shapo-inspired: Wall of Love + 4 new widget layouts

Reference: shapo.io. Build in two phases — Wall of Love first (user priority), then the new layout types. No database changes and no new plan limits: everything reuses the existing layout system (layouts table, publish flow, /widget/:slug URLs, embed code, published-layout caps).

## Phase 1 — Wall of Love (new layout type "wall")

A shareable page that shows selected testimonials as a full masonry wall with an optional branded header — Shapo's "Wall of Love".

- `src/lib/widget.ts`: add `"wall"` to `LayoutType`; add it to `LAYOUT_TYPES` ("Wall of Love — a public wall page of all your best testimonials"). Extend `WidgetConfig` with a `wall` section: `{ showHeader: boolean; headline: string; showSummary: boolean }` (defaults: header on, headline "Loved by customers", summary on). Update `mergeConfig` and `defaultConfig`.
- `src/components/widget/TestimonialWidget.tsx`: new `wall` branch —
  - Optional header: brand-style heading (the wall headline), average star rating + "based on N testimonials" summary.
  - Masonry grid (CSS columns, reuse existing column logic) of full cards with larger padding and bigger quote text than regular layouts.
  - Falls back to the existing empty state when nothing is selected.
- `src/components/dashboard/LayoutEditor.tsx`:
  - New wall thumbnail in the layout picker (wall-style mini graphic).
  - "Wall of Love" accordion shown only when type is `wall`: show header switch, headline text input, show rating summary switch.
- Public route `/widget/:slug` and embed code need no changes — they already render whatever `type` says.

## Phase 2 — Four new layout types

All render through `TestimonialWidget.tsx` with inline styles; keyframes for animation are injected via a small scoped `<style>` element inside the component.

1. **Multi-row carousel** (`"multicarousel"`) — a carousel where each slide shows a grid of `columns × rows` cards. Reuses the existing carousel config plus a new `rows` number (default 2, 1–3). Same autoplay / arrows / dots controls.
2. **Marquee** (`"marquee"`) — continuously scrolling rows of cards (CSS keyframes, content duplicated for a seamless loop, pause on hover). New `marquee` config section: `{ rows: 1|2, speed, pauseOnHover }`; two rows scroll in opposite directions.
3. **Badge** (`"badge"`) — a compact aggregate badge: average rating, star row, testimonial count, optional brand-style title. New `badge` config: `{ showLabel: boolean }`. Renders small and centered — suited to footers/headers.
4. **Floating toast** (`"toast"`) — a small card pinned to a corner that cycles one testimonial at a time. New `toast` config: `{ position: "bottom-right" | "bottom-left" | "top-right" | "top-left", showAvatar: boolean }`; reuses `carousel.speed` for the rotation interval.

Editor work for all four: picker thumbnails, and one accordion each (Marquee: rows/speed/pause; Toast: position/show avatar; Badge: show label; Carousel accordion gains the Rows slider only for multicarousel).

## Landing page

Extend the existing layout showcase section with the five new types (wall, multi-row carousel, marquee, badge, toast) so the marketing page demonstrates the full catalogue.

## Technical notes

- `WidgetConfig` gains `wall`, `marquee`, `badge`, `toast` sections and `carousel.rows`; all optional-safe via `mergeConfig`, so existing saved layouts keep working untouched.
- `LayoutType` union widening flows through `LayoutRecord` with no schema change (`type` is already free text in the DB).
- Strict-TS conventions as in the rest of the codebase (non-null assertions on indexed access, early-return toast guards).
- Verify: `bunx tsgo --noEmit`, build, then Playwright on `/` and a published wall widget route.
