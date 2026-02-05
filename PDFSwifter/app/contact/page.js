import React from "react";
import Footer from "@/shared/ui/Footer";
import ContactForm from "@/features/contact/ui/ContactForm";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div
      className="min-h-screen bg-[#eef5fb] text-slate-900 font-[var(--font-body)]"
      style={{
        "--font-display": '"Sora", "Trebuchet MS", sans-serif',
        "--font-body": '"Inter Tight", "Trebuchet MS", sans-serif',
      }}
    >
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f4f8ff] via-[#eef5fb] to-[#e9f4f1]" />
        <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-sky-200/70 blur-3xl" />
        <div className="absolute -bottom-24 left-12 h-72 w-72 rounded-full bg-emerald-200/60 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <span className="inline-flex items-center rounded-full border border-sky-200 bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.35em] text-sky-800">
            Contact
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl font-[var(--font-display)]">
            Let&apos;s solve your PDF workflow together.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-700 md:text-lg">
            Tell us what you&apos;re building, where you&apos;re stuck, or what feature you want next. We reply fast
            and with real answers.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-16 grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">How to reach us</p>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900 font-[var(--font-display)]">
              We read every message.
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              For quick questions, the Help Center might already have an answer. Otherwise, send a message and share
              as much context as you can.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">hello@example.com</p>
              <p className="mt-1 text-sm text-slate-600">General questions, feedback, or partnership requests.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Support</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Priority responses</p>
              <p className="mt-1 text-sm text-slate-600">We reply within 1–2 business days.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Help Center</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">Self-serve answers</p>
              <p className="mt-1 text-sm text-slate-600">Browse FAQs and tool usage guidance anytime.</p>
              <Link href="/help" className="mt-2 inline-flex text-sm font-semibold text-sky-700 hover:underline">
                Visit Help Center →
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg">
            <p className="text-xs uppercase tracking-[0.35em] text-sky-200">Need faster answers?</p>
            <p className="mt-2 text-sm text-slate-200">
              Share the tool name, file type, and any error messages so we can help quickly.
            </p>
            <Link
              href="/help"
              className="mt-4 inline-flex rounded-full bg-sky-200 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-100"
            >
              Visit Help Center
            </Link>
          </div>
        </div>

        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}
