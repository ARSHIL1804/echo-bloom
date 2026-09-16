# Brands on testimonials + a new Forms module

## 1. Testimonials get a brand

- Every testimonial can be assigned to one of your brands (optional — "No brand" stays valid).
- The add/edit testimonial form gets a "Brand" picker listing your brands.
- The testimonials list gets a Brand column and a brand filter next to the existing status/rating filters.

## 2. Layout editor: filter testimonials by brand

- In "Select Testimonials", a brand filter chip row (All brands + one per brand) narrows the pickable list.
- "Select all" then applies to the filtered set, so you can build a brand-specific widget in two clicks.
- The layout itself also stores which brand it belongs to, so a layout opens pre-filtered to that brand.

## 3. Forms module (collect testimonials from customers)

New sidebar item **Forms**.

- **Forms list**: cards with form name, brand, status (Live / Draft), number of submissions, last updated, and actions Edit, Copy link, Preview, Delete. Empty state: "Create your first collection form".
- **Form editor** (two columns, live preview like the layout editor):
  - Form name, associated brand (required — branding and colors come from that brand)
  - Headline, intro text, thank-you message
  - Which fields to ask for and which are required: name, email, photo, company, job title, rating, message
  - Options: auto-publish submissions, or hold them as drafts for your approval (default: hold for approval)
  - Save / Save & Make Live → generates a public shareable link and shows Copy link
- **Public form page** at `/f/<slug>` — no login needed, styled with the form's brand colors and fonts, mobile friendly, validates input, shows the thank-you message after submit. Submissions land in your Testimonials list (as drafts unless auto-publish is on) tagged with the form's brand.
- Rate limiting and honeypot protection on submissions so the public link can't be spammed.

## 4. Plan limits for forms

| Plan | Forms |
| --- | --- |
| Free | 1 |
| Starter | 3 |
| Pro | Unlimited |
| Agency | Unlimited |

Hitting the cap shows the existing upgrade prompt. Billing page usage meters gain a "Forms" row, and the landing pricing feature lists mention forms.

## 5. Other suggestions (included in this plan)

- **Dashboard**: a "Recent submissions" area and a pending-approval count, so new customer feedback is visible immediately.
- **Approve / reject in one click** on draft testimonials that came from a form.

Suggestions I'd leave for later (not in this plan): email notification on new submission, video testimonials, importing reviews from Google/G2, per-form analytics.

## Technical notes

- Migration: `testimonials.brand_id` (nullable FK → brands, on delete set null); new table `public.forms` (user_id, brand_id, name, slug unique, headline, intro, thank_you, fields jsonb, auto_publish bool, status, timestamps) with GRANTs, RLS owner-only policies, and an updated_at trigger; `testimonials.form_id` nullable FK for the submission source.
- Public submission does not open anon writes to `testimonials`. A TanStack server route under `src/routes/api/public/` validates the slug, checks the form is live, validates payload with Zod, and inserts using the admin client loaded inside the handler. Public form config is read through a small `SECURITY DEFINER` function so anon never reads the `forms` table directly.
- Public form page is a top-level SSR route `src/routes/f.$slug.tsx` (noindex), same pattern as `widget.$slug.tsx`.
- Plan limits extend `src/lib/plans.ts` with a `forms` field; enforcement mirrors the existing layout/brand caps via `UpgradeDialog`.
- Regenerated Supabase types after the migration; `bunx tsgo --noEmit` plus a build check, and a Playwright pass on the public form page.
