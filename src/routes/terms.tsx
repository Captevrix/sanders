import { createFileRoute } from "@tanstack/react-router";

import { PolicyPage, policyQuery } from "@/components/site/PolicyPage";
import { SiteFooter, MobileCallBar } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/terms")({
  loader: ({ context }) => context.queryClient.ensureQueryData(policyQuery("terms")),
  head: () => ({
    meta: [
      { title: "Terms of Use | Sanders Manufactured Housing" },
      {
        name: "description",
        content:
          "The terms that apply when you use the Sanders Manufactured Housing website, request a payment quote, or opt in to text messages from our team.",
      },
      { property: "og:title", content: "Terms of Use | Sanders Manufactured Housing" },
      {
        property: "og:description",
        content: "Terms that apply to our website, quotes, and text message program.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sanders.lovable.app/terms" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://sanders.lovable.app/terms" }],
  }),
  component: TermsRoute,
});

function TermsRoute() {
  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <SiteHeader />
      <PolicyPage
        policyKey="terms"
        title="Terms of Use"
        intro="The ground rules for using our site, our quotes, and our text message program."
      />
      <SiteFooter />
      <MobileCallBar />
    </div>
  );
}
