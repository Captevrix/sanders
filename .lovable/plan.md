# Social proof and trust section

Pull the real reviews from your HighLevel reputation feed, but render them in the site's own navy/rust styling instead of the generic embedded widget.

## What gets built

**1. Reviews data source (server side)**
- A server function fetches your HighLevel review widget feed and parses out each review: reviewer name, star rating, date, review text, and source (Google, etc.), plus the aggregate rating and total count (currently 4.90 from 265 reviews).
- Results are cached for 30 minutes so pages stay fast and the feed isn't hit on every visit.
- If the feed is ever unreachable, the section falls back to a saved snapshot of recent reviews so the page never looks broken.
- Nothing is embedded in an iframe; no HighLevel styling or fonts load on the site.

**2. Homepage trust section**
- New section placed between the inventory grid and the award section: a headline rating block ("4.9 out of 5, 265 reviews") with star display, then a responsive grid of the strongest recent reviews as cards, styled to match the site (navy heading ink, steel-blue chips, rust accent stars, rounded cards with soft shadow).
- Long reviews truncate with a "Read more" expand so cards stay even.
- Footer of the section: a "See all reviews" link to a dedicated page and a "Leave us a review" link to your Google listing.

**3. Dedicated /reviews page**
- Full list of reviews from the feed with the aggregate summary at the top, filter by star rating, and load-more paging.
- SEO: page title/description, and AggregateRating + Review structured data so the stars can surface in search results.
- Linked from the header (Company/About area) and the footer.

**4. Light reuse elsewhere**
- A compact rating strip ("4.9 stars, 265 reviews") on the home detail page near the CTA buttons and on the Financing page, since those are the pages where trust matters most before a call.

## Technical details

- `src/lib/reviews.server.ts` parses the widget's server-rendered schema.org markup (`itemProp` fields for author, ratingValue, datePublished, reviewBody) into a typed `Review[]` with an in-memory TTL cache, mirroring the existing `blog.server.ts` pattern.
- `src/lib/reviews.functions.ts` exposes a public, unauthenticated `listReviews` server function safe to call from route loaders.
- `src/components/site/ReviewsSection.tsx` (homepage block), `StarRating.tsx`, `ReviewCard.tsx`, and a `RatingStrip.tsx` compact variant.
- New route `src/routes/reviews.tsx` with head metadata and JSON-LD; header and footer link additions.
- The widget URL is hardcoded to your reputation widget ID but read through one constant so it can be swapped later.

## Verification

Typecheck and build clean, then a browser pass confirming real review text renders on the homepage and /reviews, the aggregate matches the feed, and layout holds at mobile and desktop widths.
