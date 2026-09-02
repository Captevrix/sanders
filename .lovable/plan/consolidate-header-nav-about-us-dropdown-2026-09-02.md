# Consolidate header nav: About Us dropdown

## What we're building

Trim the header from 8 links to 5 by grouping the informational pages under an "About us" dropdown.

**Desktop nav becomes:**
Our homes | On our lot | Specials | Financing | About us (dropdown)

**About us dropdown contains:**
- About us → /about (who we are, award, how buying works)
- Reviews → /reviews (4.9 from 265 Google reviews)
- FAQs → /faq
- Blog → /blog

Each dropdown item gets a short supporting description line under the label (modern mega-menu-lite style), consistent with the warm brand look (navy hover states, sand background panel, steel-blue accents).

## Changes

1. **Desktop dropdown** in `src/components/site/SiteHeader.tsx` using the existing shadcn `navigation-menu` component (accessible: keyboard navigable, aria-expanded, closes on Escape/outside click). Trigger shows "About us" with a chevron that rotates on open; trigger is highlighted when any child route is active.

2. **Mobile menu** keeps the flat list but adds a small "About us" group heading with the four links indented under it — no accordion complexity on mobile.

3. **Active states**: child links in the dropdown highlight when on the current route, matching existing `text-primary` behavior.

4. **Footer** unchanged (already links all pages).

## Technical details

- Edits: `src/components/site/SiteHeader.tsx` only.
- Uses `src/components/ui/navigation-menu.tsx` (already installed).
- No route, content, or metadata changes; all four pages keep their URLs.
- Verify with Playwright: dropdown opens on click/hover at desktop width, links navigate, mobile menu shows the grouped section.
