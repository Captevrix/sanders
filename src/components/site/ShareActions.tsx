import { Link } from "@tanstack/react-router";
import { Check, Mail, Printer, Share2 } from "lucide-react";
import { useState } from "react";

import { estimateMonthly, money, type Home } from "./data";

/** Absolute URL for a home, safe during SSR. */
export function homeUrl(home: Home) {
  const origin = typeof window === "undefined" ? "https://www.sandershousing.com" : window.location.origin;
  return `${origin}/homes/${home.id}`;
}

export function shareText(home: Home) {
  const monthly = home.price ? `Est. ${money(estimateMonthly(home.price))}/mo` : "Payment quoted same day";
  return [
    `${home.name} by ${home.builder}`,
    `${home.beds} bed · ${home.baths} bath · ${home.sqft.toLocaleString("en-US")} sq ft · ${home.dimensions}`,
    monthly,
    `Sanders Manufactured Housing — 10300 Pensacola Blvd, Pensacola, FL · 1-850-474-0261`,
    homeUrl(home),
  ].join("\n");
}

export function ShareActions({ home }: { home: Home }) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const url = homeUrl(home);
    const data = { title: `${home.name} — Sanders Housing`, text: shareText(home), url };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* user dismissed — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  const mailto = `mailto:?subject=${encodeURIComponent(
    `${home.name} at Sanders Housing`,
  )}&body=${encodeURIComponent(`${shareText(home)}\n\nSent from sandershousing.com`)}`;

  const btn =
    "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-border px-3 text-[15px] font-semibold hover:bg-secondary";

  return (
    <div className="print:hidden">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onShare} className={btn}>
          {copied ? (
            <>
              <Check className="size-4 text-primary" aria-hidden /> Link copied
            </>
          ) : (
            <>
              <Share2 className="size-4" aria-hidden /> Share
            </>
          )}
        </button>
        <a href={mailto} className={btn}>
          <Mail className="size-4" aria-hidden /> Email it to me
        </a>
        <Link to="/flyer/$homeId" params={{ homeId: home.id }} className={btn}>
          <Printer className="size-4" aria-hidden /> Print flyer
        </Link>
      </div>
      <p className="mt-2 text-[13px] text-muted-foreground">
        Send this home to yourself, text it to whoever's deciding with you, or print a one-page
        flyer with the specs.
      </p>
    </div>
  );
}
