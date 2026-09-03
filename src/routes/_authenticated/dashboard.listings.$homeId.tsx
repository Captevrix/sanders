import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GripVertical, Trash2, Upload } from "lucide-react";

import {
  FEATURE_LIBRARY,
  LOT,
  PHOTO_ORDER_HINT,
  SECTION_TYPES,
  STATUSES,
  STOCK_IMAGES,
  WIND_ZONES,
  resolveImage,
} from "@/components/site/data";
import {
  addHomePhoto,
  deleteAllHomePhotos,
  deleteHomePhoto,
  getStaffHome,
  reorderHomePhotos,
  saveHome,
  type HomeInput,
} from "@/lib/dashboard.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/listings/$homeId")({
  component: ListingEditor,
});

const EMPTY: HomeInput = {
  id: "",
  name: "",
  builder: "",
  property_id: "",
  address: LOT,
  date_added: new Date().toISOString().slice(0, 10),
  cover_image: "home-1",
  photo_count: 0,
  statuses: ["For Sale"],
  section_type: "Single Section",
  beds: 3,
  baths: 2,
  sqft: 1000,
  dimensions: "",
  wind_zone: "Wind Zone II",
  features: [],
  price: null,
  description: "",
  published: false,
  virtual_tour_url: null,
  floor_plan_url: null,
  isNew: true,
};


