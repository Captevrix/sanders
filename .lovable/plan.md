# Blog, HighLevel-managed (Captevrix / VrixPlay pattern)

Captevrix runs its blog as native pages on its own site (`/blog?page=1`, `/blog/<slug>`) with the site's own header, footer and branding, while the content itself is written and managed elsewhere. We do the same here: Sanders staff write posts in HighLevel, the site pulls them in and renders them in the Sanders design.

## What gets built

**1. `/blog` — post index**
- Sanders header/footer, navy/rust branding, card grid of posts: cover image, category chip, title, excerpt, author, date, read time.
- Featured/most recent post gets a larger hero card at the top.
- Category filter chips and pagination (`?page=2`), matching the reference pattern.
- Below the list: a conversion block — "Ready to see homes in person?" with tap-to-call and a link to `/homes`.

**2. `/blog/$slug` — post page**
- "← Back to Blog" link, title, author + date + read time, cover image, then the post body rendered from HighLevel's HTML (sanitized, styled with our typography — headings, lists, links, quotes, images).
- Ends with a call CTA and an inquiry prompt, plus 3 related posts.
- Full SEO: unique title/description, og:title/description/og:image from the cover, `article` og:type, canonical, and Article JSON-LD.

**3. Navigation and discovery**
- "Blog" added to the header nav and the footer Company column (desktop + mobile menu).
- Posts included in the sitemap-facing metadata; post pages are server-rendered so they're indexable.

**4. HighLevel content source**
- A server-side blog adapter fetches posts from the HighLevel blog feed for the Sanders location and normalizes them into `{ slug, title, excerpt, html, coverImage, author, category, publishedAt, readTime }`.
- Responses are cached briefly server-side so page loads stay fast and we don't hammer HighLevel.
- The connection details are TBD (same as the HighLevel lead webhook): the code ships wired but reads its feed URL / credentials from secrets. Until those are set, `/blog` renders a small placeholder set of Sanders-relevant posts so the page and layout are reviewable, and it switches to live HighLevel content the moment the secret is added — no code change.

## What I need from you (whenever it's ready)

The HighLevel blog's public URL (e.g. `blog.sandershousing.com` or the funnel domain) — and, if you'd rather pull via API than the public feed, a HighLevel API key and location ID. I'll request those through the secure secret form.

## Technical details
- New: `src/lib/blog.functions.ts` (public server functions `listPosts` / `getPost`, no auth — public route loaders can't use authenticated fns), `src/lib/blog.server.ts` (HighLevel fetch + normalize + fallback content), `src/routes/blog.index.tsx`, `src/routes/blog.$slug.tsx`.
- Edits: `SiteHeader.tsx` + `SiteFooter.tsx` (nav links).
- Post HTML is sanitized server-side before render (no `dangerouslySetInnerHTML` of raw remote HTML) and styled via a scoped prose utility in `src/styles.css`.
- Secrets: `HIGHLEVEL_BLOG_URL` (and optionally `HIGHLEVEL_API_KEY` / `HIGHLEVEL_LOCATION_ID`), read inside handlers only.
- No database or RLS changes — HighLevel remains the source of truth.

## Verify
Typecheck + build green; Playwright: `/blog` renders the grid and pagination, `/blog/<slug>` renders a full post with correct meta tags, nav links work on desktop and mobile, and behavior is graceful with and without the HighLevel secret set.
