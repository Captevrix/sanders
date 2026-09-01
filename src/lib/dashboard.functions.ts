import { createServerFn } from "@tanstack/react-start";

import { mapHomeRow, type Home, type HomeRow } from "@/components/site/data";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { signPhotoPaths } from "./homes.functions";

const HOME_COLUMNS =
  "id,name,builder,property_id,address,date_added,cover_image,photo_count,statuses,section_type,beds,baths,sqft,dimensions,wind_zone,features,price,description,published";

export type StaffSession = {
  userId: string;
  email: string;
  profile: { display_name: string; company: string; phone: string; is_active: boolean } | null;
  roles: string[];
  isStaff: boolean;
  isAdmin: boolean;
};

/** Current signed-in staff member. The very first account becomes the admin. */
export const getStaffSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StaffSession> => {
    const { supabase, userId, claims } = context;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true });
    if (!count) {
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "admin" });
    }

    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("display_name,company,phone,is_active").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    const roleNames = (roles ?? []).map((r) => r.role as string);
    return {
      userId,
      email: (claims as { email?: string })?.email ?? "",
      profile: profile ?? null,
      roles: roleNames,
      isStaff: roleNames.length > 0 && profile?.is_active !== false,
      isAdmin: roleNames.includes("admin"),
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { display_name: string; company: string; phone: string }) => ({
    display_name: String(data.display_name ?? "").trim().slice(0, 120),
    company: String(data.company ?? "").trim().slice(0, 120),
    phone: String(data.phone ?? "").trim().slice(0, 40),
  }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

async function photosFor(
  supabase: { from: (t: string) => any },
  homeIds: string[],
): Promise<Map<string, { id: string; url: string; sortOrder: number }[]>> {
  const result = new Map<string, { id: string; url: string; sortOrder: number }[]>();
  if (homeIds.length === 0) return result;
  const { data } = await supabase
    .from("home_photos")
    .select("id,home_id,storage_path,url,sort_order")
    .in("home_id", homeIds)
    .order("sort_order");
  const rows = (data ?? []) as {
    id: string;
    home_id: string;
    storage_path: string | null;
    url: string;
    sort_order: number;
  }[];
  const signed = await signPhotoPaths(rows.map((r) => r.storage_path).filter((p): p is string => Boolean(p)));
  let i = 0;
  for (const row of rows) {
    const url = row.storage_path ? (signed[i++] ?? row.url) : row.url;
    result.set(row.home_id, [
      ...(result.get(row.home_id) ?? []),
      { id: row.id, url, sortOrder: row.sort_order },
    ]);
  }
  return result;
}

export type DashboardHome = Home & { photoRows: { id: string; url: string; sortOrder: number }[] };

export const listStaffHomes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardHome[]> => {
    const { data, error } = await context.supabase
      .from("homes")
      .select(HOME_COLUMNS)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as unknown as HomeRow[];
    const photos = await photosFor(context.supabase as never, rows.map((r) => r.id));
    return rows.map((row) => {
      const photoRows = photos.get(row.id) ?? [];
      return { ...mapHomeRow(row, photoRows.map((p) => p.url)), photoRows };
    });
  });

export const getStaffHome = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => ({ id: String(data.id) }))
  .handler(async ({ data, context }): Promise<DashboardHome | null> => {
    const { data: row } = await context.supabase
      .from("homes")
      .select(HOME_COLUMNS)
      .eq("id", data.id)
      .maybeSingle();
    if (!row) return null;
    const photos = await photosFor(context.supabase as never, [data.id]);
    const photoRows = photos.get(data.id) ?? [];
    return { ...mapHomeRow(row as unknown as HomeRow, photoRows.map((p) => p.url)), photoRows };
  });

