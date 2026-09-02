import { Link } from "@tanstack/react-router";
import { Bath, BedDouble, Camera, MapPin, Ruler, Square } from "lucide-react";

import { estimateMonthly, money, type Home } from "./data";
import { InquiryDialog } from "./InquiryDialog";

function SpecCell({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BedDouble;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-1 py-2 text-center">
      <Icon className="size-4 text-primary" aria-hidden />
      <span className="font-display text-[15px] font-extrabold leading-none">{value}</span>
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  );
}

export function HomeCard({ home }: { home: Home }) {
  const monthly = home.price ? estimateMonthly(home.price) : null;
  const extraFeatures = Math.max(0, home.features.length - 3);

  return (
    <article className="surface-card flex flex-col overflow-hidden rounded-xl">
      <Link
        to="/homes/$homeId"
        params={{ homeId: home.id }}
        className="relative block"
        aria-label={`View the ${home.name} by ${home.builder}`}
      >
        <img
          src={home.image}
          alt={`${home.name} manufactured home by ${home.builder}`}
          loading="lazy"
          width={1024}
          height={768}
          className="aspect-[4/3] w-full object-cover"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {home.statuses.map((s) => (
            <span
              key={s}
              className="label-caps rounded bg-background/95 px-2 py-1 text-foreground shadow-sm"
            >
              {s}
            </span>
          ))}
        </div>
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded bg-ink/80 px-2 py-1 text-xs font-semibold text-background">
          <Camera className="size-3.5" aria-hidden /> {home.photoCount}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-bold">
            <Link to="/homes/$homeId" params={{ homeId: home.id }} className="hover:text-primary">
              {home.name}
            </Link>
          </h3>
          <span className="text-sm text-muted-foreground">{home.builder}</span>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden /> {home.address}
        </p>

        <div className="mt-4 grid grid-cols-4 divide-x divide-border rounded-lg border border-border">
          <SpecCell icon={BedDouble} label="Beds" value={String(home.beds)} />
          <SpecCell icon={Bath} label="Baths" value={String(home.baths)} />
          <SpecCell icon={Square} label="Sq ft" value={home.sqft.toLocaleString("en-US")} />
          <SpecCell icon={Ruler} label="Size" value={home.dimensions} />
        </div>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {home.features.slice(0, 3).map((f) => (
            <li
              key={f}
              className="rounded-full border border-border px-2.5 py-1 text-[12px] text-muted-foreground"
            >
              {f}
            </li>
          ))}
          {extraFeatures > 0 && (
            <li className="rounded-full border border-border px-2.5 py-1 text-[12px] font-semibold text-primary">
              +{extraFeatures} more
            </li>
          )}
        </ul>

        <div className="mt-auto pt-5">
          {monthly && home.price ? (
            <>
              <div className="flex items-end justify-between rounded-lg bg-sand px-4 py-3">
                <div>
                  <p className="label-caps text-muted-foreground">Est. payment</p>
                  <p className="font-display text-2xl font-extrabold text-primary">
                    {money(monthly)}
                    <span className="text-base font-semibold text-muted-foreground">/mo</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="label-caps text-muted-foreground">Cash price</p>
                  <p className="font-display text-xl font-bold">{money(home.price)}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Est. 10% down, 20 yr, 8.99% APR. Your rate depends on credit and land.
              </p>
            </>
          ) : (
            <>
              <div className="rounded-lg bg-sand px-4 py-3">
                <p className="label-caps text-muted-foreground">Your payment</p>
                <p className="font-display text-xl font-extrabold text-primary">
                  Get your payment
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Pricing varies by options and land, we'll quote it same day.
                </p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Most homes are quoted with your options and setup included.
              </p>
            </>
          )}

          <div className="mt-4 flex gap-2">
            <Link
              to="/homes/$homeId"
              params={{ homeId: home.id }}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-primary px-4 font-semibold text-primary-foreground hover:opacity-90"
            >
              View details
            </Link>
            <InquiryDialog home={home} />
          </div>
        </div>
      </div>
    </article>
  );
}
