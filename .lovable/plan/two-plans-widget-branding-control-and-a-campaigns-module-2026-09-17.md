# Two plans, widget branding control, and a Campaigns module

## 1. Pricing: two plans only

| | Free | Pro |
|---|---|---|
| Price | $0/mo | $29/mo |
| Testimonials | 10 | Unlimited |
| Layouts | Unlimited | Unlimited |
| Published layouts | 2 | Unlimited |
| Brands | 1 | Unlimited |
| Collection forms | 1 | Unlimited |
| Campaigns | none | 3 per month, 500 emails each |
| Remove branding | shown but not available | yes |

- Starter and Agency are removed everywhere: landing pricing (2 cards, Pro highlighted), billing page, upgrade dialog, plan limits.
- Existing accounts on starter/agency are mapped to Pro so nobody loses access.
- Free plan card lists "Remove branding" with a crossed-out / unavailable marker, as requested.

## 2. Branding on widgets, with a toggle

- Every widget layout shows the "Powered by Testimonially" footer by default (currently it only appears on the public widget page for free users).
- A "Show Testimonially branding" switch is added to the layout editor and saved with the layout.
- Free plan: the switch is visible but locked, with an upgrade prompt — branding always shows.
- Pro plan: the switch works, so branding can be hidden per widget.
- Same rule applies to public collection forms and the embedded form view.

## 3. Campaigns module (new)

Ask customers for reviews over email, tied to a collection form.

- New sidebar item **Campaigns** with list, create, and detail pages.
- A campaign has: name, brand, collection form to link to, subject, email message (with the review link inserted), start date, end date, status (draft / scheduled / running / completed).
- Recipients come from an uploaded Excel/CSV file with name + email columns. The file is parsed in the browser, rows are previewed, invalid emails flagged, duplicates removed, then saved as recipients.
- Recipients can also be added by hand and removed before sending.
- Sending runs from the start date onward; each recipient gets one email with their personal review link. Per-recipient state is tracked (pending, sent, failed, responded) and a testimonial submitted from that link marks the recipient as responded.
- Campaign detail shows counters: recipients, sent, responded, response rate.
- Free plan sees the module with an upgrade prompt; Pro gets 3 campaigns per calendar month and 500 recipients per campaign, both enforced with clear messages.

### Email sending prerequisite

Campaign emails can only be delivered from a sender domain you own (for example `notify@yourdomain.com`). Nothing sends until that domain is set up and verified. I will build the whole module regardless; if the domain is not ready, campaigns can be created and previewed and emails go out once it is verified.

## 4. Also worth adding (small, included)

- Every campaign email gets an unsubscribe/opt-out link so recipients can decline.
- Reminder email option: one follow-up to recipients who did not respond after N days.
- Testimonials collected through a campaign are tagged with that campaign, so the source is visible in the testimonial list.

## Technical notes

- Migration: `campaigns`, `campaign_recipients` tables (owner-scoped RLS + GRANTs), `testimonials.campaign_id`, `layouts.configuration.showBranding` handled in existing JSON config; plan values in `subscriptions.plan` constrained to `free` / `pro` with existing rows remapped.
- Recipient parsing via a client-side XLSX/CSV parser; sending via a server function + `/api/public` cron-style dispatch route using Lovable's managed email API and the project's `LOVABLE_API_KEY`.
- Personal review links are `/f/{slug}?r={recipient_token}`; the public submit route records `campaign_id` and marks the recipient responded.
- `src/lib/plans.ts` reduces to two tiers with campaign limits; enforcement points updated (testimonials, published layouts, brands, forms, campaigns).
