# Light and dark versions for testimonial layouts

## Goal
Let users fully configure separate Light and Dark versions of every testimonial layout. Public widget links and embed URLs select the version with `theme=light` or `theme=dark`, with Light used by default.

## Layout editor
- Add a clear Light/Dark segmented selector beside the preview controls.
- Store two complete widget configurations per layout, so colors, typography, card styling, spacing, layout behavior, animation settings, and branding preference can differ by version.
- When creating a layout, initialize Light from the current defaults and Dark from a readable dark preset.
- When editing an existing layout, preserve its current configuration as Light and generate Dark defaults without changing the published Light appearance.
- Switching the selector changes both the controls and live preview to that version; edits remain in memory until the normal Save or Save & Publish action.
- Reset to defaults affects only the currently selected version and states that clearly.
- Keep testimonial selection, layout type, brand association, name, and publication status shared between both versions.
- Continue enforcing the Free/Pro branding rule independently of the selected version.

## Public widget and embed behavior
- Accept only `theme=light` and `theme=dark` on `/widget/{slug}`; missing or invalid values use Light.
- Render the selected saved configuration without depending on the visitor’s app or device theme.
- Update URL and embed helpers to generate theme-specific links, for example:
  - `/widget/{slug}?theme=light`
  - `/widget/{slug}?theme=dark`
- On the layout preview page, add a Light/Dark selector and provide separate copy actions for the selected theme’s public URL and embed code.
- Keep existing widget links and embeds working as Light with no required changes.

## Data compatibility
- Keep both configurations inside the layout’s existing configuration field; no new table is required.
- Add a versioned configuration shape and normalization helpers that safely read both legacy single-theme layouts and new dual-theme layouts.
- Update every internal layout preview/list card to use the Light version by default unless it explicitly selects Dark.

## Validation
- Verify newly created and legacy layouts in both themes.
- Verify missing, valid, invalid, and misspelled theme query values all behave safely, including `theme=llight` falling back to Light.
- Check editor controls, public URLs, embed snippets, branding enforcement, and mobile/desktop rendering.
- Confirm type checks and the preview build are clean.
