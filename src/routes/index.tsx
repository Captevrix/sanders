import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Phone,
  ShieldCheck,
  Truck,
  Wrench,
  FileCheck2,
  MapPin,
  Ruler,
  CheckCircle2,
} from "lucide-react";

import awardImg from "@/assets/best-of-2026-award.webp.asset.json";
import heroHome from "@/assets/hero-home.jpg";
import setupImg from "@/assets/setup.jpg";
import {
  ConsentFields,
  consentPayload,
  EMPTY_CONSENT,
  type ConsentState,
} from "@/components/site/ConsentFields";
import { estimateMonthly, homesSearch, money, type Home } from "@/components/site/data";

import { HomeCard } from "@/components/site/HomeCard";
import { ReviewsSection, reviewsQuery } from "@/components/site/Reviews";
import { MobileCallBar, SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { submitLead } from "@/lib/homes.functions";
import { homesQuery } from "./homes.index";

const TITLE = "Manufactured Homes in Pensacola, FL | Sanders Housing";
const DESCRIPTION =
  "Gulf Coast manufactured homes with the monthly payment shown up front. Browse single and multi section homes, check what you qualify for, and get delivery and setup handled.";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(homesQuery),
      context.queryClient.ensureQueryData(reviewsQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold">We couldn't load the lot right now.</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">Nothing here.</div>
  ),
  component: Index,
});

function PaymentEstimator({ homes }: { homes: Home[] }) {
  const [budget, setBudget] = useState(1100);
  const priced = homes.filter((h) => typeof h.price === "number");
  const unpriced = homes.length - priced.length;

  const affordable = useMemo(() => {
    // invert the payment formula to a rough max cash price
    const r = 0.0899 / 12;
    const n = 240;
    const principal = (budget * (1 - Math.pow(1 + r, -n))) / r;
    return Math.round(principal / 0.9 / 1000) * 1000;
  }, [budget]);

  const matches = priced.filter((h) => estimateMonthly(h.price!) <= budget).length;

  return (
    <div className="surface-card rounded-xl p-5 sm:p-6">
      <p className="label-caps text-muted-foreground">Start with your budget</p>
      <h2 className="mt-2 text-2xl font-bold">What can I afford a month?</h2>

      <label htmlFor="budget" className="mt-5 block text-[15px] font-medium">
        My comfortable monthly payment
      </label>
      <p className="font-display text-4xl font-extrabold text-primary">
        {money(budget)}
        <span className="text-lg font-semibold text-muted-foreground">/mo</span>
      </p>
      <input
        id="budget"
        type="range"
        min={500}
        max={2200}
        step={25}
        value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-sand-deep accent-accent"
      />
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>$500</span>
        <span>$2,200</span>
      </div>

      <div className="mt-5 rounded-lg bg-sand px-4 py-3">
        <p className="text-[15px]">
          That's roughly a{" "}
          <strong className="font-display text-lg">{money(affordable)}</strong> home.{" "}
          <strong>{matches}</strong> of our {priced.length} priced{" "}
          {matches === 1 ? "homes fits" : "homes fit"} it today, and {unpriced} more{" "}
          {unpriced === 1 ? "is" : "are"} quoted with your options, so call and we'll price{" "}
          {unpriced === 1 ? "it" : "them"} against this number.
        </p>
        <Link
          to="/homes"
          search={homesSearch({ maxPayment: budget })}
          className="mt-2 inline-flex items-center gap-1 text-[14px] font-semibold text-primary underline underline-offset-4 hover:text-foreground"
        >
          See the homes that fit this budget
        </Link>
      </div>

      <a
        href="#qualify"
        className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent px-5 font-semibold text-accent-foreground hover:opacity-90"
      >
        See if you qualify: no credit hit
      </a>
    </div>
  );
}

