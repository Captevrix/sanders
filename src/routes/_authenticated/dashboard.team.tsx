import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  getStaffSession,
  inviteMember,
  type InviteResult,
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

function InviteMember() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ email: "", displayName: "", role: "staff" as "staff" | "admin" });
  const [result, setResult] = useState<InviteResult | null>(null);
  const [error, setError] = useState("");

  const invite = useMutation({
    mutationFn: () =>
      inviteMember({
        data: {
          ...form,
          siteUrl: typeof window === "undefined" ? "" : window.location.origin,
        },
      }),
    onSuccess: (res) => {
      setResult(res);
      setError("");
      setForm({ email: "", displayName: "", role: "staff" });
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
    onError: (err: Error) => {
      setResult(null);
      setError(err.message);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        invite.mutate();
      }}
      className="surface-card mt-4 grid gap-4 rounded-xl p-6 sm:grid-cols-4"
    >
      <label className="block sm:col-span-2">
        <span className="label-caps text-muted-foreground">Work email</span>
        <input
          type="email"
          required
          className={field}
          placeholder="name@sandershousing.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="label-caps text-muted-foreground">Name</span>
        <input
          className={field}
          placeholder="Jane Sanders"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="label-caps text-muted-foreground">Access</span>
        <select
          className={field}
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value as "staff" | "admin" })}
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <div className="sm:col-span-4">
        <button
          type="submit"
          disabled={invite.isPending}
          className="inline-flex h-12 items-center rounded-md bg-accent px-5 font-semibold text-accent-foreground disabled:opacity-60"
        >
          {invite.isPending ? "Sending…" : "Send invite"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive sm:col-span-4">
          {error}
        </p>
      )}
      {result && (
        <div className="rounded-md bg-secondary p-4 text-sm sm:col-span-4">
          {result.invited ? (
            <p>
              Invite emailed to <strong>{result.email}</strong>. They set their own password from the
              link, then show up in the list below.
            </p>
          ) : (
            <p>
              Account created for <strong>{result.email}</strong>. Email delivery is not set up yet, so
              share this temporary password with them and ask them to change it after signing in:{" "}
              <code className="rounded bg-background px-2 py-1 font-mono">{result.tempPassword}</code>
            </p>
          )}
        </div>
      )}
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
      {session?.isAdmin ? (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite a teammate by email, then set what they can reach.
          </p>
          <InviteMember />
        </>
      ) : (
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
