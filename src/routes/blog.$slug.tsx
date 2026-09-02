import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Phone } from "lucide-react";

import { MobileCallBar, SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getPost } from "@/lib/blog.functions";
import { coverOf, formatDate } from "./blog.index";

const SITE = "https://www.sandershousing.com";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const result = await getPost({ data: { slug: params.slug } });
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Post not found | Sanders Housing" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    const url = `${SITE}/blog/${params.slug}`;
    const image = post.coverImage;
    return {
      meta: [
        { title: `${post.title} | Sanders Housing` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt,
            author: { "@type": "Organization", name: post.author },
            publisher: { "@type": "Organization", name: "Sanders Manufactured Housing" },
            mainEntityOfPage: url,
            ...(image ? { image } : {}),
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <Shell>
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">We couldn&apos;t find that post</h1>
        <p className="mt-3 text-muted-foreground">It may have moved. Here&apos;s everything we&apos;ve written.</p>
        <Link
          to="/blog"
          search={{ page: 1, category: "All" }}
          className="mt-6 inline-flex h-12 items-center rounded-md bg-primary px-5 font-semibold text-primary-foreground"
        >
          Back to blog
        </Link>
      </div>
    </Shell>
  ),
  errorComponent: () => (
    <Shell>
      <p className="py-24 text-center text-muted-foreground">This post couldn&apos;t be loaded right now.</p>
    </Shell>
  ),
  component: BlogPostPage,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <MobileCallBar />
    </div>
  );
}

function BlogPostPage() {
  const { post, related } = Route.useLoaderData();

  return (
    <Shell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          to="/blog"
          search={{ page: 1, category: "All" }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back to blog
        </Link>

        <p className="label-caps mt-6 text-accent">{post.category}</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>By {post.author}</span>
          <span aria-hidden>·</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden /> {post.readTime} min read
          </span>
        </p>

        <img
          src={coverOf(post)}
          alt={post.title}
          className="mt-6 aspect-[16/9] w-full rounded-xl object-cover"
          loading="eager"
        />

        <div className="post-body mt-8" dangerouslySetInnerHTML={{ __html: post.html }} />

        <div className="surface-card mt-12 rounded-xl p-6">
          <h2 className="text-xl font-bold tracking-tight">Questions about your situation?</h2>
          <p className="mt-1 text-muted-foreground">
            Call the lot and we&apos;ll walk it through, land, payment or delivery. Mon–Sat 9–6.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="tel:18504740261"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-accent px-5 font-semibold text-accent-foreground hover:opacity-90"
            >
              <Phone className="size-4" aria-hidden /> 1-850-474-0261
            </a>
            <Link
              to="/"
              hash="qualify"
              className="inline-flex h-12 items-center rounded-md border border-border px-5 font-semibold hover:bg-secondary"
            >
              See if I qualify
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold tracking-tight">Keep reading</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="surface-card overflow-hidden rounded-lg"
                >
                  <img src={coverOf(p)} alt={p.title} loading="lazy" className="h-28 w-full object-cover" />
                  <p className="p-4 text-[15px] font-semibold leading-snug">{p.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </Shell>
  );
}
