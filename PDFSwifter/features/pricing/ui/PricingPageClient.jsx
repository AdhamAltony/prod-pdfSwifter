"use client";

import { useRouter } from "next/navigation";
import { plans } from "@/features/pricing/data/plans";

export default function PricingPageClient() {
  const router = useRouter();
  const hasSinglePlan = plans.length === 1;
  const fadeStyle = (delay = 0) => ({
    animation: "priceLift 0.8s ease-out both",
    animationDelay: `${delay}ms`,
  });

  const handleUpgrade = (plan) => {
    router.push(plan.ctaLink);
  };

  return (
    <div
      className="min-h-screen bg-[#f8f4ef] text-slate-900 font-[var(--font-body)]"
      style={{
        "--font-display": '"Fraunces", "Georgia", serif',
        "--font-body": '"Space Grotesk", "Trebuchet MS", sans-serif',
      }}
    >
      <style>{`
        @keyframes priceLift {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-teal-50" />
        <div className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-amber-300/40 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-teal-400/30 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div style={fadeStyle(0)}>
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.35em] text-amber-800">
                Pricing
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl font-[var(--font-display)]">
                All tools are free, forever.
              </h1>
              <p className="mt-4 max-w-xl text-base text-slate-700 md:text-lg">
                Run every tool as much as you want. No usage caps, no paywalls, and no surprise upgrades.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Unlimited runs across every tool.",
                  "All PDF and video downloads included.",
                  "Only high-reliability tools stay enabled.",
                  "No credit card required.",
                ].map((point) => (
                  <div key={point} className="rounded-2xl bg-white/80 p-4 text-sm text-slate-700 shadow-sm">
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
              style={fadeStyle(120)}
            >
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">What you get</p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900 font-[var(--font-display)]">
                Reliability-first PDF workflows.
              </h2>
              <p className="mt-3 text-sm text-slate-600">
                Secure processing, reliability checks, and unlimited usage are standard for everyone.
              </p>
              <div className="mt-6 space-y-3 text-sm text-slate-700">
                {[
                  "Instant access to core PDF transforms.",
                  "Unlimited usage with no paywalls.",
                  "Transparent tool reliability monitoring.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-16">
        <div className="grid md:grid-cols-1 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, idx) => {
            const isPopular = plan.popular;
            return (
              <div
                key={plan.name}
                className={`relative ${isPopular ? "rounded-3xl bg-gradient-to-br from-amber-300 via-amber-100 to-teal-200 p-[1px]" : "rounded-3xl border border-slate-200/70"}`}
                style={fadeStyle(180 + idx * 120)}
              >
                <div className={`h-full rounded-3xl bg-white p-8 shadow-lg ${isPopular ? "ring-1 ring-amber-200" : ""}`}>
                  {isPopular && (
                    <div className="absolute right-8 top-0 -translate-y-1/2">
                      <span className="inline-flex rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                        {hasSinglePlan ? "Free plan" : "Most popular"}
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{plan.name}</p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-900">{plan.description}</h3>
                    <div className="mt-6 flex items-end justify-center gap-2">
                      <span className="text-5xl font-extrabold text-slate-900">{plan.price}</span>
                      <span className="text-sm font-medium text-slate-500">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3 text-sm text-slate-700">
                        <svg
                          className={`h-5 w-5 shrink-0 ${isPopular ? "text-amber-500" : "text-teal-600"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <button
                      onClick={() => handleUpgrade(plan)}
                      className={`block w-full rounded-full px-6 py-3 text-center text-sm font-semibold transition-colors ${
                        isPopular
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
