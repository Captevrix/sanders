import { Facebook, Instagram, Linkedin } from "lucide-react";

export const SOCIAL_LINKS = [
  {
    label: "Sanders Manufactured Housing on Facebook",
    href: "https://www.facebook.com/sandershousing/",
    Icon: Facebook,
  },
  {
    label: "Sanders Manufactured Housing on Instagram",
    href: "https://www.instagram.com/sandershousinginc/",
    Icon: Instagram,
  },
  {
    label: "Sanders Manufactured Housing on LinkedIn",
    href: "https://www.linkedin.com/company/sanders-manufactured-housing",
    Icon: Linkedin,
  },
] as const;

export function SocialLinks({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const box = size === "sm" ? "size-9" : "size-10";
  const icon = size === "sm" ? "size-4" : "size-[18px]";

  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {SOCIAL_LINKS.map(({ label, href, Icon }) => (
        <li key={href}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer me"
            aria-label={label}
            title={label}
            className={`inline-flex ${box} items-center justify-center rounded-full border border-border bg-card text-primary transition-colors hover:bg-secondary hover:text-primary`}
          >
            <Icon className={icon} aria-hidden />
          </a>
        </li>
      ))}
    </ul>
  );
}
