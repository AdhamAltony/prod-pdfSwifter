import Footer from "@/shared/ui/Footer";

export default function AuthPageShell({
  eyebrow = "Account",
  title,
  subtitle,
  cardTitle,
  cardSubtitle,
  sideTitle = "Why create an account?",
  sidePoints = [],
  children,
}) {
  return (
    <div
      className="min-h-screen bg-[#f8f4ef] text-slate-900"
      style={{
        "--font-display": '"Fraunces", "Georgia", serif',
        "--font-body": '"Space Grotesk", "Trebuchet MS", sans-serif',
        fontFamily: "var(--font-body)",
      }}
    >
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-amber-50 via-white to-teal-50" />
        <div className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-amber-300/40 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-teal-400/30 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.35em] text-amber-800">
                {eyebrow}
              </span>
              <h1
                className="mt-6 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {title}
              </h1>
              {subtitle && (
                <p className="mt-4 max-w-xl text-base text-slate-700 md:text-lg">
                  {subtitle}
                </p>
              )}

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {sidePoints.map((point) => (
                  <div key={point} className="rounded-2xl bg-white/80 p-4 text-sm text-slate-700 shadow-sm">
                    {point}
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Security</p>
                <h2
                  className="mt-4 text-xl font-semibold text-slate-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {sideTitle}
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  We keep auth flows simple and transparent. You can delete your account or downgrade anytime.
                </p>
                <div className="mt-6 space-y-3 text-sm text-slate-700">
                  {["No hidden redirects or popups.", "Your data stays private.", "Tools are reliability-gated."].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
              {cardTitle && (
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{cardTitle}</p>
              )}
              <h2
                className="mt-4 text-2xl font-semibold text-slate-900"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {cardSubtitle}
              </h2>
              {children}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
