const Benefits = () => {

    return (
        <section className="relative py-12 md:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,_rgba(15,118,110,0.08),_transparent_60%)]"
        />
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                Why teams choose us
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-[var(--font-display)] text-slate-900">
                Built for speed, privacy, and clarity.
              </h2>
            </div>
            <p className="text-sm md:text-base text-[color:var(--muted)] max-w-md">
              A clean workflow with every tool free and unlimited whenever you need it.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur">
              <div aria-hidden className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-amber-100 blur-2xl" />
              <div className="text-2xl">🔒</div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">Private by design</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Runs in your browser where possible. Your files stay with you.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur">
              <div aria-hidden className="absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-teal-100 blur-2xl" />
              <div className="text-2xl">⚡️</div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">Fast and reliable</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Snappy tools for everyday PDF tasks with clean, simple workflows.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur">
              <div aria-hidden className="absolute -top-6 -left-6 h-16 w-16 rounded-full bg-rose-100 blur-2xl" />
              <div className="text-2xl">💸</div>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">Free essentials</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Use the most common tools at no cost. No watermark added!
              </p>
            </div>
          </div>
        </div>
      </section>
    )
}

export default Benefits
