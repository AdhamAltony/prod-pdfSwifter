import React from "react";
import Link from "next/link";
import Footer from "@/shared/ui/Footer";

export const metadata = {
  title: "Help Center | pdfSwifter",
  description: "FAQs and support resources for pdfSwifter.",
};

const faqs = [
  {
    question: "Where do I download my file?",
    answer: "After conversion, you will be redirected to a result page with a download button.",
  },
  {
    question: "My download expired.",
    answer: "Downloads are available for 30 minutes. Re-run the tool or contact support with your details.",
  },
  {
    question: "Is there a usage limit?",
    answer:
      "No. All tools are free to use with unlimited runs.",
  },
  {
    question: "How do I check remaining usage?",
    answer: "Usage is unlimited, so you can run tools without tracking remaining runs.",
  },
];

const supportCards = [
  {
    title: "Start here",
    detail: "Review the basics of uploads, processing, and downloads.",
    cta: "Browse tools",
    href: "/tools",
  },
  {
    title: "Contact support",
    detail: "Send a message to the team with context and file details.",
    cta: "Send message",
    href: "/contact",
  },
  {
    title: "Free access",
    detail: "All tools are available with unlimited usage.",
    cta: "View pricing",
    href: "/pricing",
  },
];

export default function HelpPage() {
  return (
    <div
      className="min-h-screen bg-[#f4f7f2] text-slate-900 font-[var(--font-body)]"
      style={{
        "--font-display": '"DM Serif Display", "Georgia", serif',
        "--font-body": '"Space Grotesk", "Trebuchet MS", sans-serif',
      }}
    >
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-lime-50" />
        <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl" />
        <div className="absolute -bottom-24 left-8 h-64 w-64 rounded-full bg-lime-200/60 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.35em] text-emerald-800">
            Help Center
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl font-[var(--font-display)]">
            Answers, guidance, and direct support.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-700 md:text-lg">
            Get the fastest path to a clean conversion. Search for help, browse FAQs, or reach the team.
          </p>
          <div className="mt-6 max-w-xl">
            <label className="block text-sm font-semibold text-slate-600">Search help articles</label>
            <div className="mt-2 flex items-center rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Search</span>
              <input
                type="text"
                placeholder="Search by tool or question..."
                className="ml-3 w-full bg-transparent text-sm text-slate-700 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
        <section className="grid gap-6 md:grid-cols-3">
          {supportCards.map((card) => (
            <div key={card.title} className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Support</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-3 text-sm text-slate-600">{card.detail}</p>
              <Link
                href={card.href}
                className="mt-5 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {card.cta}
              </Link>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">FAQ</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Frequently asked questions</h2>
            </div>
            <Link href="/contact" className="text-sm font-semibold text-emerald-700 hover:underline">
              Still need help?
            </Link>
          </div>
          <div className="mt-6 divide-y divide-slate-200">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-4">
                <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
                <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-slate-900 p-8 text-white shadow-lg">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Need more help?</p>
            <h2 className="mt-3 text-2xl font-semibold font-[var(--font-display)]">
              We’re here to help with any workflow.
            </h2>
            <p className="mt-3 text-sm text-slate-200">
              Share your tool name, file details, and what you tried so far. We’ll respond as quickly as possible.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-emerald-300 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-200"
              >
                Contact support
              </Link>
              <Link
                href="/tools"
                className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white hover:border-white"
              >
                Browse tools
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
