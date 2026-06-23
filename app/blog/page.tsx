import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/seo";
import { SiteHeader, SiteFooter } from "@/app/site-nav";
import { BleviqWidget } from "@/app/bleviq-widget";
import {
  POSTS_BY_DATE,
  CATEGORIES,
  postsInCategory,
  categoryLabel,
  formatDate,
  type Post,
} from "./blog-data";

export const metadata: Metadata = pageMetadata({
  title: "Bleviq Blog: AI Chatbot Guides, Comparisons & Tips",
  description:
    "Practical guides on building, training, and getting results from an AI chatbot for your website. Setup walkthroughs, honest comparisons, and growth tips.",
  path: "/blog",
});

function Card({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:border-slate-300 hover:shadow-md"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
        {categoryLabel(post.category)}
      </span>
      <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900 group-hover:text-brand-700">
        {post.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
        {post.excerpt}
      </p>
      <span className="mt-4 text-xs font-medium text-slate-400">
        {formatDate(post.date)} &middot; {post.readingTime} min read
      </span>
    </Link>
  );
}

export default async function BlogHubPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [featured, ...rest] = POSTS_BY_DATE;
  const recent = rest.slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader signedIn={!!user} />

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {/* Header */}
        <section className="mx-auto max-w-5xl px-6 pt-12 lg:pt-16">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            The Bleviq Blog
          </h1>
          <p className="mt-3 max-w-xl text-lg text-slate-600">
            Guides, comparisons, and tips for putting an AI chatbot to work on
            your website.
          </p>
        </section>

        {/* Featured + two recent */}
        <section className="mx-auto mt-10 max-w-5xl px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Featured spans two columns on large screens */}
            <Link
              href={`/blog/${featured.slug}`}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-gradient-to-br from-[#070713] to-[#1a1a3a] p-8 text-white shadow-card transition hover:shadow-lg lg:col-span-2"
            >
              <div>
                <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-200">
                  Featured &middot; {categoryLabel(featured.category)}
                </span>
                <h2 className="mt-5 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-4 max-w-xl text-slate-300">
                  {featured.excerpt}
                </p>
              </div>
              <span className="mt-8 text-sm font-medium text-slate-400">
                {formatDate(featured.date)} &middot; {featured.readingTime} min
                read
              </span>
            </Link>

            <div className="grid gap-6">
              {recent.map((p) => (
                <Card key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>

        {/* Topic chips */}
        <section className="mx-auto mt-12 max-w-5xl px-6">
          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map((c) => (
              <a
                key={c.key}
                href={`#${c.key}`}
                className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
              >
                {c.label}
              </a>
            ))}
          </div>
        </section>

        {/* Category rows */}
        {CATEGORIES.map((cat) => {
          const posts = postsInCategory(cat.key);
          if (posts.length === 0) return null;
          return (
            <section
              key={cat.key}
              id={cat.key}
              className="mx-auto mt-14 max-w-5xl scroll-mt-24 px-6"
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    {cat.label}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{cat.blurb}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((p) => (
                  <Card key={p.slug} post={p} />
                ))}
              </div>
            </section>
          );
        })}

        {/* All articles */}
        <section className="mx-auto mt-16 max-w-5xl px-6 pb-20">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            All articles
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {POSTS_BY_DATE.map((p) => (
              <Card key={p.slug} post={p} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
      <BleviqWidget />
    </div>
  );
}
