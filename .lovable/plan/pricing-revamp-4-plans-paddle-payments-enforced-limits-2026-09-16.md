# Pricing revamp: 4 plans, Paddle payments, enforced limits

New pricing model (replaces Free $0 / Pro $19 / Business $49):

| Plan | Price | Testimonials | Layouts | Brands |
|---|---|---|---|---|
| Free | $0/mo | 20 | 2 published | 1 |
| Starter | $9/mo | 100 | 10 | 1 |
| Pro (highlighted) | $19/mo | Unlimited | Unlimited | 3 |
| Agency | $49/mo | Unlimited | Unlimited | 10 |

Feature lists follow the user's spec exactly (custom domain, API access, webhooks, white-label, analytics, etc. are shown on the pricing card; only the countable limits + branding are enforced in the app for now).

## 1. Landing page pricing section
- `src/routes/index.tsx`: replace the `plans` array with the 4 tiers and full feature lists; grid becomes `lg:grid-cols-4`; "Most popular" stays on Pro.
- Section subtitle updated to reflect the 4-tier model.

## 2. Enable Paddle payments
- Call `enable_paddle_payments` (user already approved payments). Paddle was confirmed eligible by the provider check.
- Create 3 recurring products via `batch_create_product`: Starter $9/mo, Pro $19/mo, Agency $49/mo (Free needs no product). Paddle is merchant of record, so taxes are handled automatically.
- Follow the Paddle knowledge files received after enabling for checkout + webhook implementation.

## 3. Database changes (single migration)
- New table `public.subscriptions`: `user_id` UUID PK → auth.users, `plan` text default 'free' ('free' | 'starter' | 'pro' | 'agency'), `paddle_customer_id`, `paddle_subscription_id`, `status`, `current_period_end` timestamptz, `updated_at`.
  - GRANTs per policy standard; RLS enabled; policy: users read/update only their own row (insert default row on signup via trigger or first-read upsert).
- Multi-brand support (needed for 1/3/10 brand limits to mean anything):
  - Drop the unique constraint on `brands.user_id`; keep RLS own-rows policies.
  - Add `brand_id` UUID nullable FK to `layouts`; layouts without a brand use the user's first brand as today.
- Webhook route `src/routes/api/public/webhooks/paddle.ts`: verify Paddle signature before any write; upsert `subscriptions` on subscription events.

## 4. Plan limits module + enforcement
- New `src/lib/plans.ts`: `PLAN_LIMITS` per tier (testimonials, layouts, published layouts, brands, removeBranding), `getPlan(userId)` react-query hook over `subscriptions`, `usePlanLimits` computing current usage from existing testimonial/layout/brand queries.
- Enforcement points (client-side, with clear upgrade prompts):
  - Add testimonial (`/testimonials/new` + save hook): block at cap, toast "You've reached the Free plan limit of 20 testimonials" + Upgrade action.
  - Create layout / duplicate layout: block at layouts cap; Publish: block free users beyond 2 published layouts.
  - Brand: Starter/Free limited to 1 brand; Pro 3; Agency 10.
- Upgrade dialog component (shared): shows plan comparison and opens Paddle checkout for the chosen tier.

## 5. Billing experience
- New "Billing" page (`/billing`, sidebar item under Settings): current plan + status, usage meters (testimonials, layouts, brands), plan cards with "Current" / "Upgrade" / "Downgrade" actions opening Paddle checkout, manage-subscription link.
- Checkout success/redirect handling per Paddle knowledge files; subscription row updated by webhook.

## 6. Free-plan branding badge
- Public widget (`/widget/:slug`) shows a small "Powered by Testimonially" badge when the owner's plan is Free; hidden on paid plans (the "Remove Testimonially branding" feature).

## Verification
- `bunx tsgo --noEmit` clean; build OK.
- Playwright: landing pricing section renders 4 plans with Pro highlighted.
- Paddle sandbox checkout test + webhook subscription sync verified in test mode.
- Enforcement toasts appear when caps are hit (test with a Free-plan test user).
