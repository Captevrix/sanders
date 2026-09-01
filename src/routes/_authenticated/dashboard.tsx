import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Home as HomeIcon, LayoutDashboard, LogOut, MessageSquare, Users } from "lucide-react";

import { getStaffSession } from "@/lib/dashboard.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Staff dashboard | Sanders Housing" },
      { name: "description", content: "Manage Sanders Housing listings, photos and leads." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Staff dashboard | Sanders Housing" },
      { property: "og:description", content: "Internal listing management for Sanders Housing." },
    ],
  }),
  component: DashboardLayout,
});

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/listings", label: "Listings", icon: HomeIcon, exact: false },
  { to: "/dashboard/leads", label: "Leads", icon: MessageSquare, exact: false },
  { to: "/dashboard/team", label: "Team", icon: Users, exact: false },
] as const;

export function useStaffSession() {
  return useQuery({ queryKey: ["staff-session"], queryFn: () => getStaffSession() });
}

function DashboardLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: session, isLoading } = useStaffSession();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-xl font-extrabold tracking-tight text-primary">
              Sanders
            </span>
            <span className="label-caps text-muted-foreground">Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session?.profile?.display_name || session?.email}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-semibold hover:bg-secondary"
            >
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[220px_1fr]">
        <nav className="mb-6 flex gap-2 overflow-x-auto lg:mb-0 lg:flex-col">
          {NAV.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-md px-3 font-semibold ${
                  active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                }`}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </Link>
            );
          })}
        </nav>

        <main>
          {isLoading ? (
            <p className="text-muted-foreground">Loading your dashboard…</p>
          ) : session && !session.isStaff ? (
            <div className="surface-card rounded-xl p-8 text-center">
              <h1 className="text-2xl font-extrabold">Access pending</h1>
              <p className="mt-2 text-muted-foreground">
                Your account exists, but an admin still needs to give it dashboard access.
              </p>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
