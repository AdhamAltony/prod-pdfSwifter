import React from "react";

// Server Component - bold layout for content pages
export default function ContentPage({ title, intro, children, eyebrow = "pdfSwifter" }) {
  return (
    <div
      className="min-h-screen bg-[#f6f4ef] text-slate-900 font-[var(--font-body)]"
      style={{
        "--font-display": '"Fraunces", "Georgia", serif',
        "--font-body": '"Space Grotesk", "Trebuchet MS", sans-serif',
      }}
    >
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-amber-400/40 blur-3xl" />
        <div className="absolute -bottom-24 left-8 h-64 w-64 rounded-full bg-teal-500/30 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-400 via-teal-400 to-slate-900" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 py-14 md:py-20">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.35em] text-amber-200">
            {eyebrow}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl font-[var(--font-display)]">
            {title}
          </h1>
          {intro && (
            <p className="mt-4 text-base text-slate-200 md:text-lg">
              {intro}
            </p>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <article
            className="prose prose-lg prose-slate max-w-none p-8 md:p-12
            [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:pb-3 [&_h2]:border-b [&_h2]:border-slate-200 [&_h2:first-child]:mt-0
            [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:mt-8 [&_h3]:mb-4
            [&_p]:text-slate-700 [&_p]:leading-relaxed [&_p]:mb-6
            [&_ul]:space-y-3 [&_ul]:mb-6
            [&_li]:text-slate-700 [&_li]:leading-relaxed
            [&_a]:text-teal-700 [&_a]:font-medium [&_a]:hover:text-teal-800 [&_a]:hover:underline [&_a]:transition-colors
            [&_strong]:font-semibold [&_strong]:text-slate-900"
          >
            {children}
          </article>
        </div>

        <div className="mt-12">
          <div className="rounded-3xl bg-gradient-to-br from-amber-200 via-amber-100 to-teal-100 p-8 text-slate-900 shadow-lg">
            <h3 className="text-xl font-semibold font-[var(--font-display)]">Questions or feedback?</h3>
            <p className="mt-3 text-sm text-slate-700">We&apos;re here to help. Reach out anytime.</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <a
                href="/contact"
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Contact Support
              </a>
              <a
                href="/help"
                className="rounded-full border border-slate-900/30 px-5 py-2 text-sm font-semibold text-slate-900 hover:border-slate-900/60"
              >
                Help Center
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
