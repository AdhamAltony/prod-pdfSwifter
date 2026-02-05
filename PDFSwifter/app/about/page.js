import React from "react";
import Link from "next/link";
import Footer from "@/shared/ui/Footer";

export default function About() {
  const team = [
    {
      name: "Adham Ahmed",
      role: "Founder & Engineer",
      bio: "Building tiny utilities that remove friction for people who work with PDFs every day.",
      twitter: "https://twitter.com",
    },
    {
      name: "Lina Hassan",
      role: "Product Designer",
      bio: "Designs focused interfaces and guides the visual language of pdfSwifter.",
      twitter: "https://twitter.com",
    },
    {
      name: "Sam Ortiz",
      role: "Frontend Engineer",
      bio: "Turns flows into responsive, accessible UI with reliable performance.",
      twitter: "https://twitter.com",
    },
  ];

  const stats = [
    { label: "Tools shipped", value: "14" },
    { label: "Avg success rate", value: "98.7%" },
    { label: "Teams served", value: "320+" },
  ];

  const principles = [
    {
      title: "Single-purpose focus",
      description: "Each tool does one job quickly so teams can chain workflows without confusion.",
    },
    {
      title: "Reliability gate",
      description: "Tools stay live only when they meet success-rate requirements under real traffic.",
    },
    {
      title: "Privacy-first processing",
      description: "We minimize storage and keep documents in transient storage windows.",
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#f5f1e8] text-slate-900 font-[var(--font-body)]"
      style={{
        "--font-display": '"Libre Baskerville", "Georgia", serif',
        "--font-body": '"Manrope", "Trebuchet MS", sans-serif',
      }}
    >
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fbf7ef] via-[#f5f1e8] to-[#edf2e3]" />
        <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-amber-200/70 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.35em] text-amber-800">
                About pdfSwifter
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl font-[var(--font-display)]">
                Focused utilities for the way teams really work.
              </h1>
              <p className="mt-4 max-w-xl text-base text-slate-700 md:text-lg">
                We build small, reliable PDF workflows so you can move faster without heavyweight suites. Every tool
                solves a single job with clarity, speed, and trust.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-white/90 p-4 shadow-sm">
                    <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Our promise</p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900 font-[var(--font-display)]">
                Keep workflows calm, not chaotic.
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                pdfSwifter is designed for clarity. You get fast conversions, trustworthy outputs, and a roadmap driven
                by the workflows people run every week.
              </p>
              <div className="mt-6 space-y-3 text-sm text-slate-700">
                {[
                  "Predictable output under real workloads.",
                  "Quick onboarding for new team members.",
                  "Free access for every workflow, every time.",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-16 space-y-16">
        <section className="grid gap-8 lg:grid-cols-3">
          {principles.map((principle) => (
            <div key={principle.title} className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Principle</p>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">{principle.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{principle.description}</p>
            </div>
          ))}
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">The team</p>
              <h2 className="mt-3 text-3xl font-semibold font-[var(--font-display)] text-slate-900">
                People behind the tools.
              </h2>
            </div>
            <Link href="/contact" className="text-sm font-semibold text-slate-900 underline">
              Work with us
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {team.map((member) => (
              <div key={member.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-semibold">
                    {member.name.split(" ")[0][0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{member.name}</p>
                    <p className="text-sm text-slate-500">{member.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600">{member.bio}</p>
                <div className="mt-4">
                  <Link href={member.twitter} className="text-sm font-semibold text-emerald-700 hover:underline">
                    Follow
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-br from-amber-200 via-amber-100 to-emerald-100 px-8 py-10 shadow-lg">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-700">Join the mission</p>
            <h3 className="mt-4 text-3xl font-semibold font-[var(--font-display)] text-slate-900">
              Help shape what we build next.
            </h3>
            <p className="mt-3 text-sm text-slate-700">
              Share feedback, request a workflow review, or tell us what tool would save your team the most time.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/utilities"
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Explore tools
              </Link>
              <a
                href="mailto:hello@example.com"
                className="rounded-full border border-slate-900/30 px-5 py-2 text-sm font-semibold text-slate-900 hover:border-slate-900/60"
              >
                Contact us
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
