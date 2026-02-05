import Link from "next/link";
import Footer from "@/shared/ui/Footer";
import { blogPosts } from "@/data/blogPosts";

export const metadata = {
  title: "Insights & updates | pdfSwifter",
  description: "News, product thinking, and behind-the-scenes notes from the pdfSwifter team.",
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function BlogPage() {
  const posts = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
  );
  const [featured, ...rest] = posts;
  const categories = Array.from(new Set(posts.map((post) => post.category))).slice(0, 4);
  const highlightTags = Array.from(new Set(posts.flatMap((post) => post.tags))).slice(0, 8);

  return (
    <div
      className="min-h-screen bg-[#fff8f1] text-slate-900 font-[var(--font-body)]"
      style={{
        "--font-display": '"Playfair Display", "Georgia", serif',
        "--font-body": '"Work Sans", "Trebuchet MS", sans-serif',
      }}
    >
      <style>{`
        @keyframes blogFade {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-100" />
        <div className="absolute -top-24 left-8 h-64 w-64 rounded-full bg-orange-200/60 blur-3xl" />
        <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-amber-300/50 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <span className="inline-flex items-center rounded-full border border-orange-200 bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.35em] text-orange-800">
            Insights
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl font-[var(--font-display)]">
            pdfSwifter journal
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-700 md:text-lg">
            Product thinking, reliability notes, and workflows from the team building the toolkit.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <article
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
            style={{ animation: "blogFade 0.8s ease-out both" }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Featured</p>
            {featured ? (
              <>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
                  <span className="text-amber-400">·</span>
                  <span>{featured.category}</span>
                </div>
                <h2 className="mt-3 text-3xl font-bold text-slate-900 tracking-tight">
                  {featured.title}
                </h2>
                <p className="mt-3 text-base text-slate-700">{featured.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {featured.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="mt-6 inline-flex text-sm font-semibold text-slate-900 underline hover:text-slate-700"
                >
                  Read featured story →
                </Link>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-600">Stories are landing soon. Check back for the first entry.</p>
            )}
          </article>

          <aside className="space-y-6" style={{ animation: "blogFade 0.8s ease-out both", animationDelay: "120ms" }}>
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Topics</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-amber-200">Updates</p>
              <h3 className="mt-3 text-xl font-semibold font-[var(--font-display)]">
                Get monthly product notes.
              </h3>
              <p className="mt-2 text-sm text-slate-200">
                We share wins, reliability improvements, and new tools before launch.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-200"
              >
                Join the update list
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Highlights</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {highlightTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-orange-200 px-3 py-1 text-xs font-medium text-orange-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-2" style={{ animation: "blogFade 0.8s ease-out both", animationDelay: "220ms" }}>
          {rest.map((post) => (
            <article
              key={post.slug}
              className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                <span className="text-amber-400">·</span>
                <span>{post.category}</span>
              </div>

              <h3 className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">{post.title}</h3>
              <p className="mt-3 text-base text-slate-700">{post.summary}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-semibold text-slate-900 underline hover:text-slate-700"
                >
                  Read story →
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
