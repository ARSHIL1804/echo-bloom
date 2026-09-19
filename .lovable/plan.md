# Keep Pro active until the paid period ends after a cancellation

## What happens today

When someone cancels, Polar keeps the subscription active until the end of the period they already paid for, then stops charging. Our webhook currently treats a cancellation as an immediate loss of Pro: it writes the plan back to Free the moment the cancel event arrives. So a person who paid for the month loses their paid features on day 1. That is not how SaaS normally works.

## How SaaS normally handles it

Two separate ideas:

- **Will it renew?** — "cancelled" only means auto-renew is off.
- **Is it usable now?** — access stays until the end of the paid period.

Access is removed only when the period actually ends (Polar sends a separate revoke event then), or immediately if the payment was refunded.

## Changes

### 1. Webhook (`src/routes/api/public/polar-webhook.ts`)
- Treat only `subscription.revoked` (and a status that is genuinely dead, e.g. unpaid/incomplete_expired) as "back to Free".
- Treat `subscription.canceled` / `subscription.updated` with `cancel_at_period_end` as **still Pro**, storing:
  - `plan: "pro"`, `status: "canceled"` (meaning: active but not renewing)
  - `current_period_end` from the event
- `subscription.uncanceled` restores the renewing state.

### 2. Plan record (migration)
Add two columns to `public.subscriptions`:
- `cancel_at_period_end boolean not null default false`
- `canceled_at timestamptz null`

### 3. Access check (`src/lib/plans.ts`)
Pro access becomes: plan is `pro` **and** (status is active/trialing, or status is `canceled` while `current_period_end` is still in the future). Once that date passes, the user falls back to Free even if no webhook arrived — so access never gets stuck on either side.

### 4. Billing page (`src/routes/_authenticated/billing.tsx`)
- Cancelled-but-active state shows "Pro — ends on {date}" instead of "Renews {date}", with a note that Pro features stay available until then.
- Keep the "Manage billing" button so they can resume from Polar's portal.

## Technical notes

- Polar's cancel-at-period-end arrives as `subscription.updated`/`subscription.canceled` with `cancel_at_period_end: true` and `ends_at`/`current_period_end`; final loss of access is `subscription.revoked`. We read `ends_at` when present and fall back to `current_period_end`.
- The date-based fallback in the access check covers missed or delayed webhook deliveries, so no cron job is needed.
- Existing rows are unaffected: the new columns default to false/null.
