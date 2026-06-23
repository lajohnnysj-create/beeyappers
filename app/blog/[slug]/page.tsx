import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/seo";
import { SiteHeader, SiteFooter } from "@/app/site-nav";
import { BleviqWidget } from "@/app/bleviq-widget";
import { SignupCtas } from "@/app/signup-ctas";
import {
  POSTS,
  getPost,
  relatedPosts,
  categoryLabel,
  formatDate,
  postImage,
  type Block,
  type Span,
  type Post,
} from "../blog-data";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  return pageMetadata({
    title: post.metaTitle,
    description: post.metaDescription,
    path: `/blog/${post.slug}`,
    image: postImage(post),
  });
}

function Spans({ spans }: { spans: Span[] }) {
  return (
    <>
      {spans.map((s, i) =>
        typeof s === "string" ? (
          <span key={i}>{s}</span>
        ) : (
          <Link
            key={i}
            href={s.href}
            className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:decoration-brand-400"
          >
            {s.text}
          </Link>
        )
      )}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 className="mt-10 text-2xl font-bold tracking-tight text-slate-900">
          {block.text}
        </h2>
      );
    case "p":
      return (
        <p className="mt-5 text-[1.05rem] leading-relaxed text-slate-700">
          {block.text}
        </p>
      );
    case "plinks":
      return (
        <p className="mt-5 text-[1.05rem] leading-relaxed text-slate-700">
          <Spans spans={block.spans} />
        </p>
      );
    case "ul":
      return (
        <ul className="mt-5 space-y-2.5 text-[1.05rem] leading-relaxed text-slate-700">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
              />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div className="mt-7 rounded-xl border border-brand-100 bg-brand-50/60 px-5 py-4 text-[1.05rem] leading-relaxed text-slate-800">
          {block.text}
        </div>
      );
    case "quote":
      return (
        <blockquote className="mt-7 border-l-4 border-brand-300 pl-5 text-xl font-medium leading-snug text-slate-900">
          {block.text}
        </blockquote>
      );
  }
}

function RelatedCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition hover:border-slate-300 hover:shadow-md"
    >
      <img
        src={postImage(post)}
        alt=""
        loading="lazy"
        className="aspect-[16/9] w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          {categoryLabel(post.category)}
        </span>
        <h3 className="mt-2 text-base font-bold leading-snug text-slate-900 group-hover:text-brand-700">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>
        <span className="mt-4 text-sm font-medium text-slate-400">
          {post.readingTime} min read
        </span>
      </div>
    </Link>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const related = relatedPosts(post);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "Bleviq" },
    mainEntityOfPage: `https://www.bleviq.com/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader signedIn={!!user} />

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <article className="mx-auto max-w-3xl px-6 pb-20 pt-10 lg:pt-14">
          <Link
            href="/blog"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            &larr; All articles
          </Link>

          <header className="mt-6 border-b border-slate-200 pb-8">
            <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              {categoryLabel(post.category)}
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-sm text-slate-500">
              {post.author} &middot; {formatDate(post.date)} &middot;{" "}
              {post.readingTime} min read
            </p>
          </header>

          <img
            src={postImage(post)}
            alt=""
            className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover"
          />

          <div className="mt-2">
            {post.body.map((block, i) => (
              <BlockView key={i} block={block} />
            ))}
          </div>
        </article>

        {/* CTA band */}
        <section className="bg-[#070713]">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Add a free AI chatbot to your site
            </h2>
            <p className="mx-auto mt-3 max-w-md text-slate-300">
              Train it on your website in minutes and let it answer your
              visitors. Free to start, no credit card required.
            </p>
            <div className="mt-7">
              <SignupCtas centered />
            </div>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mx-auto max-w-5xl px-6 py-16">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Keep reading
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <RelatedCard key={p.slug} post={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
      <BleviqWidget />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
    </div>
  );
}
