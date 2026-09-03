import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";

import logo from "@/assets/sanders-logo.png.asset.json";
import { estimateMonthly, homesSearch, money, type Home } from "@/components/site/data";
import { HomeDescription } from "@/components/site/HomeDescription";
import { homeUrl } from "@/components/site/ShareActions";
import { getPublicHome } from "@/lib/homes.functions";

export const Route = createFileRoute("/flyer/$homeId")({
  loader: async ({ params }) => {
    const home = await getPublicHome({ data: { id: params.homeId } });
    if (!home) throw notFound();
    return { home };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.home.name ?? "Home";
    const title = `${name} flyer | Sanders Housing`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Printable one-page spec sheet for the ${name} at Sanders Manufactured Housing in Pensacola, FL.`,
        },
        { name: "robots", content: "noindex" },
        { property: "og:title", content: title },
        { property: "og:description", content: `Printable spec sheet for the ${name}.` },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold">We couldn't build that flyer.</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold">That home isn't on the lot.</h1>
      <Link
        to="/homes"
        search={homesSearch()}
        className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-primary px-5 font-semibold text-primary-foreground"
      >
        Browse all homes
      </Link>
    </div>
  ),
  component: FlyerPage,
});

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="label-caps text-muted-foreground">{label}</p>
      <p className="font-display text-xl font-extrabold leading-tight">{value}</p>
    </div>
  );
}

function FlyerPage() {
  const { home } = Route.useLoaderData() as { home: Home };
  const monthly = home.price ? estimateMonthly(home.price) : null;
  const shots = (home.photos.length > 0 ? home.photos : [home.image]).slice(0, 4);
  const hero = shots[0] ?? home.image;
  const strip = shots.slice(1, 4);

  useEffect(() => {
    document.title = `${home.name} | Sanders Housing flyer`;
  }, [home.name]);

  return (
    <div className="min-h-screen bg-sand py-6 print:bg-white print:py-0">
      <div className="mx-auto flex max-w-[8.5in] flex-wrap items-center justify-between gap-3 px-4 pb-4 print:hidden">
        <Link
          to="/homes/$homeId"
          params={{ homeId: home.id }}
          className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-card px-4 font-semibold hover:bg-secondary"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back to the home
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90"
        >
          <Printer className="size-4" aria-hidden /> Print this flyer
        </button>
      </div>

      <article className="mx-auto w-full max-w-[8.5in] bg-background p-8 shadow-sm print:max-w-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b-4 border-primary pb-4">
          <div>
            <img
              src={logo.url}
              alt="Sanders Manufactured Housing"
              width={500}
              height={261}
              className="h-12 w-auto"
            />
            <p className="mt-2 text-[13px] text-muted-foreground">
              10300 Pensacola Blvd, Pensacola, FL · 1-850-474-0261
            </p>
          </div>
          <div className="text-right">
            <p className="label-caps text-muted-foreground">Property ID</p>
            <p className="font-display text-lg font-extrabold">{home.propertyId || home.id}</p>
            {home.statuses.length > 0 && (
              <p className="mt-1 inline-block rounded bg-accent px-2 py-1 text-[11px] font-extrabold uppercase tracking-wide text-accent-foreground">
                {home.statuses.join(" · ")}
              </p>
            )}
          </div>
        </header>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold leading-none">{home.name}</h1>
            <p className="mt-1 text-[15px] text-muted-foreground">
              {home.sectionType} by {home.builder} · {home.windZone}
            </p>
          </div>
          <div className="rounded-lg bg-sand px-5 py-3 text-right">
            {monthly && home.price ? (
              <>
                <p className="label-caps text-muted-foreground">Est. payment</p>
                <p className="font-display text-3xl font-extrabold text-primary">
                  {money(monthly)}
                  <span className="text-base font-semibold text-muted-foreground">/mo</span>
                </p>
                <p className="text-[12px] text-muted-foreground">Cash price {money(home.price)}</p>
              </>
            ) : (
              <>
                <p className="label-caps text-muted-foreground">Your payment</p>
                <p className="font-display text-2xl font-extrabold text-primary">
                  Quoted same day
                </p>
                <p className="text-[12px] text-muted-foreground">Call for your number</p>
              </>
            )}
          </div>
        </div>

        <img
          src={hero}
          alt={`${home.name} by ${home.builder}`}
          className="mt-5 aspect-[16/9] w-full rounded-lg object-cover"
        />
        {strip.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            {strip.map((src, i) => (
              <img
                key={`${src}-${i}`}
                src={src}
                alt=""
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Spec label="Beds" value={String(home.beds)} />
          <Spec label="Baths" value={String(home.baths)} />
          <Spec label="Sq ft" value={home.sqft.toLocaleString("en-US")} />
          <Spec label="Size" value={home.dimensions} />
          <Spec label="Sections" value={home.sectionType.replace(" Section", "")} />
        </div>

        {home.features.length > 0 && (
          <section className="mt-6">
            <h2 className="font-display text-lg font-extrabold uppercase tracking-wide">
              Features
            </h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-[13px] sm:grid-cols-3">
              {home.features.map((f) => (
                <li key={f} className="flex gap-1.5">
                  <span aria-hidden className="text-primary">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </section>
        )}

        {home.floorPlanUrl && (
          <section className="mt-6">
            <h2 className="font-display text-lg font-extrabold uppercase tracking-wide">
              Floor plan
            </h2>
            <img
              src={home.floorPlanUrl}
              alt={`${home.name} floor plan`}
              className="mt-2 max-h-[420px] w-full rounded-md border border-border object-contain"
            />
          </section>
        )}


        {home.description && (
          <section className="mt-6">
            <h2 className="font-display text-lg font-extrabold uppercase tracking-wide">
              About this home
            </h2>
            <HomeDescription
              text={home.description}
              className="mt-2 max-w-none text-[13px] leading-relaxed"
            />
          </section>
        )}

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-4 border-primary pt-4">
          <div>
            <p className="font-display text-xl font-extrabold">
              Walk it today, Mon–Sat 9–6
            </p>
            <p className="text-[13px] text-muted-foreground">
              Ask about delivery, set and tie-down on your land. Equal Housing Opportunity.
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-extrabold text-primary">1-850-474-0261</p>
            <p className="text-[12px] text-muted-foreground">{homeUrl(home)}</p>
          </div>
        </footer>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Payment estimate assumes 10% down, 20 years, 8.99% APR. Illustrative only, not an offer
          of credit. Specs and features subject to change.
        </p>
      </article>
    </div>
  );
}
