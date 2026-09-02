import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import { mapHomeRow, type Home, type HomeRow } from "@/components/site/data";
import type { Database } from "@/integrations/supabase/types";

const HOME_COLUMNS =
  "id,name,builder,property_id,address,date_added,cover_image,photo_count,statuses,section_type,beds,baths,sqft,dimensions,wind_zone,features,price,description,published";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Turn stored storage paths into short-lived URLs the browser can render. */
export async function signPhotoPaths(paths: string[]): Promise<string[]> {
  if (paths.length === 0) return [];
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.storage
    .from("home-photos")
    .createSignedUrls(paths, 60 * 60);
  return (data ?? []).map((d) => d.signedUrl).filter((u): u is string => Boolean(u));
}

export const listPublicHomes = createServerFn({ method: "GET" }).handler(async (): Promise<Home[]> => {
  const supabase = publicClient();
  const [{ data: homes, error }, { data: photos }] = await Promise.all([
    supabase.from("homes").select(HOME_COLUMNS).eq("published", true).order("date_added", { ascending: false }),
    supabase.from("home_photos").select("home_id,storage_path,url,sort_order").order("sort_order"),
  ]);
  if (error) throw new Error(error.message);

  const byHome = new Map<string, string[]>();
  const toSign: { homeId: string; path: string }[] = [];
  for (const p of photos ?? []) {
    if (p.storage_path) toSign.push({ homeId: p.home_id, path: p.storage_path });
    else if (p.url) byHome.set(p.home_id, [...(byHome.get(p.home_id) ?? []), p.url]);
  }
  const signed = await signPhotoPaths(toSign.map((t) => t.path));
  toSign.forEach((t, i) => {
    const url = signed[i];
    if (url) byHome.set(t.homeId, [...(byHome.get(t.homeId) ?? []), url]);
  });

  return ((homes ?? []) as HomeRow[]).map((row) => mapHomeRow(row, byHome.get(row.id) ?? []));
});

export const getPublicHome = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => ({ id: String(data.id).slice(0, 120) }))
  .handler(async ({ data }): Promise<Home | null> => {
    const supabase = publicClient();
    const { data: row } = await supabase
      .from("homes")
      .select(HOME_COLUMNS)
      .eq("id", data.id)
      .eq("published", true)
      .maybeSingle();
    if (!row) return null;

    const { data: photos } = await supabase
      .from("home_photos")
      .select("storage_path,url,sort_order")
      .eq("home_id", data.id)
      .order("sort_order");

    const paths = (photos ?? []).map((p) => p.storage_path).filter((p): p is string => Boolean(p));
    const direct = (photos ?? []).map((p) => (!p.storage_path && p.url ? p.url : null)).filter((u): u is string => Boolean(u));
    const signed = await signPhotoPaths(paths);

    return mapHomeRow(row as HomeRow, [...signed, ...direct]);
  });

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: {
    name: string;
    phone?: string;
    email?: string;
    message?: string;
    source?: string;
    homeId?: string;
  }) => {
    const name = String(data.name ?? "").trim();
    if (!name || name.length > 120) throw new Error("Please enter your name.");
    const phone = String(data.phone ?? "").trim().slice(0, 40);
    const email = String(data.email ?? "").trim().slice(0, 255);
    if (!phone && !email) throw new Error("Add a phone number or email so we can reach you.");
    return {
      name,
      phone,
      email,
      message: String(data.message ?? "").trim().slice(0, 2000),
      source: String(data.source ?? "qualify").slice(0, 40),
      homeId: data.homeId ? String(data.homeId).slice(0, 120) : null,
    };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("leads").insert({
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      message: data.message || null,
      source: data.source,
      home_id: data.homeId,
    });
    if (error) throw new Error("We couldn't send that just now. Please call us instead.");

    // Forward the lead to HighLevel (or any inbound webhook). The URL lives in
    // the HIGHLEVEL_WEBHOOK_URL secret; when unset the forward is skipped.
    const webhookUrl = process.env["HIGHLEVEL_WEBHOOK_URL"];
    if (webhookUrl) {
      try {
        let homeName: string | null = null;
        if (data.homeId) {
          const { data: homeRow } = await supabaseAdmin
            .from("homes")
            .select("name")
            .eq("id", data.homeId)
            .maybeSingle();
          homeName = homeRow?.name ?? null;
        }
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            phone: data.phone || null,
            email: data.email || null,
            message: data.message || null,
            source: data.source,
            home_id: data.homeId,
            home_name: homeName,
            submitted_at: new Date().toISOString(),
          }),
        });
        if (!res.ok) console.error(`HighLevel webhook returned ${res.status}`);
      } catch (webhookError) {
        // Never block the user on a webhook failure, the lead is stored.
        console.error("HighLevel webhook failed", webhookError);
      }
    }
    return { ok: true };
  });
