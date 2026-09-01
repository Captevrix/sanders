# "Ask about it" inquiry form + HighLevel webhook

## What changes

**1. Inquiry form dialog**
- New `InquiryDialog` component: name, phone, email, message, and consent text. Zod-validated client-side (name required, phone or email required).
- The home is preloaded and shown at the top of the form (photo thumbnail, name, beds/baths/sqft, location) with the message field pre-filled with e.g. "I'd like to know more about The Maverick..." — still editable.
- Opens from every "Ask about it" CTA on the home detail page (and anywhere that CTA appears on listing cards). Submits via the existing `submitLead` server function with `source: "inquiry"` and the home's ID attached, so it lands in the dashboard's Leads tab tagged to that home.
- Success state shows a confirmation + Sanders phone number as a fallback; no page navigation.

**2. HighLevel webhook**
- `submitLead` handler extended: after the lead row is inserted, it POSTs the lead payload (name, phone, email, message, source, home name/ID, timestamp) as JSON to a webhook URL read from a `HIGHLEVEL_WEBHOOK_URL` secret.
- The URL is TBD — the code ships with the hook wired but inert: if the secret isn't set, the POST is skipped silently and lead capture works exactly as today. Once you paste the HighLevel inbound webhook URL into the secret, submissions start flowing with no further code change.
- Webhook failures never block the user: errors are logged server-side, the lead is still stored, and the user still sees success.

## Technical details
- Files: new `src/components/site/InquiryDialog.tsx`; edits to `src/routes/homes.$homeId.tsx` (wire CTA to dialog), `src/lib/homes.functions.ts` (extend `submitLead` handler + home name lookup), possibly `HomeCard.tsx` if the CTA appears there.
- Secret: `HIGHLEVEL_WEBHOOK_URL` — requested via the secure form after the code is built; safe to defer since the integration is TBD.
- No database or RLS changes — the `leads` table already has `home_id` and `source`.
- Webhook is server-side only (no browser CORS exposure, URL never ships to the client).

## Verify
- Typecheck clean, build OK; Playwright: open a home → "Ask about it" → form preloads home → submit → confirmation; confirm row appears in dashboard Leads with the home attached; confirm graceful behavior with and without the webhook secret set.
