# Landing page color refresh — "Fresh & airy" with subtle accents

## Goal

Make the landing page feel more modern and colorful without changing layout, content, or the app's brand. Palette: keep indigo #6366F1 as the primary brand color and layer in sky blue #0EA5E9, teal #14B8A6, and lime #84CC16 as supporting accents. Intensity: subtle — color lives in icon chips, badges, eyebrow labels, glows, and hover states; backgrounds stay light and clean.

Scope: landing page only (`src/routes/index.tsx`) plus new color tokens in `src/styles.css`. Dashboard, auth pages, widget editor, and public pages keep the current look.

## Changes

### 1. New accent tokens — `src/styles.css`

Add to `:root` and `@theme inline` (light values only; landing stays light):

- `--sky` #0EA5E9 with a soft tint `--sky-soft` (~10% tint background)
- `--teal` #14B8A6 with `--teal-soft`
- `--lime` #84CC16 with `--lime-soft` (darkened text variant for contrast)

These generate utilities like `bg-sky-soft`, `text-teal`, etc.

### 2. Hero

- Replace the single indigo blur blob with two overlapping soft glows (sky + indigo) for a fresher backdrop.
- Announcement badge: sky-soft background, sky text.
- Buttons and headline stay as-is (indigo stays the action color).

### 3. Section eyebrow labels

The small labels above headings ("Features", "How it works", "Layouts", "Pricing") currently all use primary. Alternate per section: Features → sky, How it works → teal, Layouts → lime (darkened for legibility), Pricing → indigo.

### 4. Features grid — per-card tinted icon chips

Six feature cards each get a distinct soft-tinted icon chip cycling through sky / teal / lime / indigo (2 cards per hue), with the icon colored to match. Hover keeps the existing lift effect.

### 5. How it works — tinted step numbers

The 01/02/03 number chips switch from solid dark to soft tints: 01 sky, 02 teal, 03 lime, each with its matching text color.

### 6. Showcase — colored type pills

The layout-type pills (grid, carousel, featured, masonry, minimal) each get a distinct soft tint instead of uniform indigo.

### 7. CTA band

Keep the dark panel but add a subtle sky→teal radial glow behind the content so the closing section doesn't read as plain black.

### 8. Micro-details

- Landing testimonial star icons: keep warm amber.
- Pricing check icons: keep success green.
- Pricing "Most popular" and Pro highlight: keep indigo.
- Footer: unchanged.

## What is NOT changing

- Layout, copy, sections, responsiveness — untouched.
- Primary indigo #6366F1 remains the brand/action color across the whole app.
- No new dependencies.

## Verification

- Build check passes.
- Playwright screenshot of `/` (desktop + mobile width) to confirm the tints render and nothing looks off; console error check.
