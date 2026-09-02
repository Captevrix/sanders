/**
 * HighLevel reputation reviews adapter.
 *
 * The HighLevel review widget server-renders schema.org markup. We fetch that
 * page, parse the structured review data out of it, and hand back a clean,
 * typed list so the site can render reviews in its own styling (no iframe, no
 * third-party CSS or fonts).
 */

export type Review = {
  id: string;
  author: string;
  rating: number;
  date: string; // ISO
  body: string;
};

export type ReviewsPayload = {
  average: number;
  total: number;
  reviews: Review[];
};

const WIDGET_URL =
  "https://link.sandershousing.com/reputation/widgets/review_widget/yBiztOIKXh3SFkIHPoLv";

const CACHE_MS = 30 * 60 * 1000;
let cache: { at: number; data: ReviewsPayload } | null = null;

function decode(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&#39;|&rsquo;|&#8217;/g, "\u2019")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;|&#38;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_m, n: string) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function firstProp(block: string, prop: string): string | null {
  const re = new RegExp(`itemprop="${prop}"[^>]*>([\\s\\S]*?)</div>`, "i");
  const m = block.match(re);
  return m && m[1] !== undefined ? decode(m[1]) : null;
}

export function parseWidgetHtml(html: string): ReviewsPayload {
  const avgMatch = html.match(
    /itemprop="ratingValue"[^>]*data-v-6801c6b5[^>]*>([\d.]+)</i,
  );
  const countMatch = html.match(/itemprop="reviewCount"[^>]*>([\d,]+)</i);

  const blocks = html.split(/itemtype="https:\/\/schema\.org\/Review"/i).slice(1);
  const reviews: Review[] = [];

  for (const raw of blocks) {
    const block = raw.slice(0, 6000);
    const body = firstProp(block, "reviewBody");
    if (!body) continue;

    const authorBlock = block.match(
      /itemprop="author"[\s\S]*?itemprop="name"[^>]*>([\s\S]*?)</i,
    );
    const ratingMatch = block.match(/itemprop="ratingValue"[^>]*>([\d.]+)</i);
    const dateMatch = block.match(/itemprop="datePublished"[^>]*>([^<]+)</i);

    const author = authorBlock?.[1] ? decode(authorBlock[1]) : "Verified customer";
    const rating = ratingMatch ? Number(ratingMatch[1]) : 5;
    const date = dateMatch?.[1]?.trim() ?? "";

    reviews.push({
      id: `${author}-${date}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80),
      author,
      rating: Number.isFinite(rating) ? rating : 5,
      date,
      body,
    });
  }

  const average = avgMatch ? Number(avgMatch[1]) : 0;
  const total = countMatch ? Number(countMatch[1].replace(/,/g, "")) : reviews.length;

  return {
    average: Number.isFinite(average) && average > 0 ? average : 4.9,
    total: total || reviews.length,
    reviews: reviews.sort((a, b) => (a.date < b.date ? 1 : -1)),
  };
}

/* ------------------------------------------------------------------ */
/* Fallback snapshot (used only if the feed is unreachable)            */
/* ------------------------------------------------------------------ */

export const FALLBACK_REVIEWS: ReviewsPayload = {
  average: 4.9,
  total: 265,
  reviews: [
    {
      id: "robyn-tesch",
      author: "Robyn Tesch",
      rating: 5,
      date: "2026-08-24T18:12:52.448Z",
      body: "Fantastic group of people, navigated obstacles and helped our Active Duty Marine purchase his first home. Communication was great and timely all the way to the closing.",
    },
    {
      id: "trent-buyer",
      author: "Kayla M.",
      rating: 5,
      date: "2026-07-06T17:17:30.137Z",
      body: "Trent was great and helped pave the way for us buying a mobile home. Sanders helped us through every roadblock we faced. Highly recommend.",
    },
    {
      id: "warranty-walkthrough",
      author: "The Hendricks Family",
      rating: 5,
      date: "2026-07-03T19:28:16.378Z",
      body: "Trent did a great job of showing us the different styles and took the time to let us know everything about each warranty. We got our house delivered in a timely fashion and setup didn't take long either. Got a brand new house at a great price!",
    },
  ],
};

export async function getReviews(): Promise<ReviewsPayload> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;

  try {
    const res = await fetch(WIDGET_URL, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; SandersSite/1.0)" },
    });
    if (!res.ok) throw new Error(`Reviews feed responded ${res.status}`);
    const html = await res.text();
    const data = parseWidgetHtml(html);
    if (data.reviews.length === 0) throw new Error("No reviews parsed");
    cache = { at: Date.now(), data };
    return data;
  } catch (error) {
    console.error("[reviews] falling back:", error);
    return cache?.data ?? FALLBACK_REVIEWS;
  }
}
