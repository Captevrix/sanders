import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";

import logo from "@/assets/sanders-logo.png.asset.json";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { homesSearch } from "./data";
import { SocialLinks } from "./SocialLinks";

const HOME_LINKS = [
  { label: "Our homes", search: homesSearch() },
  { label: "On our lot", search: homesSearch({ onSite: true }) },
  { label: "Specials", search: homesSearch({ status: "Special" }) },
];

const ABOUT_LINKS = [
  {
    label: "About us",
    to: "/about" as const,
    search: {},
    description: "Our family, our lot, and how buying works here.",
  },
  {
    label: "Reviews",
    to: "/reviews" as const,
    search: {},
    description: "What Pensacola families say about working with us.",
  },
  {
    label: "FAQs",
    to: "/faq" as const,
    search: {},
    description: "Straight answers on pricing, setup and financing.",
  },
  {
    label: "Blog",
    to: "/blog" as const,
    search: { page: 1, category: "All" },
    description: "Guides and news for manufactured home buyers.",
  },
];

const ABOUT_PATHS = ABOUT_LINKS.map((l) => l.to);

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const aboutActive = ABOUT_PATHS.some((p) => pathname.startsWith(p));

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
          <Link to="/financing" className="hover:text-primary" activeProps={{ className: "text-primary" }}>
            Financing
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`h-auto bg-transparent px-0 py-0 text-[15px] font-medium hover:bg-transparent hover:text-primary focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:hover:bg-transparent ${
                    aboutActive ? "text-primary" : "text-foreground"
                  }`}
                >
                  About us
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[340px] gap-1 p-2">
                    {ABOUT_LINKS.map((item) => (
                      <li key={item.label}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.to}
                            search={item.search}
                            className="block rounded-md px-3 py-2.5 hover:bg-secondary"
                            activeProps={{ className: "bg-secondary" }}
                          >
                            <span className="block text-sm font-semibold text-foreground">
                              {item.label}
                            </span>
                            <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                              {item.description}
                            </span>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="flex items-center gap-2">
          <SocialLinks size="sm" className="hidden xl:flex" />
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
            <Link
              to="/financing"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-3 font-medium hover:bg-secondary"
            >
              Financing
            </Link>
            <p className="label-caps mt-2 px-2 text-muted-foreground">About us</p>
            {ABOUT_LINKS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={item.search}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 pl-5 font-medium hover:bg-secondary"
              >
                {item.label}
              </Link>
            ))}
            <SocialLinks className="mt-2 px-2" />
          </div>
        </nav>
      )}
    </header>
  );
}
