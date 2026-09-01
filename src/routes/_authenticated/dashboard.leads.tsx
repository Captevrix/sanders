import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { listLeads, updateLead, type Lead } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/_authenticated/dashboard/leads")({
  component: Leads,
});

const STATUSES = ["new", "contacted", "closed"] as const;

function LeadRow({ lead, onChange }: { lead: Lead; onChange: () => void }) {
  const [note, setNote] = useState(lead.internal_note ?? "");
  const save = useMutation({
    mutationFn: (patch: { status?: string; internal_note?: string }) =>
      updateLead({ data: { id: lead.id, ...patch } }),
    onSuccess: onChange,
  });

  return (
    <li className="surface-card rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-extrabold">{lead.name}</p>
          <p className="text-sm text-muted-foreground">
            {[lead.phone, lead.email].filter(Boolean).join(" · ") || "No contact details"}
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date(lead.created_at).toLocaleString("en-US")} · via {lead.source}
            {lead.home_id ? ` · ${lead.home_id}` : ""}
          </p>
        </div>
        <select
          value={lead.status}
          onChange={(e) => save.mutate({ status: e.target.value })}
          className="h-10 rounded-md border border-input bg-background px-2 text-sm font-semibold"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0]!.toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {lead.message && <p className="mt-3 text-[15px]">{lead.message}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Internal note"
          className="h-11 min-w-[14rem] flex-1 rounded-md border border-input bg-background px-3 text-[15px]"
        />
        <button
          type="button"
          onClick={() => save.mutate({ internal_note: note })}
          className="inline-flex h-11 items-center rounded-md border border-border px-4 text-sm font-semibold hover:bg-secondary"
        >
          Save note
        </button>
      </div>
    </li>
  );
}

function Leads() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const { data, isLoading } = useQuery({ queryKey: ["leads"], queryFn: () => listLeads() });

  const leads = (data ?? []).filter((l) => filter === "all" || l.status === filter);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["leads"] });

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Leads</h1>
      <p className="mt-1 text-muted-foreground">
        Everyone who asked about a payment or a home through the website.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`inline-flex h-10 items-center rounded-md px-4 text-sm font-semibold ${
              filter === s ? "bg-primary text-primary-foreground" : "border border-border bg-card"
            }`}
          >
            {s[0]!.toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-6 text-muted-foreground">Loading leads…</p>
      ) : leads.length === 0 ? (
        <p className="surface-card mt-6 rounded-xl p-8 text-center text-muted-foreground">
          No leads here yet.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {leads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} onChange={refresh} />
          ))}
        </ul>
      )}
    </div>
  );
}
