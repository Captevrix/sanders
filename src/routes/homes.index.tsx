import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { createFileRoute, Link, stripSearchParams, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, MapPin, Search, SlidersHorizontal, X } from "lucide-react";

import {
  SECTION_TYPES,
  STATUSES,
  estimateMonthly,
  featureCounts,
  isOnSite,
  money,
  HOMES_SEARCH_DEFAULTS as DEFAULTS,
  type HomesSearch,
} from "@/components/site/data";
import { HomeCard } from "@/components/site/HomeCard";
import { MobileCallBar, SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { listPublicHomes } from "@/lib/homes.functions";

export const homesQuery = queryOptions({
  queryKey: ["public-homes"],
  queryFn: () => listPublicHomes(),
});

const TITLE = "Browse Manufactured Homes in Pensacola, FL | Sanders Housing";
const DESCRIPTION =
  "Filter the Sanders Housing lot by status, single or multi section, bedrooms and features. Full specs, box sizes and floor plans on every home.";

export const Route = createFileRoute("/homes/")({
  validateSearch: (raw: Record<string, unknown>): HomesSearch => ({
    q: typeof raw["q"] === "string" ? (raw["q"] as string).slice(0, 80) : DEFAULTS.q,
    onSite: raw["onSite"] === true || raw["onSite"] === "true",
    status: typeof raw["status"] === "string" ? (raw["status"] as string) : DEFAULTS.status,
    type: typeof raw["type"] === "string" ? (raw["type"] as string) : DEFAULTS.type,
    beds: Number(raw["beds"]) || DEFAULTS.beds,
    features: Array.isArray(raw["features"])
      ? (raw["features"] as unknown[]).filter((f): f is string => typeof f === "string")
      : DEFAULTS.features,
    maxPayment: Number(raw["maxPayment"]) || DEFAULTS.maxPayment,
  }),
  search: { middlewares: [stripSearchParams(DEFAULTS)] },
  loader: ({ context }) => context.queryClient.ensureQueryData(homesQuery),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold">We couldn't load the lot right now.</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">No homes found.</div>
  ),
  component: HomesIndex,
});

const selectClass =
  "h-12 w-full rounded-md border border-input bg-background px-3 text-[15px] font-medium";

