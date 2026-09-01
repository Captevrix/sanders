import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";

import { submitLead } from "@/lib/homes.functions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { Home } from "./data";

export function InquiryDialog({
  home,
  label = "Ask about it",
  className = "inline-flex h-11 items-center justify-center rounded-md border border-border px-4 font-semibold hover:bg-secondary",
}: {
  home: Home;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    `I'd like to know more about ${home.name} (${home.dimensions}, ${home.beds} bed / ${home.baths} bath).`,
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const send = useServerFn(submitLead);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setError("Add a phone number or email so we can reach you.");
      return;
    }
    setBusy(true);
    try {
      await send({
        data: {
          name,
          phone,
          email,
          message,
          source: "inquiry",
          homeId: home.id,
        },
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please call us instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSent(false);
          setError(null);
        }
      }}
    >
      <DialogTrigger className={className}>{label}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="size-12 text-primary" aria-hidden />
            <DialogTitle className="text-2xl">We got it — thank you!</DialogTitle>
            <p className="max-w-[40ch] text-[15px] text-muted-foreground">
              Someone from our team will reach out about {home.name} shortly. Need an answer right
              now? Call us at{" "}
              <a href="tel:18504740261" className="font-semibold text-primary">
                1-850-474-0261
              </a>
              .
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Ask about this home</DialogTitle>
              <DialogDescription>
                No obligation — tell us how to reach you and we'll answer your questions.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-3 rounded-lg border border-border bg-sand p-3">
              <img
                src={home.image}
                alt=""
                width={96}
                height={72}
                className="aspect-[4/3] w-24 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0">
                <p className="truncate font-display font-extrabold">{home.name}</p>
                <p className="text-[13px] text-muted-foreground">
                  {home.beds} bed · {home.baths} bath · {home.sqft.toLocaleString("en-US")} sq ft
                </p>
                <p className="truncate text-[13px] text-muted-foreground">{home.address}</p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="grid gap-3">
              <label className="grid gap-1.5">
                <span className="label-caps text-muted-foreground">Name *</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  autoComplete="name"
                  required
                  className="h-11 rounded-md border border-border bg-background px-3 text-[15px] outline-none focus:border-primary"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="label-caps text-muted-foreground">Phone</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={40}
                    type="tel"
                    autoComplete="tel"
                    className="h-11 rounded-md border border-border bg-background px-3 text-[15px] outline-none focus:border-primary"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="label-caps text-muted-foreground">Email</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                    type="email"
                    autoComplete="email"
                    className="h-11 rounded-md border border-border bg-background px-3 text-[15px] outline-none focus:border-primary"
                  />
                </label>
              </div>
              <label className="grid gap-1.5">
                <span className="label-caps text-muted-foreground">Your question</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  className="rounded-md border border-border bg-background px-3 py-2 text-[15px] outline-none focus:border-primary"
                />
              </label>
              {error && (
                <p role="alert" className="text-sm font-semibold text-destructive">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
                Send my question
              </button>
              <p className="text-center text-xs text-muted-foreground">
                By submitting, you agree to be contacted about this home. This is not a credit
                application.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
