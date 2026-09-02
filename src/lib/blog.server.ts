/**
 * HighLevel-managed blog adapter.
 *
 * Posts are written in HighLevel; this module fetches them, normalizes them
 * into a shape the site can render, and sanitizes the post HTML.
 *
 * Until HIGHLEVEL_BLOG_URL is set, FALLBACK_POSTS are served so the pages are
 * reviewable. No code change is needed once the secret lands.
 */

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  html: string;
  coverImage: string | null;
  author: string;
  category: string;
  publishedAt: string;
  readTime: number;
};

const CACHE_MS = 5 * 60 * 1000;
let cache: { at: number; posts: BlogPost[] } | null = null;

/* ------------------------------------------------------------------ */
/* Sanitizing                                                          */
/* ------------------------------------------------------------------ */

const BLOCKED_TAGS = ["script", "style", "iframe", "object", "embed", "form", "input", "link", "meta"];

export function sanitizeHtml(raw: string): string {
  let html = raw;
  for (const tag of BLOCKED_TAGS) {
    html = html.replace(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, "gi"), "");
    html = html.replace(new RegExp(`<${tag}\\b[^>]*/?>`, "gi"), "");
  }
  // Strip inline event handlers and javascript: URLs.
  html = html.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  html = html.replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"');
  return html.trim();
}

export function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "\u2019")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function readTimeOf(html: string): number {
  const words = stripTags(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/* ------------------------------------------------------------------ */
/* HighLevel fetching                                                  */
/* ------------------------------------------------------------------ */

function tagValue(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (!m || !m[1]) return "";
  return m[1].replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

/** Parse an RSS/Atom feed into posts. */
function parseFeed(xml: string): BlogPost[] {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  const posts: BlogPost[] = [];
  for (const item of items) {
    const title = stripTags(tagValue(item, "title"));
    if (!title) continue;
    const link = tagValue(item, "link") || tagValue(item, "guid");
    const body =
      tagValue(item, "content:encoded") || tagValue(item, "content") || tagValue(item, "description");
    const html = sanitizeHtml(body);
    const image =
      item.match(/<media:content[^>]*url="([^"]+)"/i)?.[1] ??
      item.match(/<enclosure[^>]*url="([^"]+)"/i)?.[1] ??
      html.match(/<img[^>]*src="([^"]+)"/i)?.[1] ??
      null;
    const slugFromLink = link.split("?")[0]?.replace(/\/+$/, "").split("/").pop();
    posts.push({
      slug: slugFromLink && /[a-z0-9]/i.test(slugFromLink) ? slugify(slugFromLink) : slugify(title),
      title,
      excerpt: stripTags(tagValue(item, "description") || html).slice(0, 200),
      html,
      coverImage: image,
      author: stripTags(tagValue(item, "dc:creator") || tagValue(item, "author")) || "Sanders Housing",
      category: stripTags(tagValue(item, "category")) || "News",
      publishedAt: tagValue(item, "pubDate") || tagValue(item, "updated") || new Date().toISOString(),
      readTime: readTimeOf(html),
    });
  }
  return posts;
}

/** Normalize a HighLevel JSON blog payload. */
function parseJsonFeed(payload: unknown): BlogPost[] {
  const root = payload as Record<string, unknown>;
  const list = (Array.isArray(payload)
    ? payload
    : (root?.["blogs"] ?? root?.["posts"] ?? root?.["data"] ?? root?.["items"])) as
    | Record<string, unknown>[]
    | undefined;
  if (!Array.isArray(list)) return [];
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  return list
    .map((p) => {
      const title = str(p["title"] ?? p["name"]);
      const html = sanitizeHtml(str(p["rawHTML"] ?? p["content"] ?? p["body"] ?? p["description"]));
      return {
        slug: slugify(str(p["urlSlug"] ?? p["slug"] ?? title)),
        title,
        excerpt: (str(p["description"] ?? p["excerpt"]) || stripTags(html)).slice(0, 200),
        html,
        coverImage: str(p["imageUrl"] ?? p["image"] ?? p["blogImage"]) || null,
        author: str(p["author"] ?? p["authorName"]) || "Sanders Housing",
        category: str(p["category"] ?? p["categoryName"]) || "News",
        publishedAt: str(p["publishedAt"] ?? p["updatedAt"] ?? p["createdAt"]) || new Date().toISOString(),
        readTime: readTimeOf(html),
      } satisfies BlogPost;
    })
    .filter((p) => p.title && p.slug);
}

async function fetchFromHighLevel(base: string): Promise<BlogPost[]> {
  const root = base.replace(/\/+$/, "");
  const candidates = [`${root}/rss.xml`, `${root}/feed`, `${root}/blog/rss.xml`, root];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers: { accept: "application/json, application/rss+xml, text/xml" } });
      if (!res.ok) continue;
      const text = await res.text();
      const posts = text.trimStart().startsWith("{") || text.trimStart().startsWith("[")
        ? parseJsonFeed(JSON.parse(text))
        : parseFeed(text);
      if (posts.length > 0) return posts;
    } catch (error) {
      console.error(`[blog] fetch failed for ${url}`, error);
    }
  }
  return [];
}