export type HomeInput = {
  id: string;
  name: string;
  builder: string;
  property_id: string;
  address: string;
  date_added: string;
  cover_image: string;
  photo_count: number;
  statuses: string[];
  section_type: string;
  beds: number;
  baths: number;
  sqft: number;
  dimensions: string;
  wind_zone: string;
  features: string[];
  price: number | null;
  description: string;
  published: boolean;
  isNew: boolean;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export const saveHome = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: HomeInput) => {
    const name = String(data.name ?? "").trim();
    if (!name) throw new Error("Give the home a name.");
    const id = (data.id ? slugify(String(data.id)) : slugify(name)) || slugify(name);
    if (!id) throw new Error("Give the home a name that contains letters or numbers.");
    return {
      ...data,
      id,
      name: name.slice(0, 120),
      builder: String(data.builder ?? "").trim().slice(0, 120),
      property_id: String(data.property_id ?? "").trim().slice(0, 60),
      address: String(data.address ?? "").trim().slice(0, 200),
      dimensions: String(data.dimensions ?? "").trim().slice(0, 40),
      description: String(data.description ?? "").slice(0, 4000),
      statuses: (data.statuses ?? []).map(String).slice(0, 8),
      features: (data.features ?? []).map(String).slice(0, 60),
      beds: Number(data.beds) || 0,
      baths: Number(data.baths) || 0,
      sqft: Number(data.sqft) || 0,
      photo_count: Number(data.photo_count) || 0,
      price: data.price == null || Number.isNaN(Number(data.price)) ? null : Number(data.price),
    };
  })
  .handler(async ({ data, context }) => {
    const { isNew, ...row } = data;
    if (isNew) {
      const { error } = await context.supabase
        .from("homes")
        .insert({ ...row, created_by: context.userId });
      if (error) {
        throw new Error(
          error.code === "23505" ? "A listing with that web address already exists." : error.message,
        );
      }
    } else {
      const { error } = await context.supabase.from("homes").update(row).eq("id", row.id);
      if (error) throw new Error(error.message);
    }
    return { id: row.id };
  });

export const setHomePublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; published: boolean }) => ({
    id: String(data.id),
    published: Boolean(data.published),
  }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("homes")
      .update({ published: data.published })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteHome = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => ({ id: String(data.id) }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("homes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------------------------- photos --------------------------------- */

export const addHomePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { homeId: string; storagePath: string }) => ({
    homeId: String(data.homeId),
    storagePath: String(data.storagePath),
  }))
  .handler(async ({ data, context }) => {
    const { count } = await context.supabase
      .from("home_photos")
      .select("id", { count: "exact", head: true })
      .eq("home_id", data.homeId);
    const { error } = await context.supabase.from("home_photos").insert({
      home_id: data.homeId,
      url: data.storagePath,
      storage_path: data.storagePath,
      sort_order: count ?? 0,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteHomePhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => ({ id: String(data.id) }))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("home_photos")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    const { error } = await context.supabase.from("home_photos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (row?.storage_path) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.storage.from("home-photos").remove([row.storage_path]);
    }
    return { ok: true };
  });

export const reorderHomePhotos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ids: string[] }) => ({ ids: (data.ids ?? []).map(String) }))
  .handler(async ({ data, context }) => {
    for (const [index, id] of data.ids.entries()) {
      await context.supabase.from("home_photos").update({ sort_order: index }).eq("id", id);
    }
    return { ok: true };
  });

/* ---------------------------------- leads ---------------------------------- */

export type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string;
  home_id: string | null;
  status: string;
  internal_note: string | null;
  created_at: string;
};

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Lead[]> => {
    const { data, error } = await context.supabase
      .from("leads")
      .select("id,name,email,phone,message,source,home_id,status,internal_note,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Lead[];
  });

export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status?: string; internal_note?: string }) => ({
    id: String(data.id),
    ...(data.status ? { status: String(data.status).slice(0, 20) } : {}),
    ...(data.internal_note != null ? { internal_note: String(data.internal_note).slice(0, 2000) } : {}),
  }))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("leads").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ----------------------------------- team ---------------------------------- */

export type TeamMember = {
  id: string;
  display_name: string;
  company: string;
  phone: string;
  is_active: boolean;
  roles: string[];
};

export const listTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TeamMember[]> => {
    const [{ data: profiles, error }, { data: roles }] = await Promise.all([
      context.supabase.from("profiles").select("id,display_name,company,phone,is_active").order("created_at"),
      context.supabase.from("user_roles").select("user_id,role"),
    ]);
    if (error) throw new Error(error.message);
    const byUser = new Map<string, string[]>();
    for (const r of roles ?? []) {
      byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r.role as string]);
    }
    return (profiles ?? []).map((p) => ({ ...p, roles: byUser.get(p.id) ?? [] }));
  });

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Only an admin can do that.");
}

export const setMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; role: "admin" | "staff" | "none" }) => ({
    userId: String(data.userId),
    role: data.role,
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    if (data.userId === context.userId) throw new Error("You can't change your own role.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    if (data.role !== "none") {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: data.userId, role: data.role });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const setMemberActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; isActive: boolean }) => ({
    userId: String(data.userId),
    isActive: Boolean(data.isActive),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    if (data.userId === context.userId) throw new Error("You can't deactivate yourself.");
    const { error } = await context.supabase
      .from("profiles")
      .update({ is_active: data.isActive })
      .eq("id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
