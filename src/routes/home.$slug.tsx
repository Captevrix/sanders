import { createFileRoute, redirect } from "@tanstack/react-router";

import { LEGACY_SLUGS } from "@/components/site/data";

/** Compatibility route for legacy WordPress URLs like /home/delight. */
export const Route = createFileRoute("/home/$slug")({
  beforeLoad: ({ params }) => {
    const slug = params.slug.toLowerCase();
    throw redirect({
      to: "/homes/$homeId",
      params: { homeId: LEGACY_SLUGS[slug] ?? slug },
    });
  },
});