function QualifyForm() {
  const [form, setForm] = useState({ name: "", phone: "", land: "Yes", budget: "Under $800" });
  const [consent, setConsent] = useState<ConsentState>(EMPTY_CONSENT);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!consent.sms) {
      setError("Please check the box agreeing to be contacted so we can reply.");
      return;
    }
    setState("busy");
    try {
      await submitLead({
        data: {
          name: form.name,
          phone: form.phone,
          message: `Owns land: ${form.land}. Comfortable payment: ${form.budget}.`,
          source: "qualify",
          ...consentPayload(consent),
        },
      });
      setState("done");
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }


  if (state === "done") {
    return (
      <div className="surface-card grid content-center gap-2 rounded-xl p-6 text-center">
        <p className="font-display text-2xl font-extrabold text-primary">Got it, {form.name}.</p>
        <p className="text-muted-foreground">
          We'll call you back today with what you qualify for. No credit hit, no pressure.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="surface-card grid gap-4 rounded-xl p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label-caps text-muted-foreground">Your name</span>
          <input
            type="text"
            required
            maxLength={120}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1.5 h-12 w-full rounded-md border border-input bg-background px-3 text-[16px]"
            placeholder="Jordan Alvarez"
          />
        </label>
        <label className="block">
          <span className="label-caps text-muted-foreground">Phone</span>
          <input
            type="tel"
            required
            maxLength={40}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1.5 h-12 w-full rounded-md border border-input bg-background px-3 text-[16px]"
            placeholder="(850) 000-0000"
          />
        </label>
      </div>
      <fieldset>
        <legend className="label-caps text-muted-foreground">Do you own land?</legend>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {["Yes", "No", "Not sure"].map((opt) => (
            <label
              key={opt}
              className="flex h-12 cursor-pointer items-center justify-center rounded-md border border-input bg-background font-semibold has-checked:border-primary has-checked:bg-secondary"
            >
              <input
                type="radio"
                name="land"
                value={opt}
                checked={form.land === opt}
                onChange={() => setForm({ ...form, land: opt })}
                className="sr-only"
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="label-caps text-muted-foreground">Comfortable monthly payment</span>
        <select
          value={form.budget}
          onChange={(e) => setForm({ ...form, budget: e.target.value })}
          className="mt-1.5 h-12 w-full rounded-md border border-input bg-background px-3 text-[16px]"
        >
          <option>Under $800</option>
          <option>$800 – $1,200</option>
          <option>$1,200 – $1,600</option>
          <option>$1,600+</option>
        </select>
      </label>
      <ConsentFields value={consent} onChange={setConsent} idPrefix="qualify" />
      {error && (

        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "busy"}
        className="h-12 rounded-md bg-accent font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {state === "busy" ? "Sending…" : "Check my options"}
      </button>
      <p className="text-xs text-muted-foreground">
        This is a soft inquiry. It will not affect your credit score.
      </p>
    </form>
  );
}


function Index() {
  const { data: homes } = useSuspenseQuery(homesQuery);
  const { data: reviews } = useSuspenseQuery(reviewsQuery);
  const featured = homes.slice(0, 6);

  return (
    <div id="top" className="min-h-screen pb-20 lg:pb-0">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative">
          <img
            src={heroHome}
            alt="Multi section manufactured home with a covered front porch on a Pensacola lot"
            width={1920}
            height={1088}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/70 to-ink/30" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="label-caps inline-flex items-center gap-2 rounded bg-background/90 px-3 py-1.5 text-foreground">
                <MapPin className="size-3.5" aria-hidden /> Pensacola, FL · Serving the Gulf Coast
                since 1998
              </p>
              <h1 className="mt-5 max-w-[16ch] text-4xl font-extrabold leading-[1.05] text-background sm:text-6xl">
                Know your payment before you ever call us.
              </h1>
              <p className="mt-5 max-w-[52ch] text-lg text-background/85">
                Every home on our lot shows the cash price and the estimated monthly payment. No
                "call for pricing," no runaround, just the numbers, then a person who picks up.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <a
                  href="#qualify"
                  className="surface-card flex items-center gap-3 rounded-lg px-4 py-3.5 text-left font-semibold hover:shadow-[var(--shadow-lift)]"
                >
                  <ShieldCheck className="size-5 shrink-0 text-primary" aria-hidden />I need
                  financing
                </a>
                <a
                  href="#inventory"
                  className="surface-card flex items-center gap-3 rounded-lg px-4 py-3.5 text-left font-semibold hover:shadow-[var(--shadow-lift)]"
                >
                  <Ruler className="size-5 shrink-0 text-primary" aria-hidden />I want floor plans
                </a>
                <a
                  href="#setup"
                  className="surface-card flex items-center gap-3 rounded-lg px-4 py-3.5 text-left font-semibold hover:shadow-[var(--shadow-lift)]"
                >
                  <Truck className="size-5 shrink-0 text-primary" aria-hidden />I own the land
                </a>
              </div>
            </div>

            <PaymentEstimator homes={homes} />
          </div>
        </section>

        {/* Inventory */}
        <section id="inventory" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-caps text-accent">On the lot</p>
              <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                Homes you can walk this week
              </h2>
              <p className="mt-2 max-w-[56ch] text-muted-foreground">
                Price, payment, square footage and box size on every card, so you know what fits
                your budget and your lot before you drive out.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/homes"
                search={homesSearch()}
                className="inline-flex h-11 items-center rounded-md bg-primary px-4 font-semibold text-primary-foreground"
              >
                See all {homes.length} homes
              </Link>
              <Link
                to="/homes"
                search={homesSearch({ type: "Single Section" })}
                className="inline-flex h-11 items-center rounded-md border border-border bg-card px-4 font-semibold hover:bg-secondary"
              >
                Single section
              </Link>
              <Link
                to="/homes"
                search={homesSearch({ type: "Multi Section" })}
                className="inline-flex h-11 items-center rounded-md border border-border bg-card px-4 font-semibold hover:bg-secondary"
              >
                Multi section
              </Link>
              <Link
                to="/homes"
                search={homesSearch({ maxPayment: 1000 })}
                className="inline-flex h-11 items-center rounded-md border border-border bg-card px-4 font-semibold hover:bg-secondary"
              >
                Under $1,000/mo
              </Link>
            </div>
          </div>


          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((home) => (
              <HomeCard key={home.id} home={home} />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              to="/homes"
              search={homesSearch()}
              className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-card px-6 font-semibold hover:bg-secondary"
            >
              Browse all {homes.length} homes with full specs
            </Link>
          </div>
        </section>

        <ReviewsSection data={reviews} />

        {/* Award */}
        <section className="border-y border-border bg-sand">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[auto_1fr]">
            <img
              src={awardImg.url}
              alt="Sanders Manufactured Housing, Best of 2026 Mobile Home Dealer award from BusinessRate, powered by Google Reviews"
              loading="lazy"
              width={1227}
              height={1536}
              className="mx-auto w-full max-w-[260px] rounded-xl shadow-lg"
            />
            <div>
              <p className="label-caps text-accent">Award winning</p>
              <h2 className="mt-2 max-w-[22ch] text-3xl font-extrabold sm:text-4xl">
                Pensacola's Best of 2026 Mobile Home Dealer
              </h2>
              <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-muted-foreground">
                Sanders Manufactured Housing was named a Best of 2026 Award Winner by BusinessRate,
                a ranking powered by Google Reviews. Real buyers, real reviews, one local lot that
                answers the phone.
              </p>
              <Link
                to="/about"
                className="mt-6 inline-flex h-12 items-center justify-center rounded-md border border-border bg-card px-6 font-semibold hover:bg-secondary"
              >
                More about our family business
              </Link>
            </div>
          </div>
        </section>

        {/* Land owner / setup */}
        <section id="setup" className="bg-sand">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center">
            <img
              src={setupImg}
              alt="A manufactured home being delivered and set on a rural property"
              loading="lazy"
              width={1280}
              height={960}
              className="w-full rounded-xl object-cover shadow-[var(--shadow-card)]"
            />
            <div>
              <p className="label-caps text-muted-foreground">If you already own land</p>
              <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                We handle everything after you sign.
              </h2>
              <p className="mt-3 max-w-[52ch] text-muted-foreground">
                Escambia, Santa Rosa, Okaloosa and Baldwin county. Tell us your lot size and we'll
                tell you what fits, what it costs, and when it lands.
              </p>

              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Truck, text: "Transport & delivery" },
                  { icon: Wrench, text: "Set, level & tie-downs" },
                  { icon: FileCheck2, text: "Permitting support" },
                  { icon: CheckCircle2, text: "Skirting, steps & A/C" },
                ].map(({ icon: Icon, text }) => (
                  <li
                    key={text}
                    className="flex items-center gap-3 rounded-lg bg-card px-4 py-3 font-semibold"
                  >
                    <Icon className="size-5 shrink-0 text-primary" aria-hidden />
                    {text}
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-[15px] text-muted-foreground">
                Typical delivery window: <strong className="text-foreground">4–8 weeks</strong> from
                contract for in-stock homes.
              </p>
            </div>
          </div>
        </section>

        {/* Trust */}
        <section id="trust" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Built for Gulf Coast weather</h2>
          <p className="mt-2 max-w-[60ch] text-muted-foreground">
            Every home we sell is HUD code and rated for our wind zone. Ask to see the data plate, 
            we'll show you.
          </p>
          <dl className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: "Wind Zone II & III", v: "Rated for coastal Florida" },
              { k: "27 years", v: "Family owned in Pensacola" },
              { k: "1 year", v: "Manufacturer warranty, plus our service crew" },
              { k: "Included", v: "Delivery, set and tie-down on most homes" },
            ].map((s) => (
              <div key={s.k} className="bg-card p-6">
                <dt className="font-display text-2xl font-extrabold text-primary">{s.k}</dt>
                <dd className="mt-1 text-[15px] text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Qualify */}
        <section id="qualify" className="bg-primary">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2">
            <div>
              <p className="label-caps text-primary-foreground/70">No credit hit</p>
              <h2 className="mt-2 text-3xl font-extrabold text-primary-foreground sm:text-4xl">
                Find out what you qualify for in about 3 minutes.
              </h2>
              <p className="mt-4 max-w-[50ch] text-lg text-primary-foreground/85">
                Credit in the 500s? Still worth asking. We work with land-home and home-only lenders
                every day, and we'll tell you honestly where you stand.
              </p>
              <a
                href="tel:18504740261"
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-background px-5 font-semibold text-foreground hover:opacity-90"
              >
                <Phone className="size-4" aria-hidden />
                1-850-474-0261
              </a>
            </div>

            <QualifyForm />

          </div>
        </section>
      </main>

      <SiteFooter />
      <MobileCallBar />
    </div>
  );
}
