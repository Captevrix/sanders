# Feature the "Best of 2026" award on the site

## What we'll build

**1. Award asset**
- Upload the uploaded plaque image (`user-uploads://sanders-manufactured-housing-plaque-1227x1536.webp`) as a CDN asset via `lovable-assets create` (with a `best-of-2026-award.webp` filename), referenced through its `.asset.json` pointer. No binary left in the repo.

**2. Homepage award block**
- A new "Award winning" section on the homepage between the inventory section and the "Built for Gulf Coast weather" trust section: the plaque image (responsive, ~260px wide) next to a short heading like "Pensacola's Best of 2026 Mobile Home Dealer" with supporting text noting it's a BusinessRate award powered by Google Reviews, and a link to the About page.

**3. About page placement**
- Add the plaque to the About page hero area (right of the intro text, side-by-side on desktop, stacked on mobile), reinforcing the family-business credibility story.

**4. Footer badge**
- Small plaque thumbnail (~80px wide) in the footer company column with the caption "Best of 2026, Mobile Home Dealer, Pensacola" linking to the About page.

**5. Alt text and loading**
- Meaningful alt text on every instance ("Sanders Manufactured Housing, Best of 2026 Mobile Home Dealer award, BusinessRate, powered by Google Reviews"), `loading="lazy"` below the fold, width/height set to avoid layout shift.

## Technical details
- New file: `src/assets/best-of-2026-award.webp.asset.json`.
- Edits: `src/routes/index.tsx` (new section), `src/routes/about.tsx` (hero placement), `src/components/site/SiteFooter.tsx` (badge). No other pages, no dashboard changes, no new dependencies.
- Keep brand tokens: section uses `bg-sand`/surface-card styling consistent with the rest of the site. No em dashes in new copy (per existing convention).

## Verify
- Typecheck clean, build OK; Playwright screenshots of `/`, `/about`, and a footer close-up confirming the plaque renders crisply at each size.
