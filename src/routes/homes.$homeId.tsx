import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Bath, BedDouble, Camera, CheckCircle2, MapPin, Phone, Ruler, Square } from "lucide-react";

import { estimateMonthly, homesSearch, money, type Home } from "@/components/site/data";
import { HomeCard } from "@/components/site/HomeCard";
import { InquiryDialog } from "@/components/site/InquiryDialog";
import { RatingStrip, reviewsQuery } from "@/components/site/Reviews";
import { MobileCallBar, SiteFooter } from "@/components/site/SiteFooter";
import { ShareActions } from "@/components/site/ShareActions";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPublicHome, listPublicHomes } from "@/lib/homes.functions";

export const Route = createFileRoute("/homes/$homeId")({
  loader: async ({ params }) => {
    const [home, all] = await Promise.all([
      getPublicHome({ data: { id: params.homeId } }),
      listPublicHomes(),
    ]);
    if (!home) throw notFound();
    return { home, all };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Home not found | Sanders Housing" }, { name: "robots", content: "noindex" }],
      };
    }
    const { home } = loaderData;
    const title = `${home.name} by ${home.builder}: ${home.beds} bed, ${home.dimensions} | Sanders Housing`;
    const description = `${home.name}: ${home.beds} bed, ${home.baths} bath, ${home.sqft.toLocaleString("en-US")} sq ft ${home.sectionType.toLowerCase()} manufactured home on our Pensacola lot. Full specs, features and floor plan.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold">We couldn't load this home.</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: HomeNotFound,
  component: HomeDetail,
});


function HomeNotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-extrabold">We can't find that home.</h1>
        <p className="mt-3 text-muted-foreground">
          It may have sold or moved off the lot. Browse what's here now.
        </p>
        <Link
          to="/homes"
          search={homesSearch()}
          className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-primary px-5 font-semibold text-primary-foreground"
        >
          Browse all homes
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function Overview({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}

function HomeDetail() {
  const { home, all } = Route.useLoaderData() as { home: Home; all: Home[] };
  const [active, setActive] = useState(0);
  const monthly = home.price ? estimateMonthly(home.price) : null;

  // Uploaded photos first; otherwise fall back to lot photography for the gallery.
  const gallery = (
    home.photos.length > 0
      ? home.photos
      : [home.image, ...all.filter((h) => h.id !== home.id).map((h) => h.image)]
  ).slice(0, 5);

  const similar = all
    .filter((h) => h.id !== home.id && (h.sectionType === home.sectionType || h.beds === home.beds))
    .slice(0, 3);


  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <SiteHeader />

      <main>
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link to="/homes" search={homesSearch()} className="hover:text-primary">
                Our homes
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="font-medium text-foreground">{home.name}</li>
          </ol>
        </nav>

        <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap gap-1.5">
            {home.statuses.map((s) => (
              <span key={s} className="label-caps rounded bg-secondary px-2 py-1 text-foreground">
                {s}
              </span>
            ))}
            <span className="label-caps rounded bg-secondary px-2 py-1 text-foreground">
              {home.sectionType}
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">{home.name}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden /> {home.address}
            </span>
            <span>Built by {home.builder}</span>
            <span>Added {home.dateAdded}</span>
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-xl">
            <img
              src={gallery[active]}
              alt={`${home.name} manufactured home by ${home.builder}`}
              width={1600}
              height={900}
              className="aspect-[16/9] w-full object-cover"
            />
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded bg-ink/80 px-3 py-1.5 text-sm font-semibold text-background">
              <Camera className="size-4" aria-hidden /> {home.photoCount} photos
            </span>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-3">
            {gallery.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === active}
                className={`overflow-hidden rounded-lg border-2 ${
                  i === active ? "border-primary" : "border-transparent"
                }`}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div>
            <div className="grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-xl border border-border sm:grid-cols-4 sm:divide-y-0">
              {[
                { icon: BedDouble, label: "Bedrooms", value: String(home.beds) },
                { icon: Bath, label: "Bathrooms", value: String(home.baths) },
                {
                  icon: Square,
                  label: "Area",
                  value: `${home.sqft.toLocaleString("en-US")} sq ft`,
                },
                { icon: Ruler, label: "Size", value: home.dimensions },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex flex-col items-center gap-1 bg-card p-4">
                  <Icon className="size-5 text-primary" aria-hidden />
                  <span className="font-display text-xl font-extrabold">{value}</span>
                  <span className="label-caps text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            <h2 className="mt-10 text-2xl font-extrabold">Overview</h2>
            <dl className="mt-3 grid gap-x-10 sm:grid-cols-2">
              <Overview label="Property ID" value={home.propertyId} />
              <Overview label="Builder" value={home.builder} />
              <Overview label="Bedrooms" value={String(home.beds)} />
              <Overview label="Bathrooms" value={String(home.baths)} />
              <Overview label="Area" value={`${home.sqft.toLocaleString("en-US")} sq ft`} />
              <Overview label="Size" value={home.dimensions} />
              <Overview label="Section type" value={home.sectionType} />
              <Overview label="Wind rating" value={home.windZone} />
              <Overview label="Status" value={home.statuses.join(", ")} />
              <Overview label="Added" value={home.dateAdded} />
            </dl>

            <h2 className="mt-10 text-2xl font-extrabold">Features</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {home.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[15px]">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-2xl font-extrabold">Floor plan</h2>
            <div className="surface-card mt-3 rounded-xl p-5">
              <dl className="grid grid-cols-3 gap-4 border-b border-border pb-4">
                <div>
                  <dt className="label-caps text-muted-foreground">Bedrooms</dt>
                  <dd className="font-display text-xl font-extrabold">{home.beds}</dd>
                </div>
                <div>
                  <dt className="label-caps text-muted-foreground">Bathrooms</dt>
                  <dd className="font-display text-xl font-extrabold">{home.baths}</dd>
                </div>
                <div>
                  <dt className="label-caps text-muted-foreground">Size</dt>
                  <dd className="font-display text-xl font-extrabold">
                    {home.sqft.toLocaleString("en-US")} sq ft
                  </dd>
                </div>
              </dl>
              {home.floorPlanUrl ? (
                <img
                  src={home.floorPlanUrl}
                  alt={`${home.name} floor plan, ${home.dimensions}`}
                  loading="lazy"
                  className="mt-4 w-full rounded-lg border border-border bg-white object-contain"
                />
              ) : (
                <div className="mt-4 flex aspect-[16/9] items-center justify-center rounded-lg border border-dashed border-border bg-sand text-center">
                  <p className="max-w-[36ch] px-6 text-[15px] text-muted-foreground">
                    Call us for the {home.dimensions} floor plan, we'll send it over the same day.
                  </p>
                </div>
              )}
              <a
                href="tel:18504740261"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-md border border-border px-4 font-semibold hover:bg-secondary"
              >
                Request the floor plan
              </a>
            </div>

            {home.virtualTourUrl && (
              <>
                <h2 className="mt-10 text-2xl font-extrabold">Take the 3D tour</h2>
                <p className="mt-2 max-w-[62ch] text-[15px] text-muted-foreground">
                  Walk every room from your phone or desktop, then come see it in person on our
                  Pensacola lot.
                </p>
                <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl border border-border bg-sand">
                  <iframe
                    src={home.virtualTourUrl}
                    title={`${home.name} virtual tour`}
                    loading="lazy"
                    allowFullScreen
                    allow="accelerometer; gyroscope; fullscreen; vr; xr-spatial-tracking"
                    className="size-full"
                  />
                </div>
                <a
                  href={home.virtualTourUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex h-11 items-center justify-center rounded-md border border-border px-4 font-semibold hover:bg-secondary"
                >
                  Open the tour full screen
                </a>
              </>
            )}


            <div className="mt-8">
              <ShareActions home={home} />
            </div>

            <h2 className="mt-10 text-2xl font-extrabold">About this home</h2>
            <HomeDescription text={home.description} collapsible className="mt-3" />

            <div className="mt-6 rounded-xl bg-sand p-5">
              <p className="font-display text-lg font-extrabold">The Sanders guarantee</p>
              <p className="mt-1 max-w-[62ch] text-[15px] text-muted-foreground">
                First home, growing family, or downsizing from a site-built house, we'll find a
                home that fits your budget and handle delivery, set and tie-down after you sign.
              </p>
            </div>
          </div>

          <aside className="surface-card rounded-xl p-6 lg:sticky lg:top-24">
            {monthly && home.price ? (
              <>
                <p className="label-caps text-muted-foreground">Est. payment</p>
                <p className="font-display text-4xl font-extrabold text-primary">
                  {money(monthly)}
                  <span className="text-lg font-semibold text-muted-foreground">/mo</span>
                </p>
                <p className="mt-1 text-[15px]">
                  Cash price <strong className="font-display">{money(home.price)}</strong>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Est. 10% down, 20 yr, 8.99% APR. Your rate depends on credit and land.
                </p>
              </>
            ) : (
              <>
                <p className="label-caps text-muted-foreground">Your payment</p>
                <p className="font-display text-3xl font-extrabold text-primary">
                  Get your payment
                </p>
                <p className="mt-1 text-[15px] text-muted-foreground">
                  Pricing varies by options and land, we'll quote it same day.
                </p>
              </>
            )}

            <Link
              to="/"
              hash="qualify"
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent px-5 font-semibold text-accent-foreground hover:opacity-90"
            >
              See if you qualify: no credit hit
            </Link>
            <TrustStrip />
            <InquiryDialog
              home={home}
              label="Ask about this home"
              className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-md bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90"
            />
            <a
              href="tel:18504740261"
              className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md border border-border font-semibold hover:bg-secondary"
            >
              <Phone className="size-4" aria-hidden /> 1-850-474-0261
            </a>
            <p className="mt-4 border-t border-border pt-4 text-[13px] text-muted-foreground">
              Rated {home.windZone} for coastal Florida. Ask to see the data plate when you walk
              it.
            </p>
          </aside>
        </section>

        {similar.length > 0 && (
          <section className="border-t border-border bg-sand">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
              <h2 className="text-2xl font-extrabold">Similar homes</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((h) => (
                  <HomeCard key={h.id} home={h} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
      <MobileCallBar />
    </div>
  );
}

function TrustStrip() {
  const { data } = useQuery(reviewsQuery);
  if (!data) return null;
  return <RatingStrip data={data} className="mt-4" />;
}
