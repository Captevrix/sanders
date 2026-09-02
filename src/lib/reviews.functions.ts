import { createServerFn } from "@tanstack/react-start";

import type { Review, ReviewsPayload } from "./reviews.server";

export type { Review, ReviewsPayload };

/** Public: customer reviews from the HighLevel reputation feed. No auth. */
export const listReviews = createServerFn({ method: "GET" }).handler(
  async (): Promise<ReviewsPayload> => {
    const { getReviews } = await import("./reviews.server");
    return getReviews();
  },
);
