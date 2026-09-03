# Bring legacy virtual tours and floor plans onto the new site

I crawled all 40 home pages on sandershousing.com and pulled every 360 tour link and floor plan PDF they contain. Every legacy page maps to a listing we already have (the only rename is delight, which is Dogwood here).

## What the legacy site has

- **28 virtual tours** — 19 momento360 links and 9 Matterport links.
- **34 floor plan PDFs** hosted in the legacy WordPress uploads folder.

## What we import

**Virtual tours (22 new).** Homes that already have a tour here (Aspen, Dogwood, Oak, Redwood, Sycamore, Truman, and the two new display drafts) keep what they have. New tours go to:

Alexander, Anderson, Bandit, Birch, Boujee 56, Boujee XL, Buttercup, Cozy Cottage, Explorer, Jackson, Jefferson, Keep, Madison, Maple, Mariner, Maverick, Oasis, Parker, Patriot, Providence, Sumner, Tide, Tulip.

Links are normalized (HTML entity escapes removed, autoplay/tracking parameters stripped) so they load cleanly in the existing full-width 16:9 tour embed.

**Floor plans (32 new).** Birch and Sycamore already have floor plans from the Feedbucket import, so those are left untouched. New floor plans go to:

Alexander, Anderson, Aspen, Baby Boujee, Bandit, Boone, Boujee 56, Bryant, Cozy Cottage, Dogwood, Explorer, Hollywood, Hudson, Jackson, Keep, Madison, Mariner, Maverick, McKinley, Oak, Oasis, Parker, Providence, Redwood, Snowcap, Summit, Sumner, Tempo, Tide.

Each PDF is downloaded, rendered to an image, optimized, and uploaded to our CDN, matching exactly how the two existing floor plans are stored so they display the same way on the detail page and the printable flyer.

## Two things I want to flag

- The legacy Sycamore page points at the **same tour as Maverick** and its floor plan is named "Pride". Sycamore already has the correct tour and floor plan from the Feedbucket round, so I'm skipping it entirely rather than importing the legacy mistake.
- Homes with **multi-page PDFs** get the first page as the displayed floor plan image. If any of them turn out to have a second page worth showing, we can revisit.

Homes with nothing on the legacy site (Lil' Easy, Lean On Me, Boone tour, Hollywood tour, and the unpublished drafts) are unchanged.

## Technical notes

- One migration updates `public.homes.virtual_tour_url` and `floor_plan_url`, guarded with `where virtual_tour_url is null` / `where floor_plan_url is null` so nothing existing is overwritten.
- Floor plan PDFs are converted with `pdftoppm -jpeg -r 150` (page 1), resized to max 1600px wide at quality 82, uploaded via `lovable-assets create`, and stored as `/__l5e/assets-v1/...` URLs, the same format as the Birch and Sycamore plans.
- No UI changes needed: the tour embed and floor plan section already render conditionally on these fields.
- After the migration I re-query the table to confirm the expected counts and spot-check a few pages in the preview.
