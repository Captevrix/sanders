import { estimateMonthly, money, type Home } from "./data";

export function HomeCard({ home }: { home: Home }) {
  const monthly = estimateMonthly(home.price);

  return (
    <article className="surface-card flex flex-col overflow-hidden rounded-xl">
      <div className="relative">
        <img
          src={home.image}
          alt={`${home.name} manufactured home by ${home.maker}`}
          loading="lazy"
          width={1024}
          height={768}
          className="aspect-[4/3] w-full object-cover"
        />
        <span className="label-caps absolute left-3 top-3 rounded bg-background/95 px-2 py-1 text-foreground">
          {home.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-bold">{home.name}</h3>
          <span className="text-sm text-muted-foreground">{home.maker}</span>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[15px]">
          <div className="flex justify-between border-b border-border pb-2">
            <dt className="text-muted-foreground">Beds / baths</dt>
            <dd className="font-semibold">
              {home.beds} / {home.baths}
            </dd>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <dt className="text-muted-foreground">Sq ft</dt>
            <dd className="font-semibold">{home.sqft.toLocaleString("en-US")}</dd>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <dt className="text-muted-foreground">Size</dt>
            <dd className="font-semibold">{home.dimensions}</dd>
          </div>
          <div className="flex justify-between border-b border-border pb-2">
            <dt className="text-muted-foreground">Rating</dt>
            <dd className="font-semibold">{home.windZone}</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-end justify-between rounded-lg bg-sand px-4 py-3">
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

        <div className="mt-4 flex gap-2">
          <a
            href="#qualify"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-primary px-4 font-semibold text-primary-foreground hover:opacity-90"
          >
            Check my payment
          </a>
          <a
            href="tel:18504740261"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border px-4 font-semibold hover:bg-secondary"
          >
            Ask about it
          </a>
        </div>
      </div>
    </article>
  );
}
