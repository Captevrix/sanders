# Social icons, policy pages, and TCPA/TCR consent

## 1. Social icons from the legacy site

The live site links to three profiles:

- Facebook: facebook.com/sandershousing/
- Instagram: instagram.com/sandershousinginc/
- LinkedIn: linkedin.com/company/sanders-manufactured-housing

Add a small icon row (Lucide icons, brand navy, rust hover) in the footer under the phone number, and as compact icons in the header's utility area on desktop. Each link opens in a new tab with an accessible label.

## 2. Privacy Policy and Terms of Use pages

The legacy pages are Captevrix policy-generator embeds. That service exposes a JSON endpoint per policy, so instead of dropping a third-party script on the page we fetch the policy content server side and render it in the site's own typography. Same source of truth: when the policy is updated in Captevrix, the page updates automatically.

- New `/privacy` and `/terms` routes with a simple branded header, the policy body styled like the rest of the site, and the version/last-updated line the embed shows.
- Content cached for an hour so pages stay fast; if the service is unreachable the page shows a short notice plus a link to the legacy page rather than an error.
- Footer gets a "Legal" group linking both pages; the mobile bar is untouched.
- Each page gets its own title/description and `robots: noindex` is not used (policies should be indexable), with canonical tags.

## 3. TCR / TCPA consent on forms

Applies to every lead form: the homepage qualify form, the "Ask about it" inquiry dialog, and the financing page form.

- A required consent checkbox with standard TCR language naming Sanders Manufactured Housing, message type, frequency, "message and data rates may apply", "reply STOP to opt out, HELP for help", and links to the new Privacy Policy and Terms of Use pages. Submission is blocked until it is checked.
- A separate optional marketing/email checkbox, so transactional reply consent and marketing consent are recorded independently.
- Consent is stored with the lead: the checkbox values, the exact consent text shown, the page URL, and the timestamp, which is what carriers ask for during a TCR audit.
- The same fields are added to the HighLevel webhook payload so the CRM records the opt-in.
- The dashboard's Leads table shows a consent column (opted in / marketing yes-no) with the captured text on the lead detail.

## Technical details

- Routes: `src/routes/privacy.tsx`, `src/routes/terms.tsx`; content via a new `src/lib/policies.server.ts` + `policies.functions.ts` fetching `policygenerator.captevrix.com/api/embed/<id>` (privacy `923ede18-756e-49de-be0b-d9b65ee99abf`, terms `1d333377-9a22-4b4e-b3ff-82c17534b515`), sanitized before render.
- Edits: `SiteFooter.tsx` (socials + legal links), `SiteHeader.tsx` (social icons), `InquiryDialog.tsx`, homepage qualify form, financing form.
- Migration: add `sms_consent`, `marketing_consent`, `consent_text`, `consent_at`, `consent_source_url` to `leads`; extend `submitLead` validation, insert, and webhook body.
- No new dependencies; no changes to public listing data.

## Verify

Typecheck and build green; Playwright pass over `/privacy`, `/terms`, footer/header icons, and a lead submission confirming the form blocks without consent and stores the consent fields.
