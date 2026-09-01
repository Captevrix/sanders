import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";

import logo from "@/assets/sanders-logo.png.asset.json";
import { homesSearch } from "./data";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <img
            src={logo.url}
            alt="Sanders Manufactured Housing"
            width={500}
            height={261}
            loading="lazy"
            className="h-11 w-auto"
          />
          <p className="mt-3 text-[15px] text-muted-foreground">
            10300 Pensacola Blvd, Pensacola, FL · Mon–Sat 9–6
          </p>
          <a href="tel:18504740261" className="mt-1 inline-block font-semibold text-primary">
            1-850-474-0261
          </a>
        </div>

        <nav className="grid gap-2 text-[15px]">
          <p className="label-caps text-muted-foreground">Homes</p>
          <Link to="/homes" search={homesSearch()} className="hover:text-primary">
            All homes
          </Link>
          <Link to="/homes" search={homesSearch({ onSite: true })} className="hover:text-primary">
            On our lot now
          </Link>
          <Link to="/homes" search={homesSearch({ status: "Special" })} className="hover:text-primary">
            Specials
          </Link>
        </nav>

        <nav className="grid gap-2 text-[15px]">
          <p className="label-caps text-muted-foreground">Company</p>
          <Link to="/financing" className="hover:text-primary">
            Financing
          </Link>
          <Link to="/faq" className="hover:text-primary">
            FAQs
          </Link>
          <Link to="/blog" search={{ page: 1, category: "All" }} className="hover:text-primary">
            Blog
          </Link>
          <Link to="/about" className="hover:text-primary">
            About us
          </Link>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-sm text-muted-foreground sm:px-6">
          Equal Housing Opportunity. Payment estimates are illustrative, not an offer of credit.
        </p>
      </div>
    </footer>
  );
}

export function MobileCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card p-3 lg:hidden print:hidden">
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
