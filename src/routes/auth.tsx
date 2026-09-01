import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/sanders-logo.png.asset.json";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Staff sign in | Sanders Housing" },
      { name: "description", content: "Sanders Housing staff sign in for the listing dashboard." },
      { name: "robots", content: "noindex,nofollow" },
      { property: "og:title", content: "Staff sign in | Sanders Housing" },
      { property: "og:description", content: "Sanders Housing staff dashboard sign in." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/dashboard", replace: true });
        else setNotice("Check your email to confirm the account, then sign in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "mt-1.5 h-12 w-full rounded-md border border-input bg-background px-3 text-[16px]";

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center">
          <img
            src={logo.url}
            alt="Sanders Manufactured Housing"
            width={500}
            height={261}
            className="h-16 w-auto"
          />
        </Link>

        <div className="surface-card mt-6 rounded-xl p-6">
          <h1 className="text-2xl font-extrabold">
            {mode === "signin" ? "Staff sign in" : "Create a staff account"}
          </h1>
          <p className="mt-1 text-[15px] text-muted-foreground">
            {mode === "signin"
              ? "Manage listings, photos and leads for the Pensacola lot."
              : "New accounts need an admin to approve access before the dashboard opens."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            {mode === "signup" && (
              <label className="block">
                <span className="label-caps text-muted-foreground">Your name</span>
                <input
                  className={input}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  maxLength={120}
                />
              </label>
            )}
            <label className="block">
              <span className="label-caps text-muted-foreground">Email</span>
              <input
                type="email"
                autoComplete="email"
                className={input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
            </label>
            <label className="block">
              <span className="label-caps text-muted-foreground">Password</span>
              <input
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className={input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>

            {error && (
              <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-md bg-secondary px-3 py-2 text-sm text-foreground">{notice}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="h-12 rounded-md bg-primary font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setNotice("");
            }}
            className="mt-4 w-full text-sm font-semibold text-primary underline underline-offset-4"
          >
            {mode === "signin" ? "Need a staff account?" : "I already have an account"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="underline underline-offset-4">
            Back to the website
          </Link>
        </p>
      </div>
    </div>
  );
}