function HomesIndex() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [showFeatures, setShowFeatures] = useState(search.features.length > 0);
  const { data: homes } = useSuspenseQuery(homesQuery);

  const allFeatures = useMemo(() => featureCounts(homes), [homes]);

  const setSearch = (patch: Partial<HomesSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const toggleFeature = (feature: string) =>
    setSearch({
      features: search.features.includes(feature)
        ? search.features.filter((f) => f !== feature)
        : [...search.features, feature],
    });

  const results = useMemo(
    () => {
      const q = search.q.trim().toLowerCase();
      return homes.filter((home) => {
        if (search.onSite && !isOnSite(home)) return false;
        if (
          q &&
          ![home.name, home.builder, home.propertyId, home.dimensions, home.sectionType]
            .join(" ")
            .toLowerCase()
            .includes(q)
        )
          return false;
        if (search.status !== "All" && !home.statuses.includes(search.status)) return false;
        if (search.type !== "All" && home.sectionType !== search.type) return false;
        if (search.beds > 0 && home.beds < search.beds) return false;
        if (!search.features.every((f) => home.features.includes(f))) return false;
        if (search.maxPayment > 0) {
          if (!home.price) return false;
          if (estimateMonthly(home.price) > search.maxPayment) return false;
        }
        return true;
      });
    },
    [homes, search],
  );

  const onSiteCount = useMemo(() => homes.filter(isOnSite).length, [homes]);

  const activeChips: { label: string; clear: Partial<HomesSearch> }[] = [
    ...(search.q ? [{ label: `"${search.q}"`, clear: { q: "" } }] : []),
    ...(search.onSite ? [{ label: "On our lot", clear: { onSite: false } }] : []),
    ...(search.status !== "All" ? [{ label: search.status, clear: { status: "All" } }] : []),
    ...(search.type !== "All" ? [{ label: search.type, clear: { type: "All" } }] : []),
    ...(search.beds > 0 ? [{ label: `${search.beds}+ beds`, clear: { beds: 0 } }] : []),
    ...(search.maxPayment > 0
      ? [{ label: `Under ${money(search.maxPayment)}/mo`, clear: { maxPayment: 0 } }]
      : []),
    ...search.features.map((f) => ({
      label: f,
      clear: { features: search.features.filter((x) => x !== f) },
    })),
  ];

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <SiteHeader />

      <main>
        <section className="border-b border-border bg-sand">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
            <p className="label-caps text-muted-foreground">Our homes</p>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
              Every home on the Pensacola lot
            </h1>
            <p className="mt-2 max-w-[62ch] text-muted-foreground">
              Beds, baths, square footage, box size, builder and the full feature list on every
              home — filter down to exactly what fits your lot and your budget.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  type="search"
                  value={search.q}
                  onChange={(e) => setSearch({ q: e.target.value })}
                  placeholder="Search by model, builder, size or stock number"
                  aria-label="Search homes"
                  className="h-12 w-full rounded-md border border-border bg-background pl-9 pr-3 text-[15px]"
                />
              </div>
              <button
                type="button"
                onClick={() => setSearch({ onSite: !search.onSite })}
                aria-pressed={search.onSite}
                className={`inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md border px-4 font-semibold ${
                  search.onSite
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-secondary"
                }`}
              >
                <MapPin className="size-4" aria-hidden />
                On our lot now ({onSiteCount})
              </button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block">
                <span className="label-caps text-muted-foreground">Status</span>
                <select
                  className={`mt-1.5 ${selectClass}`}
                  value={search.status}
                  onChange={(e) => setSearch({ status: e.target.value })}
                >
                  <option value="All">All status</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="label-caps text-muted-foreground">Type</span>
                <select
                  className={`mt-1.5 ${selectClass}`}
                  value={search.type}
                  onChange={(e) => setSearch({ type: e.target.value })}
                >
                  <option value="All">All types</option>
                  {SECTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="label-caps text-muted-foreground">Beds</span>
                <select
                  className={`mt-1.5 ${selectClass}`}
                  value={search.beds}
                  onChange={(e) => setSearch({ beds: Number(e.target.value) })}
                >
                  <option value={0}>All beds</option>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}+
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <span className="label-caps text-muted-foreground">
                  Max payment{" "}
                  {search.maxPayment > 0 ? (
                    <strong className="text-primary">{money(search.maxPayment)}/mo</strong>
                  ) : (
                    "— any"
                  )}
                </span>
                <input
                  type="range"
                  min={0}
                  max={2200}
                  step={50}
                  value={search.maxPayment}
                  onChange={(e) => setSearch({ maxPayment: Number(e.target.value) })}
                  aria-label="Maximum estimated monthly payment"
                  className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-sand-deep accent-accent"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Applies to priced homes only.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFeatures((v) => !v)}
              aria-expanded={showFeatures}
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-md border border-border bg-card px-4 font-semibold hover:bg-secondary"
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              Looking for certain features
              <ChevronDown
                className={`size-4 transition-transform ${showFeatures ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>

            {showFeatures && (
              <div className="mt-4 grid gap-x-6 gap-y-2 rounded-xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-3">
                {allFeatures.map(([feature, count]) => (
                  <label
                    key={feature}
                    className="flex cursor-pointer items-center gap-2 text-[15px]"
                  >
                    <input
                      type="checkbox"
                      checked={search.features.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="size-4 accent-primary"
                    />
                    <span>{feature}</span>
                    <span className="text-muted-foreground">({count})</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] font-semibold">
              {results.length} {results.length === 1 ? "home" : "homes"} match
            </p>
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setSearch(chip.clear)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[13px] font-medium hover:bg-secondary"
                  >
                    {chip.label}
                    <X className="size-3.5" aria-hidden />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSearch(DEFAULTS)}
                  className="text-[13px] font-semibold text-primary underline underline-offset-4"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {results.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((home) => (
                <HomeCard key={home.id} home={home} />
              ))}
            </div>
          ) : (
            <div className="surface-card mt-6 rounded-xl p-10 text-center">
              <p className="font-display text-xl font-extrabold">No homes match those filters.</p>
              <p className="mt-2 text-muted-foreground">
                New homes land on the lot weekly — call us and we'll tell you what's coming.
              </p>
              <button
                type="button"
                onClick={() => setSearch(DEFAULTS)}
                className="mt-5 inline-flex h-12 items-center justify-center rounded-md bg-primary px-5 font-semibold text-primary-foreground"
              >
                Clear all filters
              </button>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/"
              hash="qualify"
              className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-5 font-semibold text-accent-foreground hover:opacity-90"
            >
              See if you qualify — no credit hit
            </Link>
            <a
              href="tel:18504740261"
              className="inline-flex h-12 items-center justify-center rounded-md border border-border px-5 font-semibold hover:bg-secondary"
            >
              Call 1-850-474-0261
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
      <MobileCallBar />
    </div>
  );
}
