import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Clock, Phone } from "lucide-react";

import { homesSearch } from "@/components/site/data";
import { MobileCallBar, SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { listPosts, type BlogPost } from "@/lib/blog.functions";
import fallbackCover from "@/assets/setup.jpg";

const TITLE = "Sanders Housing Blog: buying, financing and setup in Pensacola";
const DESCRIPTION =
  "Straight answers on manufactured home pricing, wind zones, land-home financing and delivery on the Florida Gulf Coast, from the team on Pensacola Blvd.";

const PER_PAGE = 6;

export const postsQuery = queryOptions({
  queryKey: ["blog", "posts"],
  queryFn: () => listPosts(),
});

type BlogSearch = { page: number; category: string };

export const Route = createFileRoute("/blog/")({
  validateSearch: (raw: Record<string, unknown>): BlogSearch => ({
    page: Math.max(1, Number(raw["page"]) || 1),
    category: typeof raw["category"] === "string" ? raw["category"].slice(0, 60) : "All",
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: () => <BlogShell><p className="py-20 text-center text-muted-foreground">The blog is taking a break, please try again shortly.</p></BlogShell>,
  component: BlogIndex,
});

export function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function coverOf(post: BlogPost): string {
  return post.coverImage ?? fallbackCover;
}

function BlogShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <SiteHeader />
      {children}
      <SiteFooter />
      <MobileCallBar />
    </div>
  );
}

function BlogIndex() {
  const { data: posts } = useSuspenseQuery(postsQuery);
  const search = Route.useSearch();

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];
  const filtered = search.category === "All" ? posts : posts.filter((p) => p.category === search.category);

  const [featured, ...rest] = search.page === 1 && search.category === "All" ? filtered : [null, ...filtered];
  const list = (featured ? rest : filtered) as BlogPost[];
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const page = Math.min(search.page, pages);
  const visible = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <BlogShell>
      <main>
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <p className="label-caps text-accent">From the lot</p>
            <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Straight talk about buying a manufactured home
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              Pricing, financing, wind zones, land and setup, written by the people who deliver and set
              these homes across Northwest Florida.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <nav className="flex flex-wrap gap-2" aria-label="Post categories">
            {categories.map((cat) => (
              <Link
                key={cat}
                to="/blog"
                search={{ page: 1, category: cat }}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  cat === search.category
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-secondary"
                }`}
              >
                {cat}
              </Link>
            ))}
          </nav>

          {featured && (
            <Link
              to="/blog/$slug"
              params={{ slug: featured.slug }}
              className="surface-card mt-8 grid overflow-hidden rounded-xl md:grid-cols-2"
            >
              <img
                src={coverOf(featured)}
                alt={featured.title}
                className="h-56 w-full object-cover md:h-full"
                loading="eager"
              />
              <div className="p-6 sm:p-8">
                <span className="label-caps text-accent">{featured.category}</span>
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{featured.title}</h2>
                <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
                <p className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{featured.author}</span>
                  <span aria-hidden>·</span>
                  <span>{formatDate(featured.publishedAt)}</span>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden /> {featured.readTime} min
                  </span>
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-semibold text-primary">
                  Read the post <ArrowRight className="size-4" aria-hidden />
                </span>
              </div>
            </Link>
          )}

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((post) => (
              <Link
                key={post.slug}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="surface-card flex flex-col overflow-hidden rounded-xl transition hover:-translate-y-0.5"
              >
                <img src={coverOf(post)} alt={post.title} loading="lazy" className="h-44 w-full object-cover" />
                <div className="flex flex-1 flex-col p-5">
                  <span className="label-caps text-accent">{post.category}</span>
                  <h3 className="mt-2 text-lg font-bold leading-snug">{post.title}</h3>
                  <p className="mt-2 flex-1 text-[15px] text-muted-foreground">{post.excerpt}</p>
                  <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDate(post.publishedAt)}</span>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" aria-hidden /> {post.readTime} min
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {visible.length === 0 && (
            <p className="py-16 text-center text-muted-foreground">No posts in this category yet.</p>
          )}

          {pages > 1 && (
            <nav className="mt-10 flex justify-center gap-2" aria-label="Pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  to="/blog"
                  search={{ page: n, category: search.category }}
                  className={`inline-flex size-10 items-center justify-center rounded-md border font-semibold ${
                    n === page ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"
                  }`}
                >
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <section className="border-t border-border bg-sand">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Ready to see homes in person?</h2>
              <p className="mt-1 text-muted-foreground">
                Walk the lot on Pensacola Blvd, Mon–Sat 9–6. No appointment needed.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="tel:18504740261"
                className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90"
              >
                <Phone className="size-4" aria-hidden /> 1-850-474-0261
              </a>
              <Link
                to="/homes"
                search={homesSearch()}
                className="inline-flex h-12 items-center rounded-md border border-border bg-card px-5 font-semibold hover:bg-secondary"
              >
                Browse homes
              </Link>
            </div>
          </div>
        </section>
      </main>
    </BlogShell>
  );
}
