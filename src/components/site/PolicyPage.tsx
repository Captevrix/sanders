import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";

import { getPolicyContent, type PolicyKey } from "@/lib/policies.functions";

export const policyQuery = (key: PolicyKey) =>
  queryOptions({
    queryKey: ["policy", key],
    queryFn: () => getPolicyContent({ data: { key } }),
    staleTime: 30 * 60 * 1000,
  });

const LEGACY: Record<PolicyKey, string> = {
  privacy: "https://www.sandershousing.com/privacy-policy-2/",
  terms: "https://www.sandershousing.com/terms-of-use/",
};

export function PolicyPage({
  policyKey,
  title,
  intro,
}: {
  policyKey: PolicyKey;
  title: string;
  intro: string;
}) {
  const { data } = useSuspenseQuery(policyQuery(policyKey));

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="label-caps text-accent">Legal</p>
      <h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">{title}</h1>
      <p className="mt-3 max-w-[60ch] text-[17px] leading-relaxed text-muted-foreground">{intro}</p>

      {data.updatedAt && (
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated{" "}
          {new Date(data.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {data.version ? ` · version ${data.version}` : ""}
        </p>
      )}

      {data.ok ? (
        <div
          className="policy-body mt-10 text-[16px] leading-relaxed text-foreground"
          dangerouslySetInnerHTML={{ __html: data.html }}
        />
      ) : (
        <div className="surface-card mt-10 rounded-xl p-6">
          <p className="text-[15px] text-muted-foreground">
            We couldn't load this policy right now. You can read the current version here:
          </p>
          <a
            href={LEGACY[policyKey]}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex h-11 items-center rounded-md bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90"
          >
            Open {title}
          </a>
        </div>
      )}

      <p className="mt-12 text-sm text-muted-foreground">
        Questions about this policy? Call us at{" "}
        <a href="tel:18504740261" className="font-semibold text-primary">
          1-850-474-0261
        </a>
        .
      </p>
    </main>
  );
}
