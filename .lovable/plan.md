# Fix Polar webhook "invalid signature" locally

## What's happening

The verification code itself is fine, but the error can come from three different causes and the current log line hides which one it is. The three causes:

1. **Wrong or mismatched secret** — the `POLAR_WEBHOOK_SECRET` you set locally doesn't match the endpoint secret shown in Polar (common when switching between Polar sandbox and production, or an extra space/newline got copied into the env var).
2. **Stale event** — the library rejects events whose timestamp is more than 5 minutes old. If you're re-sending an old delivery from the Polar dashboard or replaying a saved payload locally, it will always fail.
3. **Secret format** — `standardwebhooks` 1.1.1 supports a `format: "raw"` option that takes the plain secret directly. Using it removes the manual base64 encoding, which is one less thing to get wrong.

## Changes

### 1. `src/routes/api/public/polar-webhook.ts`
- Verify with the plain secret directly:
  `new Webhook(secret, { format: "raw" })` instead of base64-encoding it.
- Trim the secret when reading it (`process.env["POLAR_WEBHOOK_SECRET"]?.trim()`) to survive accidental whitespace in the env var.
- Split the error handling so the log says *why* it failed:
  - missing webhook headers → 400 with "Missing webhook headers"
  - timestamp outside tolerance → 401 with a message saying the event is too old (tells you to send a fresh test event)
  - signature mismatch → 401 "Invalid signature"
- Log the first 12 characters of the configured secret's *length and prefix only* (e.g. `polar_whs_…`, length 34) so you can compare with the Polar dashboard without leaking the secret.

## How to verify locally after the fix

1. In Polar dashboard → your webhook endpoint → copy the secret again and confirm it matches `POLAR_WEBHOOK_SECRET` exactly (watch for sandbox vs production — each has its own webhooks and secrets).
2. Use Polar's "Send test event" button so the timestamp is fresh — don't replay old deliveries.
3. Confirm your tunnel/dev URL points to `/api/public/polar-webhook` on the same org the secret belongs to.
4. Trigger a test event and confirm you get `ok` and a 200 instead of the signature error.

## Notes

- No database or pricing changes; this is a single-file fix plus a verification walkthrough.
- If verification still fails after these steps, the remaining possibility is the body being altered in transit (e.g. a tunnel rewriting payloads) — the new logs will point us there.
