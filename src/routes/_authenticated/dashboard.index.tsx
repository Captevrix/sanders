import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { listLeads, listStaffHomes } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: Overview,
});

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="surface-card rounded-xl p-5">
      <p className="label-caps text-muted-foreground">{label}</p>
      <p className="font-display text-3xl font-extrabold text-primary">{value}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Overview() {
  const homes = useQuery({ queryKey: ["staff-homes"], queryFn: () => listStaffHomes() });
  const leads = useQuery({ queryKey: ["leads"], queryFn: () => listLeads() });

  const all = homes.data ?? [];
  const published = all.filter((h) => h.published).length;
  const newLeads = (leads.data ?? []).filter((l) => l.status === "new").length;

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Overview</h1>
      <p className="mt-1 text-muted-foreground">Everything on the lot, at a glance.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Listings" value={all.length} hint={`${published} live on the website`} />
        <Stat label="Drafts" value={all.length - published} hint="Not visible to buyers" />
        <Stat label="New leads" value={newLeads} hint="Waiting on a first call" />
        <Stat
          label="Priced homes"
          value={all.filter((h) => h.price).length}
          hint="The rest show “Get your payment”"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/dashboard/listings/$homeId"
          params={{ homeId: "new" }}
          className="inline-flex h-12 items-center rounded-md bg-primary px-5 font-semibold text-primary-foreground"
        >
          Add a listing
        </Link>
        <Link
          to="/dashboard/leads"
          className="inline-flex h-12 items-center rounded-md border border-border bg-card px-5 font-semibold hover:bg-secondary"
        >
          Review leads
        </Link>
      </div>

      <h2 className="mt-10 text-xl font-extrabold">Recently updated</h2>
      <ul className="mt-3 grid gap-2">
        {all.slice(0, 5).map((home) => (
          <li key={home.id} className="surface-card flex items-center justify-between gap-4 rounded-lg p-4">
            <div>
              <Link
                to="/dashboard/listings/$homeId"
                params={{ homeId: home.id }}
                className="font-semibold hover:text-primary"
              >
                {home.name}
              </Link>
              <p className="text-sm text-muted-foreground">
                {home.beds} bed · {home.dimensions} · {home.builder}
              </p>
            </div>
            <span
              className={`label-caps rounded px-2 py-1 ${
                home.published ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {home.published ? "Live" : "Draft"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
