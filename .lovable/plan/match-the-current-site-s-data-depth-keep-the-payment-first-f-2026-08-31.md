# Match the current site's data depth, keep the payment-first framing

The live sandershousing.com listing pages carry a lot more per-home detail than the current preview: builder, property ID, lot address, date added, photo count, status tags (For Sale / On Site / Luxury / Special), section type, beds, baths, area, box size, a 14+ item feature list, a floor plan image with its own spec block, and a long description. Most homes carry no price at all. The preview will keep all of that, and treat price/payment as an optional enhancement rather than the only hook.

## Pricing rule

- Homes with a price: show cash price and the estimated monthly payment, as today.
- Homes without a price: the same slot becomes a "Get your payment" prompt with a short line ("Pricing varies by options and land — we'll quote it same day") plus the qualify CTA. Card height and layout stay identical so the grid doesn't go ragged.
- The affordability estimator stays, but its "N homes fit your budget" line counts only priced homes and says so.

## Inventory data

Expand the mock dataset to roughly 12 homes so filters and counts feel real. Each home gains:

- builder, propertyId, address, dateAdded, photoCount
- statuses (multiple tags), sectionType, beds, baths, sqft, dimensions, windZone
- features (from the real site's vocabulary: Central Cooling, Kitchen Island, Split Bedrooms, Garden Tub, Open Concept, Drywall, etc.)
- floorPlan image + description text
- price as optional

Mixed pricing across the set (some priced, most not) so both card states are visible.

## Card redesign

A denser spec card closer to the live site's information level: photo with photo-count badge and status tags, name + builder, address line, a four-up spec strip (Beds / Baths / Area / Size), a short feature chip row with "+N more", then the price-or-quote block and the two CTAs.

## Home detail pages

New route `/homes/$homeId`:

- Photo gallery with count and thumbnails
- Status tag row and title block
- Overview table: property ID, beds, baths, area, size, builder, wind zone, date added
- Full feature list, grouped in columns
- Floor plan section with its own beds/baths/size block and the plan image
- Description prose
- Price-or-quote panel with the qualify CTA, sticky on desktop
- Similar homes row
- Own `head()` metadata per home (title, description, og:title, og:description, og:image from the home photo)

Cards link here with `<Link to="/homes/$homeId">`.

## Full filter bar

A dedicated `/homes` listing route with the live site's full filter set, driven by URL search params so filters are shareable:

- Status select (All / For Sale / Luxury / On Site / Special)
- Type select (All / Multi Section / Single Section)
- Beds select (All / 1–10)
- Multi-select feature checklist with live counts per feature, in a collapsible panel
- Plus a monthly-payment max slider that applies only to priced homes
- Result count, active-filter chips, and a clear-all

The homepage keeps a curated subset with a "See all homes" link into `/homes`.

## Technical notes

- Filters use `validateSearch` with `zodValidator` + `fallback()` on `/homes`; feature selection serialises as a string array.
- Detail route is `src/routes/homes.$homeId.tsx` with `createFileRoute("/homes/$homeId")`; unknown ids render a not-found state.
- All data stays in `src/components/site/data.ts` as typed mock records — no backend, since this is a Next.js hand-off preview.
- Header nav gains Our Homes / Specials / On Display / Financing to mirror the real IA.