export async function getAllPosts(): Promise<BlogPost[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.posts;

  const base = process.env["HIGHLEVEL_BLOG_URL"];
  let posts: BlogPost[] = [];
  if (base) posts = await fetchFromHighLevel(base);
  if (posts.length === 0) posts = FALLBACK_POSTS;

  posts = [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  cache = { at: Date.now(), posts };
  return posts;
}

/* ------------------------------------------------------------------ */
/* Fallback content (used until the HighLevel feed is connected)       */
/* ------------------------------------------------------------------ */

const FALLBACK_POSTS: BlogPost[] = [
  {
    slug: "what-a-manufactured-home-really-costs-in-pensacola",
    title: "What a manufactured home really costs in Pensacola",
    excerpt:
      "Sticker price is only part of it. Here is how delivery, set, tie-downs, steps and A/C add up, and what a realistic monthly payment looks like.",
    coverImage: null,
    author: "Sanders Housing",
    category: "Buying guide",
    publishedAt: "2026-08-18T14:00:00.000Z",
    readTime: 6,
    html: `<p>Most people start with the price on the home and stop there. On the Gulf Coast, the number that matters is the delivered-and-set price, the home plus everything it takes to make it livable on your land or in your park space.</p>
<h2>The pieces of a real quote</h2>
<ul><li><strong>The home itself</strong>, what you walk through on the lot.</li><li><strong>Transport</strong>, moving each section from our lot to your site.</li><li><strong>Set and level</strong>, blocking, leveling, marrying multi-section homes.</li><li><strong>Anchoring</strong>, tie-downs to the wind zone your address requires.</li><li><strong>Steps, skirting and A/C</strong>, the finish items that get you a certificate of occupancy.</li></ul>
<h2>Turning that into a monthly payment</h2>
<p>Once you have the delivered price, the payment depends on three things: your down payment, your rate, and the term. A land-home loan generally prices better than a chattel (home-only) loan, and a bigger down payment moves the payment more than shopping a quarter point of rate.</p>
<blockquote>Ask any dealer for the delivered-and-set number in writing before you talk financing. If they will not give it to you, that is your answer.</blockquote>
<p>We publish estimated monthly payments right on our listings so you can compare homes the way you will actually pay for them.</p>`,
  },
  {
    slug: "wind-zone-ii-vs-iii-what-gulf-coast-buyers-need",
    title: "Wind Zone II vs III: what Gulf Coast buyers actually need",
    excerpt:
      "Your address decides your wind zone, not your preference. Here is how to read the data plate and why it matters for insurance and permitting.",
    coverImage: null,
    author: "Sanders Housing",
    category: "Storm safety",
    publishedAt: "2026-07-29T13:00:00.000Z",
    readTime: 5,
    html: `<p>Every HUD-code home carries a data plate that lists the wind zone it was built for. In Escambia and Santa Rosa counties, most sites require Wind Zone II, and coastal parcels can require Wind Zone III.</p>
<h2>Where to look</h2>
<p>The data plate is usually inside a kitchen cabinet or the master closet. It lists wind zone, roof load and thermal zone. Photograph it, your insurer and your permitting office will both ask.</p>
<h2>Why it matters</h2>
<ul><li>Permits: the county will not approve a set that is under-rated for the address.</li><li>Insurance: correct rating plus documented tie-downs usually lowers premium.</li><li>Resale: an under-rated home shrinks the pool of sites it can legally go on.</li></ul>
<p>Every home we stock is rated for the coast, and we show you the plate before you sign anything.</p>`,
  },
  {
    slug: "do-you-own-land-the-first-fork-in-the-road",
    title: "Do you own land? The first fork in the road",
    excerpt:
      "Land-home, park space, or family property, the answer changes your loan, your timeline and your total cost more than the home you pick.",
    coverImage: null,
    author: "Sanders Housing",
    category: "Financing",
    publishedAt: "2026-07-08T15:30:00.000Z",
    readTime: 4,
    html: `<p>Before we talk floor plans, we ask one question: where is this home going? Three common answers, three very different paths.</p>
<h2>You own the land</h2>
<p>You can pursue a land-home loan, which is usually the lowest rate and the longest term available. Expect a site check for access, slope and utilities.</p>
<h2>You are renting a park space</h2>
<p>That is a chattel loan, home only. Rates run higher and terms shorter, but the approval is faster and the site work is simpler.</p>
<h2>Family land</h2>
<p>Very common here, and workable, but the lender needs to see the ownership and, often, a recorded agreement. Start that paperwork early; it is the piece that delays closings.</p>
<p>Not sure which one you are? Call us and we will walk it through in five minutes.</p>`,
  },
];