const field = "mt-1.5 h-12 w-full rounded-md border border-input bg-background px-3 text-[16px]";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-caps text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ListingEditor() {
  const { homeId } = Route.useParams();
  const isNew = homeId === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<HomeInput>(EMPTY);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [replacing, setReplacing] = useState(false);

  const [dragId, setDragId] = useState<string | null>(null);

  const existing = useQuery({
    queryKey: ["staff-home", homeId],
    queryFn: () => getStaffHome({ data: { id: homeId } }),
    enabled: !isNew,
  });

  useEffect(() => {
    const home = existing.data;
    if (!home) return;
    setForm({
      id: home.id,
      name: home.name,
      builder: home.builder,
      property_id: home.propertyId,
      address: home.address,
      date_added: new Date(home.dateAdded).toISOString().slice(0, 10),
      cover_image: home.coverImage || "home-1",
      photo_count: home.photoCount,
      statuses: home.statuses,
      section_type: home.sectionType,
      beds: home.beds,
      baths: home.baths,
      sqft: home.sqft,
      dimensions: home.dimensions,
      wind_zone: home.windZone,
      features: home.features,
      price: home.price ?? null,
      description: home.description,
      published: home.published,
      virtual_tour_url: home.virtualTourUrl || null,
      floor_plan_url: home.floorPlanUrl || null,
      isNew: false,
    });


  }, [existing.data]);

  const patch = (p: Partial<HomeInput>) => setForm((f) => ({ ...f, ...p }));

  const save = useMutation({
    mutationFn: (input: HomeInput) => saveHome({ data: input }),
    onSuccess: async ({ id }) => {
      setError("");
      setSaved(true);
      await queryClient.invalidateQueries({ queryKey: ["staff-homes"] });
      await queryClient.invalidateQueries({ queryKey: ["staff-home"] });
      if (isNew) navigate({ to: "/dashboard/listings/$homeId", params: { homeId: id } });
    },
    onError: (err: Error) => {
      setSaved(false);
      setError(err.message);
    },
  });

  const removePhoto = useMutation({
    mutationFn: (id: string) => deleteHomePhoto({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-home", homeId] }),
  });
  const reorder = useMutation({
    mutationFn: (ids: string[]) => reorderHomePhotos({ data: { ids } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-home", homeId] }),
  });

  const removeAll = useMutation({
    mutationFn: () => deleteAllHomePhotos({ data: { homeId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-home", homeId] }),
  });

  async function onReplaceAll(files: FileList | null) {
    if (!files?.length || isNew) return;
    setReplacing(true);
    try {
      await deleteAllHomePhotos({ data: { homeId } });
      await onUpload(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Replace failed.");
    } finally {
      setReplacing(false);
    }
  }

  async function onUpload(files: FileList | null) {

    if (!files?.length || isNew) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${homeId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("home-photos").upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
        if (upErr) throw upErr;
        await addHomePhoto({ data: { homeId, storagePath: path } });
      }
      await queryClient.invalidateQueries({ queryKey: ["staff-home", homeId] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const photos = existing.data?.photoRows ?? [];

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const ids = photos.map((p) => p.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ...ids.splice(from, 1));
    setDragId(null);
    reorder.mutate(ids);
  }

  return (
    <div>
      <Link to="/dashboard/listings" className="text-sm font-semibold text-primary underline underline-offset-4">
        ← All listings
      </Link>
      <h1 className="mt-3 text-3xl font-extrabold">{isNew ? "New listing" : form.name || "Listing"}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(form);
        }}
        className="mt-6 grid gap-6"
      >
        <section className="surface-card grid gap-4 rounded-xl p-6 sm:grid-cols-2">
          <Field label="Home name">
            <input className={field} value={form.name} onChange={(e) => patch({ name: e.target.value })} required />
          </Field>
          <Field label="Builder">
            <input className={field} value={form.builder} onChange={(e) => patch({ builder: e.target.value })} />
          </Field>
          <Field label="Property ID">
            <input className={field} value={form.property_id} onChange={(e) => patch({ property_id: e.target.value })} />
          </Field>
          <Field label="Web address (slug)">
            <input
              className={field}
              value={form.id}
              placeholder="auto from the name"
              onChange={(e) => patch({ id: e.target.value })}
              disabled={!isNew}
            />
          </Field>
          <Field label="Lot address">
            <input className={field} value={form.address} onChange={(e) => patch({ address: e.target.value })} />
          </Field>
          <Field label="Date added">
            <input
              type="date"
              className={field}
              value={form.date_added}
              onChange={(e) => patch({ date_added: e.target.value })}
            />
          </Field>
        </section>

        <section className="surface-card grid gap-4 rounded-xl p-6 sm:grid-cols-3">
          <Field label="Bedrooms">
            <input type="number" min={0} className={field} value={form.beds} onChange={(e) => patch({ beds: Number(e.target.value) })} />
          </Field>
          <Field label="Bathrooms">
            <input type="number" min={0} step={0.5} className={field} value={form.baths} onChange={(e) => patch({ baths: Number(e.target.value) })} />
          </Field>
          <Field label="Square feet">
            <input type="number" min={0} className={field} value={form.sqft} onChange={(e) => patch({ sqft: Number(e.target.value) })} />
          </Field>
          <Field label="Dimensions">
            <input className={field} placeholder="16x76" value={form.dimensions} onChange={(e) => patch({ dimensions: e.target.value })} />
          </Field>
          <Field label="Section type">
            <select className={field} value={form.section_type} onChange={(e) => patch({ section_type: e.target.value })}>
              {SECTION_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Wind zone">
            <select className={field} value={form.wind_zone} onChange={(e) => patch({ wind_zone: e.target.value })}>
              {WIND_ZONES.map((z) => (
                <option key={z}>{z}</option>
              ))}
            </select>
          </Field>
          <Field label="Cash price (blank = quoted)">
            <input
              type="number"
              min={0}
              className={field}
              value={form.price ?? ""}
              onChange={(e) => patch({ price: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </Field>
          <Field label="Photo count shown on cards">
            <input type="number" min={0} className={field} value={form.photo_count} onChange={(e) => patch({ photo_count: Number(e.target.value) })} />
          </Field>
          <Field label="Stock cover image">
            <select className={field} value={form.cover_image} onChange={(e) => patch({ cover_image: e.target.value })}>
              {Object.keys(STOCK_IMAGES).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Virtual tour link (360 or Matterport)">
            <input
              className={field}
              placeholder="https://momento360.com/e/uc/..."
              value={form.virtual_tour_url ?? ""}
              onChange={(e) => patch({ virtual_tour_url: e.target.value || null })}
            />
          </Field>
          <Field label="Floor plan image link">
            <input
              className={field}
              placeholder="https://..."
              value={form.floor_plan_url ?? ""}
              onChange={(e) => patch({ floor_plan_url: e.target.value || null })}
            />
          </Field>

        </section>

        <section className="surface-card rounded-xl p-6">
          <p className="label-caps text-muted-foreground">Status badges</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {STATUSES.map((s) => (
              <label key={s} className="flex items-center gap-2 text-[15px]">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={form.statuses.includes(s)}
                  onChange={() =>
                    patch({
                      statuses: form.statuses.includes(s)
                        ? form.statuses.filter((x) => x !== s)
                        : [...form.statuses, s],
                    })
                  }
                />
                {s}
              </label>
            ))}
          </div>

          <p className="label-caps mt-6 text-muted-foreground">Features</p>
          <div className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_LIBRARY.map((f) => (
              <label key={f} className="flex items-center gap-2 text-[15px]">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={form.features.includes(f)}
                  onChange={() =>
                    patch({
                      features: form.features.includes(f)
                        ? form.features.filter((x) => x !== f)
                        : [...form.features, f],
                    })
                  }
                />
                {f}
              </label>
            ))}
          </div>
        </section>

        <section className="surface-card rounded-xl p-6">
          <Field label="Description">
            <p className="mt-1 text-[13px] text-muted-foreground">
              Keep the house style: a short lead paragraph, then{" "}
              <code className="rounded bg-secondary px-1">## Quick overview</code>,{" "}
              <code className="rounded bg-secondary px-1">## Highlights</code> and{" "}
              <code className="rounded bg-secondary px-1">## Why buyers pick it</code>. Bullets look
              like <code className="rounded bg-secondary px-1">- **Kitchen:** text</code>.
            </p>
            <textarea
              rows={14}
              className="mt-1.5 w-full rounded-md border border-input bg-background p-3 text-[16px]"
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </Field>
          <label className="mt-4 flex items-center gap-2 font-semibold">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={form.published}
              onChange={(e) => patch({ published: e.target.checked })}
            />
            Publish this home on the website
          </label>
        </section>

        {error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        {saved && !error && <p className="text-sm font-semibold text-primary">Saved.</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={save.isPending}
            className="inline-flex h-12 items-center rounded-md bg-primary px-6 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {save.isPending ? "Saving…" : "Save listing"}
          </button>
          {!isNew && (
            <Link
              to="/homes/$homeId"
              params={{ homeId: form.id }}
              className="inline-flex h-12 items-center rounded-md border border-border bg-card px-5 font-semibold hover:bg-secondary"
            >
              View public page
            </Link>
          )}
        </div>
      </form>

      <section className="surface-card mt-8 rounded-xl p-6">
        <h2 className="text-xl font-extrabold">Photos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isNew
            ? "Save the listing first, then upload photos."
            : "Drag to reorder, the first photo is the cover image on the website."}
        </p>
        {!isNew && (
          <p className="mt-1 text-sm text-muted-foreground">
            Preferred order: {PHOTO_ORDER_HINT}
          </p>
        )}

        {!isNew && (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-md border border-border px-4 font-semibold hover:bg-secondary">
                <Upload className="size-4" aria-hidden />
                {uploading ? "Uploading…" : "Upload photos"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => onUpload(e.target.files)}
                />
              </label>
              <label className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-md border border-accent px-4 font-semibold text-accent hover:bg-accent/10">
                <Upload className="size-4" aria-hidden />
                {replacing ? "Replacing…" : "Replace all photos"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => onReplaceAll(e.target.files)}
                />
              </label>
              {photos.length > 0 && (
                <button
                  type="button"
                  className="inline-flex h-12 items-center gap-2 rounded-md border border-border px-4 font-semibold text-muted-foreground hover:bg-secondary"
                  onClick={() => {
                    if (confirm(`Delete all ${photos.length} photos for this home?`)) removeAll.mutate();
                  }}
                >
                  <Trash2 className="size-4" aria-hidden />
                  Delete all
                </button>
              )}
            </div>


            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {photos.map((p, i) => (
                <li
                  key={p.id}
                  draggable
                  onDragStart={() => setDragId(p.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(p.id)}
                  className="relative overflow-hidden rounded-lg border border-border"
                >
                  <img src={p.url} alt="" className="aspect-[4/3] w-full object-cover" />
                  {i === 0 && (
                    <span className="label-caps absolute left-2 top-2 rounded bg-primary px-2 py-1 text-primary-foreground">
                      Cover
                    </span>
                  )}
                  <span className="absolute right-2 top-2 rounded bg-background/90 p-1">
                    <GripVertical className="size-4" aria-hidden />
                  </span>
                  <button
                    type="button"
                    onClick={() => removePhoto.mutate(p.id)}
                    aria-label="Delete photo"
                    className="absolute bottom-2 right-2 rounded bg-background/90 p-1.5 text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
              {photos.length === 0 && (
                <li className="col-span-full rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No uploads yet, the stock cover image below is used on the website.
                  <img
                    src={resolveImage(form.cover_image)}
                    alt=""
                    className="mx-auto mt-3 aspect-[4/3] w-40 rounded object-cover"
                  />
                </li>
              )}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
