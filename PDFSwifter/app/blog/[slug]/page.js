import { blogPosts } from "@/data/blogPosts";
import { notFound } from "next/navigation";
import Link from "next/link";
import Footer from "@/shared/ui/Footer";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const post = blogPosts.find((entry) => entry.slug === resolvedParams?.slug);
  if (!post) {
    return {
      title: "Blog post not found | pdfSwifter",
    };
  }

  return {
    title: `${post.title} | pdfSwifter`,
    description: post.summary,
    openGraph: {
      title: `${post.title} | pdfSwifter`,
      description: post.summary,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | pdfSwifter`,
      description: post.summary,
    },
  };
}

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const post = blogPosts.find((entry) => entry.slug === resolvedParams?.slug);

  if (!post) {
    notFound();
  }

  return (
    <div
      className="min-h-screen bg-[#fff8f1] text-slate-900 font-[var(--font-body)]"
      style={{
        "--font-display": '"Playfair Display", "Georgia", serif',
        "--font-body": '"Work Sans", "Trebuchet MS", sans-serif',
      }}
    >
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-100" />
        <div className="absolute -top-24 left-8 h-64 w-64 rounded-full bg-orange-200/60 blur-3xl" />
        <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-amber-300/50 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 lg:py-20">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span className="text-amber-400">·</span>
            <span>{post.category}</span>
            <span className="text-slate-400">·</span>
            <span className="font-medium text-slate-900">By {post.author}</span>
          </div>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl font-[var(--font-display)]">
            {post.title}
          </h1>
          <p className="mt-4 text-base text-slate-700 md:text-lg">{post.summary}</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <div className="space-y-6 text-slate-700">
            {post.content.map((paragraph, index) => (
              <p key={`${post.slug}-paragraph-${index}`}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <Link href="/blog" className="text-sm font-semibold text-slate-900 underline hover:text-slate-700">
              ← Back to blog
            </Link>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
