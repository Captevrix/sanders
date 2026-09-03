# Feedbucket backlog: bring legacy fixes into the new site

I reviewed the Feedbucket project "Sanders Housing" (41 open items, nearly all filed by Trent on Aug 29–31, plus one from 2025). Almost every item is one of six repeating requests. Rather than one-off patches, this plan adds the missing listing capabilities so staff can handle these themselves in the dashboard, then applies the specific data changes each ticket asks for.

## What the backlog actually contains

| Bucket | Items | Homes affected |
| --- | --- | --- |
| Replace photos + reorder them (living room, kitchen, master bed/bath, additional rooms, baths, laundry) | ~20 | Boone, Delight, Jackson, Lil' Easy, Maple, Maverick, Boujee XL, Oak, Oasis, Truman, Aspen, Birch, Redwood, Sycamore, Buttercup, Tulip and others |
| Add a virtual tour link (momento360 / Matterport) | 7 | Oak, Aspen, Sycamore, Redwood, Delight/Dogwood, Truman, plus the two new homes |
| Add a floor plan | 2 | Sycamore, Birch |
| Correct the manufacturer / brand | 3 | Aspen (TRU Homes), Maple (TRU Homes), Jackson (Cavalier Homes) |
| Correct spec or URL | 2 | Sycamore dimensions 28x68, Delight URL should be "dogwood" |
| Remove or add listings | 3 | Remove Lean On Me and Oasis from Specials; add 2 new single-section homes on display |
| Display bugs: "showing up very small" | 2 | Tulip, Buttercup (the tour/plan embed renders tiny) |
| Default sort order for listing pages | 1 | Site-wide |

## What we build

### 1. Listing fields the site is missing today
Add to each home: **virtual tour URL**, **floor plan image**, and a proper **manufacturer/brand** field surfaced on the card and detail page. Each gets an input in the dashboard listing editor.

### 2. Virtual tour that renders full size
A responsive, full-width tour embed on the home detail page (16:9, framed, lazy loaded) with a "View 3D tour" button in the gallery. This is the fix for the two "showing up very small" tickets: the legacy embeds were fixed-size iframes.

### 3. Floor plan section
When a listing has a floor plan, show it as its own section on the detail page and include it on the printable flyer.

### 4. Photo manager upgrade in the dashboard
Multi-file upload, drag-to-reorder, set-cover, delete-selected, and a one-click "Replace all photos". A gentle room-order hint (living room, kitchen, master bed/bath, additional bedrooms, baths, laundry, exterior) matches the order Trent asks for in every photo ticket. This is what makes the ~20 photo tickets self-serve, since the tickets reference photo files that live with Trent, not in Feedbucket.

### 5. On-site and Specials management
The listing editor gets clear toggles for On our lot, Special, Luxury and For Sale so status changes like "remove Lean On Me and Oasis from Specials" take seconds.

### 6. Default listing order
Newest-on-the-lot first by default, with the existing sort control unchanged. Ticket 256584 asks for a preferred default order, so we set a sensible one and confirm the exact order with Trent.

## Data changes we apply now

- Aspen and Maple: manufacturer TRU Homes. Jackson: Cavalier Homes.
- Sycamore: dimensions 28x68.
- Virtual tour URLs attached to Oak, Aspen, Sycamore, Redwood, Dogwood, and Truman.
- Lean On Me and Oasis: Special status removed.
- Delight already exists in our data as Dogwood; we add a redirect so the old link still resolves.
- Two new single-section homes created as drafts with their tour links attached, ready for Trent to add photos and specs.

## Not covered by this plan

The actual replacement photo files are not in Feedbucket (its attachments are annotated screenshots of the old site, not the source images). Once the new photo sets arrive, they load through the upgraded photo manager, or I can bulk import them if you drop them somewhere I can reach.

## Technical notes

- Migration adds `virtual_tour_url`, `floor_plan_url`, and `manufacturer` to `public.homes`, plus data updates for the corrections above. Existing grants and RLS policies already cover these columns.
- `Home` / `HomeRow` types and `mapHomeRow` in `src/components/site/data.ts` extend with the new fields.
- Detail page `src/routes/homes.$homeId.tsx` gains tour and floor plan sections; flyer route includes the floor plan.
- Dashboard editor `src/routes/_authenticated/dashboard.listings.$homeId.tsx` and `src/lib/dashboard.functions.ts` gain the new fields, batch photo upload, reorder and replace-all.
- A `/home/$slug` compatibility route maps legacy WordPress URLs (including delight to dogwood) onto `/homes/$homeId`.
- After shipping, I mark each Feedbucket item resolved with a short comment noting how it was handled.
