import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { useState } from "react";

import { homesSearch } from "@/components/site/data";
import { GOOGLE_REVIEW_URL, ReviewCard, reviewsQuery, StarRating } from "@/components/site/Reviews";
import { MobileCallBar, SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

const TITLE = "Customer Reviews | Sanders Manufactured Housing";
const DESCRIPTION =
  "Read what Pensacola area families say about buying, financing, and setting up a manufactured home with Sanders Manufactured Housing.";
const URL = "https://sanders.lovable.app/reviews";

export const Route = createFileRoute("/reviews")({
  loader: ({ context }) => context.queryClient.ensureQueryData(reviewsQuery),
  head: ({ loaderData }) => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Sanders Manufactured Housing",
              telephone: "+1-850-474-0261",
              address: {
                "@type": "PostalAddress",
                streetAddress: "10300 Pensacola Boulevard",
                addressLocality: "Pensacola",
                addressRegion: "FL",
                addressCountry: "US",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: loaderData.average,
                reviewCount: loaderData.total,
                bestRating: 5,
                worstRating: 1,
              },
              review: loaderData.reviews.slice(0, 12).map((r) => ({
                "@type": "Review",
                author: { "@type": "Person", name: r.author },
                datePublished: r.date,
                reviewBody: r.body,
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: r.rating,
                  bestRating: 5,
                  worstRating: 1,
                },
              })),
            }),
          },
        ]
      : [],
  }),
  component: ReviewsPage,
});

const FILTERS = [0, 5, 4, 3] as const;
const PAGE_SIZE = 12;

function ReviewsPage() {
  const { data } = useSuspenseQuery(reviewsQuery);
  const [minStars, setMinStars] = useState<number>(0);
  const [shown, setShown] = useState(PAGE_SIZE);

  const filtered = data.reviews.filter((r) => (minStars === 0 ? true : r.rating === minStars));
  const visible = filtered.slice(0, shown);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pb-24">
        <section className="border-b border-border bg-sand">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="label-caps text-accent">Social proof</p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
                Customer reviews
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Every review below comes straight from our verified reputation feed. No cherry
                picking, no editing.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="tel:18504740261"
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90"
                >
                  <Phone className="size-4" aria-hidden />
                  1-850-474-0261
                </a>
                <a
                  href={GOOGLE_REVIEW_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-12 items-center rounded-md border border-border bg-card px-5 font-semibold hover:bg-secondary"
                >
                  Leave us a review
                </a>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
              <p className="font-display text-5xl font-extrabold leading-none">
                {data.average.toFixed(1)}
              </p>
              <div className="mt-3 flex justify-center">
                <StarRating value={data.average} size={20} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {data.total.toLocaleString()} total reviews
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setMinStars(f);
                  setShown(PAGE_SIZE);
                }}
                className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold ${
                  minStars === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-secondary"
                }`}
              >
                {f === 0 ? "All ratings" : `${f} stars`}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="mt-10 text-muted-foreground">No reviews match that rating yet.</p>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}

          {shown < filtered.length && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setShown((n) => n + PAGE_SIZE)}
                className="inline-flex h-12 items-center rounded-md border border-border bg-card px-6 font-semibold hover:bg-secondary"
              >
                Load more reviews
              </button>
            </div>
          )}

          <div className="mt-14 rounded-xl border border-border bg-sand p-8 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight">Ready to walk a home?</h2>
            <p className="mt-2 text-muted-foreground">
              See what is on the lot today, with the monthly payment shown up front.
            </p>
            <Link
              to="/homes"
              search={homesSearch()}
              className="mt-5 inline-flex h-12 items-center rounded-md bg-accent px-6 font-semibold text-accent-foreground hover:opacity-90"
            >
              Browse our homes
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileCallBar />
    </div>
  );
}
