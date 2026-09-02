import { queryOptions } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Quote, Star } from "lucide-react";
import { useState } from "react";

import { listReviews, type Review, type ReviewsPayload } from "@/lib/reviews.functions";

export const reviewsQuery = queryOptions({
  queryKey: ["reviews"],
  queryFn: () => listReviews(),
  staleTime: 10 * 60 * 1000,
});

export const GOOGLE_REVIEW_URL = "https://g.page/r/sandershousing/review";

export function StarRating({ value, size = 16 }: { value: number; size?: number }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden
          style={{ width: size, height: size }}
          className={
            i <= rounded ? "fill-accent text-accent" : "fill-transparent text-muted-foreground/40"
          }
        />
      ))}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const long = review.body.length > 260;
  const text = expanded || !long ? review.body : `${review.body.slice(0, 250).trimEnd()}...`;

  return (
    <figure className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <StarRating value={review.rating} />
        <Quote className="size-5 text-secondary" aria-hidden />
      </div>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-foreground/90">
        {text}
        {long && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="ml-1 font-semibold text-accent hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
          {initials(review.author)}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-semibold">{review.author}</span>
          <span className="block text-sm text-muted-foreground">{formatDate(review.date)}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function RatingStrip({
  data,
  className = "",
}: {
  data: ReviewsPayload;
  className?: string;
}) {
  return (
    <Link
      to="/reviews"
      className={`inline-flex items-center gap-2 rounded-md bg-sand px-3 py-2 text-sm hover:bg-secondary/40 ${className}`}
    >
      <StarRating value={data.average} size={14} />
      <span className="font-semibold">{data.average.toFixed(1)}</span>
      <span className="text-muted-foreground">
        from {data.total.toLocaleString()} customer reviews
      </span>
    </Link>
  );
}

export function ReviewsSection({ data, limit = 6 }: { data: ReviewsPayload; limit?: number }) {
  const picks = data.reviews.slice(0, limit);

  return (
    <section id="reviews" className="border-y border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-caps text-accent">What our customers say</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {data.total.toLocaleString()} families, one honest process
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Real reviews from people who bought, financed, and set up a home with the Sanders
              team on the Gulf Coast.
            </p>
          </div>
          <div className="shrink-0 rounded-xl border border-border bg-sand p-5 text-center">
            <p className="font-display text-4xl font-extrabold leading-none">
              {data.average.toFixed(1)}
            </p>
            <div className="mt-2 flex justify-center">
              <StarRating value={data.average} size={18} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {data.total.toLocaleString()} reviews
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {picks.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/reviews"
            className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-card px-6 font-semibold hover:bg-secondary"
          >
            See all reviews
          </Link>
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-12 items-center justify-center rounded-md px-4 font-semibold text-accent hover:underline"
          >
            Leave us a review
          </a>
        </div>
      </div>
    </section>
  );
}
