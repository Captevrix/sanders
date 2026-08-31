import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";

import { homesSearch } from "./data";

const HOME_LINKS = [
  { label: "Our homes", search: homesSearch() },
  { label: "Specials", search: homesSearch({ status: "Special" }) },
  { label: "On display", search: homesSearch({ status: "On Site" }) },
];

const HASH_LINKS = [
  { label: "Financing", hash: "qualify" },
  { label: "Delivery & setup", hash: "setup" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-extrabold tracking-tight text-primary">
            Sanders
          </span>
          <span className="label-caps text-muted-foreground">Housing</span>
        </Link>

        <nav className="hidden items-center gap-6 text-[15px] font-medium text-foreground lg:flex">
          {HOME_LINKS.map((item) => (
            <Link key={item.label} to="/homes" search={item.search} className="hover:text-primary">
              {item.label}
            </Link>
          ))}
          {HASH_LINKS.map((item) => (
            <Link key={item.label} to="/" hash={item.hash} className="hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href="tel:18504740261"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 font-semibold text-primary-foreground hover:opacity-90"
        >
          <Phone className="size-4" aria-hidden />
          <span className="hidden sm:inline">1-850-474-0261</span>
          <span className="sm:hidden">Call</span>
        </a>
      </div>
    </header>
  );
}
