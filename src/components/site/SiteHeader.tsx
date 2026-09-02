import { Link } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";

import logo from "@/assets/sanders-logo.png.asset.json";
import { homesSearch } from "./data";

const HOME_LINKS = [
  { label: "Our homes", search: homesSearch() },
  { label: "On our lot", search: homesSearch({ onSite: true }) },
  { label: "Specials", search: homesSearch({ status: "Special" }) },
];

const PAGE_LINKS = [
  { label: "Financing", to: "/financing" as const, search: {} },
  { label: "FAQs", to: "/faq" as const, search: {} },
  { label: "Blog", to: "/blog" as const, search: { page: 1, category: "All" } },
  { label: "Reviews", to: "/reviews" as const, search: {} },
  { label: "About us", to: "/about" as const, search: {} },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center" aria-label="Sanders Manufactured Housing home">
          <img
            src={logo.url}
            alt="Sanders Manufactured Housing"
            width={500}
            height={261}
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-5 text-[15px] font-medium text-foreground lg:flex">
          {HOME_LINKS.map((item) => (
            <Link key={item.label} to="/homes" search={item.search} className="hover:text-primary">
              {item.label}
            </Link>
          ))}
          {PAGE_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              search={item.search}
              className="hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="tel:18504740261"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 font-semibold text-primary-foreground hover:opacity-90"
          >
            <Phone className="size-4" aria-hidden />
            <span className="hidden sm:inline">1-850-474-0261</span>
            <span className="sm:hidden">Call</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="inline-flex size-11 items-center justify-center rounded-md border border-border lg:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto grid max-w-6xl gap-1 px-4 py-3 sm:px-6">
            {HOME_LINKS.map((item) => (
              <Link
                key={item.label}
                to="/homes"
                search={item.search}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 font-medium hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
            {PAGE_LINKS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={item.search}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 font-medium hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
