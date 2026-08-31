import { Phone } from "lucide-react";

const NAV = [
  { label: "Browse homes", href: "#inventory" },
  { label: "See if you qualify", href: "#qualify" },
  { label: "Delivery & setup", href: "#setup" },
  { label: "Why Sanders", href: "#trust" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-extrabold tracking-tight text-primary">
            Sanders
          </span>
          <span className="label-caps text-muted-foreground">Housing</span>
        </a>

        <nav className="hidden items-center gap-7 text-[15px] font-medium text-foreground lg:flex">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-primary">
              {item.label}
            </a>
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
