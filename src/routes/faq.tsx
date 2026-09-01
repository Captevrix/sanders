import { createFileRoute, Link } from "@tanstack/react-router";

import { homesSearch } from "@/components/site/data";
import { MobileCallBar, SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

const TITLE = "Manufactured Home FAQs — Pensacola, FL | Sanders Housing";
const DESCRIPTION =
  "Answers on land, financing, delivery and setup costs, wind zones, insurance, warranties and timelines for buying a manufactured home in Northwest Florida.";

const FAQS: { q: string; a: string }[] = [
  {
    q: "Do I need to own land to buy a home?",
    a: "No. Plenty of our buyers place a home in a park or on family land. If you do own land, we look at access, slope and utilities before we quote setup. If you don't, we can point you to communities with open spaces nearby.",
  },
  {
    q: "Why don't most homes show a price?",
    a: "The sticker on a manufactured home is only part of the number. Delivery distance, blocking and anchoring, steps, skirting, A/C, and any options you add all change it. We quote the full delivered-and-set price — usually the same day you ask.",
  },
  {
    q: "What does it cost to get the home set up?",
    a: "Setup on a typical Escambia or Santa Rosa county site runs a few thousand dollars for a single section and more for a multi section, depending on distance, pad work and utility runs. We break it out line by line so nothing shows up later.",
  },
  {
    q: "How long from signing to move-in?",
    a: "For a home already on our lot, four to eight weeks is typical once financing and the site are ready. Factory orders run longer depending on the builder's schedule.",
  },
  {
    q: "What credit score do I need?",
    a: "Our lenders work across a wide range. Many buyers qualify in the low-600s, and some programs go lower with a larger down payment. A soft pre-qualification tells you where you stand without a hit to your credit.",
  },
  {
    q: "How much is a down payment?",
    a: "Typically 5–20% depending on the loan program, your credit and whether you own land. Owned land can sometimes count toward the down payment.",
  },
  {
    q: "Are these homes safe in a hurricane?",
    a: "Every home we stock is built to HUD standards for its wind zone — coastal Northwest Florida requires Wind Zone II or higher. Ask to see the data plate inside the home; we'll show you exactly what it's rated for and how the anchoring system works.",
  },
  {
    q: "What kind of insurance will I need?",
    a: "Manufactured home policies cover the home, contents and liability, and coastal counties usually add windstorm coverage. We can refer local agents who write these policies every day.",
  },
  {
    q: "What warranty comes with the home?",
    a: "New homes carry the manufacturer's warranty — usually one year on the home with longer terms on specific components — plus our setup workmanship. We hand you the paperwork at the final walkthrough.",
  },
  {
    q: "Can I customize a home?",
    a: "On factory orders, yes: cabinets, counters, flooring, appliance packages, porches and more. On lot homes, options are already built in, but we can tell you exactly what's in the one you're standing in.",
  },
  {
    q: "Do you take trade-ins?",
    a: "Sometimes. Tell us the year, size and condition of your current home and we'll tell you honestly whether it's worth trading or selling separately.",
  },
  {
    q: "Can I see a home before I buy?",
    a: "Yes — homes tagged \"On Site\" are physically on our lot right now and open to walk through during business hours. Filter to those on the browse page.",
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-sand">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="label-caps text-muted-foreground">FAQs</p>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">
              The questions we answer every day
            </h1>
            <p className="mt-3 max-w-[62ch] text-[17px] text-muted-foreground">
              Land, money, hurricanes and timelines — the honest version.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="grid gap-3">
            {FAQS.map((f) => (
              <details key={f.q} className="surface-card group rounded-xl p-5">
                <summary className="cursor-pointer list-none text-lg font-bold marker:hidden">
                  <span className="flex items-start justify-between gap-4">
                    {f.q}
                    <span className="mt-1 text-primary transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="surface-card mt-8 rounded-xl p-6 text-center">
            <h2 className="text-xl font-extrabold">Still have a question?</h2>
            <p className="mt-1 text-muted-foreground">
              Call the lot and talk to a person, or start with a no-credit-hit qualification.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <a
                href="tel:18504740261"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-5 font-semibold text-primary-foreground"
              >
                Call 1-850-474-0261
              </a>
              <Link
                to="/homes"
                search={homesSearch({ onSite: true })}
                className="inline-flex h-12 items-center justify-center rounded-md border border-border px-5 font-semibold hover:bg-secondary"
              >
                Homes on the lot now
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileCallBar />
    </div>
  );
}
