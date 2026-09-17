# Plan: Mobile fixes, widget branding, export controls, and testimonial sources

## What will change

1. **Fix smaller-screen overflow**
   - Review the dashboard areas most likely to overflow: testimonial lists, layout picker, widget previews, public widgets, form/edit screens, and social post dialog.
   - Tighten mobile layout rules so long customer names, company names, widget URLs, buttons, and testimonial text wrap or truncate cleanly instead of pushing outside the screen.
   - Keep desktop views unchanged unless a shared fix is needed.

2. **Add Testimonially branding to testimonial widgets**
   - Add a consistent “Powered by Testimonially” badge inside the shared widget renderer so it works across every widget style: grid, carousel, masonry, featured, list, minimal, Wall of Love, multi-row carousel, marquee, badge, and floating toast.
   - Keep it responsive so it does not cover testimonial content on mobile.
   - Preserve the existing plan behavior unless you tell me otherwise: free widgets show branding, paid plans that include “remove branding” can stay unbranded.

3. **Add branding to exported testimonial PNGs**
   - Add a subtle Testimonially mark to exported social images.
   - Let the export inherit the associated brand name when the testimonial is linked to a brand.
   - Keep the mark positioned safely for all export ratios: Instagram post/story, X, LinkedIn, Facebook, and Pinterest.

4. **Improve exported PNG customization**
   - Add controls in the export dialog for:
     - background color
     - card color
     - text color
     - accent/star color
     - quote font size
     - customer/name font size
     - show/hide rating
     - show/hide associated brand name
     - show/hide Testimonially branding where the plan allows it
   - Use the associated brand’s saved colors and fonts as a quick starting point when available.
   - Keep the live preview updating as settings change.

5. **Add testimonial source dropdown with icons**
   - Add a new source field to testimonial data.
   - Add the dropdown to add/edit testimonial screens with the sources from your screenshot:
     - Text Testimonial
     - Google
     - Facebook
     - Twitter / X
     - LinkedIn
     - Instagram
     - Capterra
     - Trustpilot
     - Reddit
     - Yelp
     - G2
     - App Store
     - Play Store
   - Add matching source icons in the dropdown and testimonial list.
   - Show the source on testimonial cards where it helps, without crowding small screens.

## Technical details

- Add a database migration for `testimonials.source`, defaulting existing testimonials to `text`.
- Update the testimonial type, save/load helpers, add/edit form values, public form submission defaults, and testimonial list display.
- Add a small source metadata module so labels and icons stay consistent across forms, lists, widgets, and exports.
- Extend the social-post renderer options so canvas export settings are controlled by the dialog instead of fixed theme presets only.
- Add widget-branding support in the shared widget component, then pass the correct branding setting from public widget routes and dashboard previews.

## Verification

- Check the app on a narrow mobile viewport for the landing page, testimonial list, add/edit testimonial form, layout editor preview, public widget page, and social post export dialog.
- Verify a testimonial source can be saved and edited.
- Verify exported PNG preview updates when colors, font sizes, rating, and brand controls change.
- Check the current build output before reporting completion.

## Not included

- Review importing from Google/Facebook/etc. is not included yet; this only stores and displays the selected source.
- Paid checkout setup remains unchanged.
