import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, HeartHandshake, MapPin, Truck } from "lucide-react";

import { homesSearch } from "@/components/site/data";
import { MobileCallBar, SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import setupImg from "@/assets/setup.jpg";

const TITLE = "About Sanders Manufactured Housing | Pensacola, FL";
const DESCRIPTION =
  "Family-run manufactured home dealer on Pensacola Blvd. Meet the team, see how we deliver and set homes, and learn what to expect from first visit to move-in day.";

export const Route = createFileRoute("/about")({
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
  component: AboutPage,
});

const VALUES = [
  {
    icon: HeartHandshake,
    title: "Straight answers, first visit",
    body: "We tell you what a home really costs, home, delivery, set, tie-downs, steps and A/C, before you fill out anything.",
  },
  {
    icon: Truck,
    title: "We handle the hard part",
    body: "Transport, blocking, leveling, anchoring and utility hook-up coordination are all run by our own crew and vetted subs.",
  },
  {
    icon: Award,
    title: "Built for this coast",
    body: "Every home we stock is rated for Gulf Coast wind zones, and we show you the data plate that proves it.",
  },
  {
    icon: MapPin,
    title: "Local, not a call center",
    body: "One lot, one team, on Pensacola Blvd. The person who sells you the home is here the day it's set.",
  },
];

const STEPS = [
  ["Walk the lot", "Tour homes in person or send us the plan you like. No appointment needed."],
  ["Get your number", "We quote the home plus setup and give you a real monthly payment range."],
  ["Qualify", "A soft pre-qualification with our lenders, no hit to your credit to start."],
  ["Site check", "We look at your land or park space for access, slope and utilities."],
  ["Delivery & set", "Transport, block, level, anchor, trim out and hook up."],
  ["Move in", "Final walkthrough, warranty paperwork, keys."],
];

function AboutPage() {
  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-sand">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="label-caps text-muted-foreground">About us</p>
            <h1 className="mt-2 max-w-[20ch] text-3xl font-extrabold sm:text-5xl">
              A Pensacola family business that sells homes, not paperwork
            </h1>
            <p className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-muted-foreground">
              Sanders Manufactured Housing has been putting Northwest Florida families in
              factory-built homes from our lot at 10300 Pensacola Blvd. We stock single and multi
              section homes from builders like Clayton, Deer Valley, Southern Energy and Cavalier, 
              and we stay with you from the first walkthrough through the day the home is set on
              your land.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/homes"
                search={homesSearch({ onSite: true })}
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90"
              >
                See what's on the lot today
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

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="surface-card rounded-xl p-6">
                <Icon className="size-6 text-primary" aria-hidden />
                <h2 className="mt-3 text-xl font-extrabold">{title}</h2>
                <p className="mt-1.5 text-[15px] text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center">
            <img
              src={setupImg}
              alt="A manufactured home being leveled and anchored on site"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">How buying works here</h2>
              <ol className="mt-5 grid gap-4">
                {STEPS.map(([title, body], i) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-display font-extrabold text-primary-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="text-[15px] text-muted-foreground">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="surface-card rounded-xl p-8 text-center">
            <h2 className="text-2xl font-extrabold">Come see us</h2>
            <p className="mx-auto mt-2 max-w-[52ch] text-muted-foreground">
              10300 Pensacola Blvd, Pensacola, FL. Monday through Saturday, 9–6. Walk the homes,
              ask hard questions, leave with a real number.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                to="/financing"
                className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-5 font-semibold text-accent-foreground hover:opacity-90"
              >
                How financing works
              </Link>
              <Link
                to="/faq"
                className="inline-flex h-12 items-center justify-center rounded-md border border-border px-5 font-semibold hover:bg-secondary"
              >
                Read the FAQs
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
