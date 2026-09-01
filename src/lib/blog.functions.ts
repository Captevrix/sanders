import { createServerFn } from "@tanstack/react-start";

import type { BlogPost } from "./blog.server";

export type { BlogPost };

/** Public: all posts, newest first. Safe for public route loaders (no auth). */
export const listPosts = createServerFn({ method: "GET" }).handler(async (): Promise<BlogPost[]> => {
  const { getAllPosts } = await import("./blog.server");
  return getAllPosts();
});

/** Public: one post by slug, plus up to 3 related posts. */
export const getPost = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 120) }))
  .handler(async ({ data }): Promise<{ post: BlogPost; related: BlogPost[] } | null> => {
    const { getAllPosts } = await import("./blog.server");
    const posts = await getAllPosts();
    const post = posts.find((p) => p.slug === data.slug);
    if (!post) return null;
    const related = posts
      .filter((p) => p.slug !== post.slug)
      .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
      .slice(0, 3);
    return { post, related };
  });
