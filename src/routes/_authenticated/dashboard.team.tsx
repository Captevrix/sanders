import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  getStaffSession,
  listTeam,
  setMemberActive,
  setMemberRole,
  updateMyProfile,
} from "@/lib/dashboard.functions";

export const Route = createFileRoute("/_authenticated/dashboard/team")({
  component: Team,
});

const field = "mt-1.5 h-12 w-full rounded-md border border-input bg-background px-3 text-[16px]";

function MyProfile() {
  const queryClient = useQueryClient();
  const { data: session } = useQuery({ queryKey: ["staff-session"], queryFn: () => getStaffSession() });
  const [form, setForm] = useState({ display_name: "", company: "", phone: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session?.profile) {
      setForm({
        display_name: session.profile.display_name,
        company: session.profile.company,
        phone: session.profile.phone,
      });
    }
  }, [session?.profile]);

  const save = useMutation({
    mutationFn: () => updateMyProfile({ data: form }),
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["staff-session"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="surface-card mt-6 grid gap-4 rounded-xl p-6 sm:grid-cols-3"
    >
      <label className="block">
        <span className="label-caps text-muted-foreground">Display name</span>
        <input
          className={field}
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="label-caps text-muted-foreground">Company</span>
        <input
          className={field}
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="label-caps text-muted-foreground">Contact phone</span>
        <input
          className={field}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </label>
      <div className="sm:col-span-3">
        <button
          type="submit"
          className="inline-flex h-12 items-center rounded-md bg-primary px-5 font-semibold text-primary-foreground"
        >
          {save.isPending ? "Saving…" : "Save my details"}
        </button>
        {saved && <span className="ml-3 text-sm font-semibold text-primary">Saved.</span>}
      </div>
    </form>
  );
}

function Team() {
  const queryClient = useQueryClient();
  const { data: session } = useQuery({ queryKey: ["staff-session"], queryFn: () => getStaffSession() });
  const { data: team } = useQuery({ queryKey: ["team"], queryFn: () => listTeam() });
  const [error, setError] = useState("");

  const refresh = () => {
    setError("");
    queryClient.invalidateQueries({ queryKey: ["team"] });
  };

  const role = useMutation({
    mutationFn: (vars: { userId: string; role: "admin" | "staff" | "none" }) =>
      setMemberRole({ data: vars }),
    onSuccess: refresh,
    onError: (err: Error) => setError(err.message),
  });
  const active = useMutation({
    mutationFn: (vars: { userId: string; isActive: boolean }) => setMemberActive({ data: vars }),
    onSuccess: refresh,
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Team</h1>
      <p className="mt-1 text-muted-foreground">Your details, and who can get into the dashboard.</p>

      <MyProfile />

      <h2 className="mt-10 text-xl font-extrabold">Staff accounts</h2>
      {!session?.isAdmin && (
        <p className="mt-1 text-sm text-muted-foreground">Only admins can change access.</p>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <ul className="mt-4 grid gap-3">
        {(team ?? []).map((member) => (
          <li key={member.id} className="surface-card flex flex-wrap items-center gap-4 rounded-xl p-4">
            <div className="min-w-[12rem] flex-1">
              <p className="font-semibold">{member.display_name || "Unnamed"}</p>
              <p className="text-sm text-muted-foreground">
                {member.company}
                {member.phone ? ` · ${member.phone}` : ""}
              </p>
            </div>
            <span className="label-caps rounded bg-secondary px-2 py-1">
              {member.roles[0] ?? "no access"}
            </span>
            {session?.isAdmin && member.id !== session.userId && (
              <div className="flex flex-wrap gap-2">
                <select
                  value={member.roles[0] ?? "none"}
                  onChange={(e) =>
                    role.mutate({
                      userId: member.id,
                      role: e.target.value as "admin" | "staff" | "none",
                    })
                  }
                  className="h-10 rounded-md border border-input bg-background px-2 text-sm font-semibold"
                >
                  <option value="none">No access</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  type="button"
                  onClick={() => active.mutate({ userId: member.id, isActive: !member.is_active })}
                  className="inline-flex h-10 items-center rounded-md border border-border px-3 text-sm font-semibold hover:bg-secondary"
                >
                  {member.is_active ? "Deactivate" : "Reactivate"}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
