import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { money } from "@/components/site/data";
import { deleteHome, listStaffHomes, setHomePublished } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/_authenticated/dashboard/listings/")({
  component: Listings,
});

function Listings() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["staff-homes"], queryFn: () => listStaffHomes() });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["staff-homes"] });

  const publish = useMutation({
    mutationFn: (vars: { id: string; published: boolean }) => setHomePublished({ data: vars }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteHome({ data: { id } }),
    onSuccess: invalidate,
  });

  const homes = (data ?? []).filter((h) =>
    `${h.name} ${h.builder} ${h.propertyId}`.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Listings</h1>
          <p className="mt-1 text-muted-foreground">Create, edit, publish and remove homes.</p>
        </div>
        <Link
          to="/dashboard/listings/$homeId"
          params={{ homeId: "new" }}
          className="inline-flex h-12 items-center rounded-md bg-primary px-5 font-semibold text-primary-foreground"
        >
          Add a listing
        </Link>
      </div>

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search by name, builder or property ID"
        className="mt-6 h-12 w-full rounded-md border border-input bg-background px-3 text-[16px]"
      />

      {isLoading ? (
        <p className="mt-6 text-muted-foreground">Loading listings…</p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {homes.map((home) => (
            <li key={home.id} className="surface-card flex flex-wrap items-center gap-4 rounded-xl p-4">
              <img
                src={home.image}
                alt=""
                className="size-16 shrink-0 rounded-lg object-cover"
                loading="lazy"
              />
              <div className="min-w-[12rem] flex-1">
                <Link
                  to="/dashboard/listings/$homeId"
                  params={{ homeId: home.id }}
                  className="font-display text-lg font-extrabold hover:text-primary"
                >
                  {home.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {home.builder} · {home.beds} bed / {home.baths} bath · {home.dimensions} ·{" "}
                  {home.sqft.toLocaleString("en-US")} sq ft
                </p>
                <p className="text-sm text-muted-foreground">
                  {home.price ? money(home.price) : "Quoted — no price shown"} ·{" "}
                  {home.features.length} features · {home.photoCount} photos
                </p>
              </div>

              <span
                className={`label-caps rounded px-2 py-1 ${
                  home.published ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {home.published ? "Live" : "Draft"}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => publish.mutate({ id: home.id, published: !home.published })}
                  className="inline-flex h-10 items-center rounded-md border border-border px-3 text-sm font-semibold hover:bg-secondary"
                >
                  {home.published ? "Unpublish" : "Publish"}
                </button>
                <Link
                  to="/dashboard/listings/$homeId"
                  params={{ homeId: home.id }}
                  className="inline-flex h-10 items-center rounded-md border border-border px-3 text-sm font-semibold hover:bg-secondary"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete ${home.name}? This can't be undone.`)) remove.mutate(home.id);
                  }}
                  className="inline-flex h-10 items-center rounded-md border border-border px-3 text-sm font-semibold text-destructive hover:bg-destructive/10"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {homes.length === 0 && (
            <li className="surface-card rounded-xl p-8 text-center text-muted-foreground">
              No listings match that search.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
