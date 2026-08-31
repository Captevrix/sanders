import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-lg font-extrabold text-primary">Sanders Housing</p>
          <p className="text-[15px] text-muted-foreground">
            10300 Pensacola Blvd, Pensacola, FL · Mon–Sat 9–6
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Equal Housing Opportunity. Payment estimates are illustrative, not an offer of credit.
        </p>
      </div>
    </footer>
  );
}

export function MobileCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card p-3 lg:hidden">
      <div className="mx-auto flex max-w-md gap-2">
        <a
          href="tel:18504740261"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-primary font-semibold text-primary-foreground"
        >
          <Phone className="size-4" aria-hidden /> Call now
        </a>
        <Link
          to="/"
          hash="qualify"
          className="inline-flex h-12 flex-1 items-center justify-center rounded-md bg-accent font-semibold text-accent-foreground"
        >
          See if I qualify
        </Link>
      </div>
    </div>
  );
}
