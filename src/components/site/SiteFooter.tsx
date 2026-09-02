import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";

import awardImg from "@/assets/best-of-2026-award.webp.asset.json";
import logo from "@/assets/sanders-logo.png.asset.json";
import { homesSearch } from "./data";
import { SocialLinks } from "./SocialLinks";


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
          <SocialLinks className="mt-4" />

          <Link to="/about" className="mt-4 flex items-center gap-3">
            <img
              src={awardImg.url}
              alt="Best of 2026 Mobile Home Dealer award, BusinessRate, powered by Google Reviews"
              loading="lazy"
              width={1227}
              height={1536}
              className="w-20 rounded-md shadow-sm"
            />
            <span className="max-w-[16ch] text-sm text-muted-foreground">
              Best of 2026, Mobile Home Dealer, Pensacola
            </span>
          </Link>
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
          <Link to="/reviews" className="hover:text-primary">
            Reviews
          </Link>
          <Link to="/about" className="hover:text-primary">
            About us
          </Link>
          <p className="label-caps mt-4 text-muted-foreground">Legal</p>
          <Link to="/privacy" className="hover:text-primary">
            Privacy policy
          </Link>
          <Link to="/terms" className="hover:text-primary">
            Terms of use
          </Link>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <p className="text-sm text-muted-foreground">
            Equal Housing Opportunity. Payment estimates are illustrative, not an offer of credit.
          </p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sanders Manufactured Housing, Inc.
          </p>
        </div>
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
