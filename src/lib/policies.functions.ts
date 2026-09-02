import { createServerFn } from "@tanstack/react-start";

import type { Policy, PolicyKey } from "./policies.server";

export type { Policy, PolicyKey };

/** Public: legal policy content (privacy / terms). No auth. */
export const getPolicyContent = createServerFn({ method: "GET" })
  .inputValidator((data: { key: PolicyKey }): { key: PolicyKey } => ({
    key: data.key === "terms" ? "terms" : "privacy",
  }))
  .handler(async ({ data }): Promise<Policy> => {
    const { getPolicy } = await import("./policies.server");
    return getPolicy(data.key);
  });
