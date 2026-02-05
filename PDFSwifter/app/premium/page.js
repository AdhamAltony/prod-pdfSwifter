import Link from "next/link";
import Footer from "@/shared/ui/Footer";
import { ALL_TOOLS } from "@/features/utilities/constants/tools";
import { getAllowedToolKeys } from "@/lib/utilities/tools-policy";

export const metadata = {
  title: "Free access | pdfSwifter",
  description: "All tools are free with unlimited usage.",
};

const highlights = [
  {
    title: "Unlimited usage",
    description: "Run every tool as often as you need. No caps, no metering.",
  },
  {
    title: "Full tool access",
    description: "Every PDF and video workflow is available to everyone.",
  },
  {
    title: "Reliability checks",
    description: "Tools stay enabled only when they meet quality thresholds.",
  },
  {
    title: "Future-ready",
    description: "Optional premium tiers can return later if you choose to add them.",
  },
];

const fadeStyle = (delay = 0) => ({
  animation: "freeFade 0.9s ease-out both",
  animationDelay: `${delay}ms`,
});

export default async function PremiumPage() {
  const allowedToolKeys = await getAllowedToolKeys();
  const allowedSet = new Set(allowedToolKeys || []);
  const availableToolCount = ALL_TOOLS.filter((tool) => allowedSet.has(tool.key)).length;

  return (
    <div
      className="min-h-screen bg-[#f6f4ef] text-slate-900 font-[var(--font-body)]"
      style={{
        "--font-display": '"Fraunces", "Georgia", serif',
        "--font-body": '"Space Grotesk", "Trebuchet MS", sans-serif',
      }}
    >
      <style>{`
        @keyframes freeFade {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-amber-400/40 blur-3xl" />
        <div className="absolute -bottom-20 left-8 h-72 w-72 rounded-full bg-teal-500/30 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-400 via-teal-400 to-slate-900" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:py-20">
          <div style={fadeStyle(0)}>
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.35em] text-amber-200">
              Free access
            </span>
            <h1
              className="mt-6 text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl font-[var(--font-display)]"
              style={fadeStyle(120)}
            >
              Every tool is free, for everyone.
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-200 md:text-lg" style={fadeStyle(180)}>
              We’ve removed all paywalls and limits. Build your workflow with every tool enabled and run them without
              restrictions.
            </p>

            <div className="mt-8 flex flex-wrap gap-4" style={fadeStyle(240)}>
              <Link
                href="/utilities"
                className="inline-flex items-center justify-center rounded-full bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
              >
                Browse tools
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
              >
                View free plan
              </Link>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3" style={fadeStyle(300)}>
              {[
                { label: "Available tools", value: String(availableToolCount) },
                { label: "Usage limits", value: "None" },
                { label: "Price", value: "$0" },
              ].map((metric) => (
                <div key={metric.label}>
                  <p className="text-3xl font-extrabold text-white">{metric.value}</p>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 lg:mt-0" style={fadeStyle(200)}>
            <div className="rounded-3xl bg-white p-6 text-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.45)]">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">What’s included</p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900 font-[var(--font-display)]">
                Unlimited, full-access workflows.
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Everyone gets the same capabilities today, with the option to introduce premium tiers later if needed.
              </p>
              <div className="mt-6 space-y-3 text-sm text-slate-700">
                {highlights.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-500" />
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
