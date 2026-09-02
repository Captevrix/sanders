import { useQuery } from "@tanstack/react-query";
import { RatingStrip, reviewsQuery } from "@/components/site/Reviews";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, Landmark, PiggyBank, ShieldCheck } from "lucide-react";

import { estimateMonthly, homesSearch, money } from "@/components/site/data";
import { MobileCallBar, SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

const TITLE = "Manufactured Home Financing in Pensacola, FL | Sanders Housing";
const DESCRIPTION =
  "Chattel and land-home loans, FHA and VA programs, down payment ranges and a payment calculator. Get pre-qualified with no hit to your credit.";

export const Route = createFileRoute("/financing")({
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
  component: FinancingPage,
});

const PROGRAMS = [
  {
    icon: PiggyBank,
    title: "Chattel (home only)",
    body: "For homes going into a park or on land you don't own. Faster to close, higher rate, 15–25 year terms, typically 5–20% down.",
  },
  {
    icon: Landmark,
    title: "Land-home loan",
    body: "Home and land financed together as real property. Lower rates and longer terms, often the cheapest monthly payment if you own or are buying land.",
  },
  {
    icon: ShieldCheck,
    title: "FHA & VA",
    body: "Government-backed programs with low down payments. VA can reach zero down for eligible veterans. Both have property and setup requirements we handle.",
  },
  {
    icon: BadgeCheck,
    title: "Trade-in & land equity",
    body: "Equity in land you already own, or a home you're trading, can count toward your down payment.",
  },
];

function Calculator() {
  const [price, setPrice] = useState(120000);
  const [downPct, setDownPct] = useState(10);
  const [years, setYears] = useState(20);
  const [apr, setApr] = useState(8.99);

  const monthly = estimateMonthly(price, downPct / 100, apr / 100, years);

  return (
    <div className="surface-card rounded-xl p-6">
      <h2 className="text-2xl font-extrabold">Payment calculator</h2>
      <p className="mt-1 text-[15px] text-muted-foreground">
        Move the sliders to see how price, down payment and term change the monthly number.
      </p>

      <div className="mt-6 grid gap-5">
        <label className="block">
          <span className="flex justify-between text-[15px] font-semibold">
            Home price <span className="text-primary">{money(price)}</span>
          </span>
          <input
            type="range"
            min={40000}
            max={300000}
            step={1000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-sand-deep accent-accent"
          />
        </label>

        <label className="block">
          <span className="flex justify-between text-[15px] font-semibold">
            Down payment{" "}
            <span className="text-primary">
              {downPct}% · {money(Math.round((price * downPct) / 100))}
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={35}
            step={1}
            value={downPct}
            onChange={(e) => setDownPct(Number(e.target.value))}
            className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-sand-deep accent-accent"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="flex justify-between text-[15px] font-semibold">
              Term <span className="text-primary">{years} yrs</span>
            </span>
            <input
              type="range"
              min={10}
              max={30}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-sand-deep accent-accent"
            />
          </label>
          <label className="block">
            <span className="flex justify-between text-[15px] font-semibold">
              Rate <span className="text-primary">{apr.toFixed(2)}% APR</span>
            </span>
            <input
              type="range"
              min={5}
              max={14}
              step={0.25}
              value={apr}
              onChange={(e) => setApr(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-sand-deep accent-accent"
            />
          </label>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-sand p-5">
        <p className="label-caps text-muted-foreground">Estimated payment</p>
        <p className="font-display text-4xl font-extrabold text-primary">
          {money(monthly)}
          <span className="text-lg font-semibold text-muted-foreground">/mo</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Principal and interest only. Taxes, insurance and setup are quoted separately. This is an
          illustration, not an offer of credit.
        </p>
      </div>
    </div>
  );
}

function TrustStrip() {
  const { data } = useQuery(reviewsQuery);
  if (!data) return null;
  return <RatingStrip data={data} className="mt-4" />;
}

function FinancingPage() {
  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-sand">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="label-caps text-muted-foreground">Financing</p>
            <TrustStrip />
            <h1 className="mt-2 max-w-[22ch] text-3xl font-extrabold sm:text-5xl">
              Start with the payment, not the sticker
            </h1>
            <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-muted-foreground">
              Most families here shop by monthly payment. We work with lenders who finance
              manufactured homes every day, in a park, on your own land, or with land you're still
              buying, and a pre-qualification takes minutes with no hit to your credit.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/"
                hash="qualify"
                className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-5 font-semibold text-accent-foreground hover:opacity-90"
              >
                See if you qualify: no credit hit
              </Link>
              <a
                href="tel:18504740261"
                className="inline-flex h-12 items-center justify-center rounded-md border border-border px-5 font-semibold hover:bg-secondary"
              >
                Call 1-850-474-0261
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div>
            <h2 className="text-2xl font-extrabold">Loan programs we work with</h2>
            <div className="mt-5 grid gap-4">
              {PROGRAMS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="surface-card rounded-xl p-5">
                  <div className="flex items-center gap-2">
                    <Icon className="size-5 text-primary" aria-hidden />
                    <h3 className="text-lg font-extrabold">{title}</h3>
                  </div>
                  <p className="mt-1.5 text-[15px] text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-10 text-2xl font-extrabold">What to bring</h2>
            <ul className="mt-3 grid gap-2 text-[15px] text-muted-foreground">
              {[
                "Photo ID for everyone on the loan",
                "Two recent pay stubs or two years of tax returns if self-employed",
                "Rough idea of monthly debts (car, cards, child support)",
                "Where the home is going, address, park name, or the parcel number",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden className="text-primary">
                    •
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Calculator />
        </section>

        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6">
            <h2 className="text-2xl font-extrabold">Know your number, then pick the home</h2>
            <p className="mx-auto mt-2 max-w-[54ch] text-muted-foreground">
              Filter the lot by the payment you're comfortable with and see exactly what fits.
            </p>
            <Link
              to="/homes"
              search={homesSearch({ maxPayment: 1200 })}
              className="mt-5 inline-flex h-12 items-center justify-center rounded-md bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90"
            >
              Browse homes under $1,200/mo
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileCallBar />
    </div>
  );
}
