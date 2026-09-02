import { createFileRoute } from "@tanstack/react-router";

import { PolicyPage, policyQuery } from "@/components/site/PolicyPage";
import { SiteFooter, MobileCallBar } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/privacy")({
  loader: ({ context }) => context.queryClient.ensureQueryData(policyQuery("privacy")),
  head: () => ({
    meta: [
      { title: "Privacy Policy | Sanders Manufactured Housing" },
      {
        name: "description",
        content:
          "How Sanders Manufactured Housing collects, uses, and protects the information you share with us, including text message and marketing preferences.",
      },
      { property: "og:title", content: "Privacy Policy | Sanders Manufactured Housing" },
      {
        property: "og:description",
        content: "How we collect, use, and protect the information you share with us.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://sanders.lovable.app/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://sanders.lovable.app/privacy" }],
  }),
  component: PrivacyRoute,
});

function PrivacyRoute() {
  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <SiteHeader />
      <PolicyPage
        policyKey="privacy"
        title="Privacy Policy"
        intro="What we collect when you contact us about a home, how we use it, and how to opt out at any time."
      />
      <SiteFooter />
      <MobileCallBar />
    </div>
  );
}
