"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const Hero = ({ query, setQuery }) => {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.15),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.2),_transparent_50%)]"
      />
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-20 relative">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Free, unlimited PDF tools
            </div>
            <h1 className="mt-5 text-4xl md:text-6xl font-[var(--font-display)] tracking-tight text-slate-900">
              Work with PDFs like a pro, minus the wait.
            </h1>
            <p className="mt-4 text-base md:text-lg text-[color:var(--muted)] max-w-xl">
              Fast conversions, instant video downloads, and a clean workflow that
              keeps you moving. Search once, get the best tools first.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#tools"
                className="inline-flex items-center rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
              >
                Explore tools
              </Link>
              <Link
                href="#tools"
                className="inline-flex items-center rounded-full border border-teal-200 bg-white px-5 py-2 text-sm font-semibold text-teal-700 hover:border-teal-300 hover:text-teal-800"
              >
                Free essentials
              </Link>
              <Link
                href="/utilities"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900"
              >
                Browse all tools
              </Link>
            </div>

            <div className="mt-6">
              <div className="relative max-w-xl">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tools (e.g., compress, rotate, download)"
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 pl-10 pr-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/utilities/pdf-to-jpg"
                  className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:border-amber-300 hover:bg-amber-100"
                >
                  PDF to JPG
                </Link>
                <Link
                  href="/utilities/instagram-download"
                  className="inline-flex items-center rounded-full border border-pink-200 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-1 text-xs font-semibold text-pink-700 hover:border-pink-300 hover:from-purple-100 hover:to-pink-100"
                >
                  Instagram Download
                </Link>
                <Link
                  href="/utilities/tiktok-download"
                  className="inline-flex items-center rounded-full border border-[#25F4EE] bg-black px-3 py-1 text-xs font-semibold text-white shadow-[0_0_0_1px_rgba(254,44,85,0.35)] hover:border-[#FE2C55]"
                >
                  TikTok Download
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
            className="relative"
          >
            <div
              aria-hidden
              className="absolute -top-10 right-4 h-32 w-32 rounded-full bg-amber-200/40 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-8 left-8 h-32 w-32 rounded-full bg-teal-200/40 blur-2xl"
            />
            <div className="relative rounded-3xl border border-amber-200 bg-white/80 p-6 md:p-8 shadow-xl backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
                Featured lane
              </p>
              <h3 className="mt-3 text-2xl md:text-3xl font-[var(--font-display)] text-slate-900">
                Instagram + TikTok downloads
              </h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Download in seconds with crisp quality and no watermark fuss.
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/utilities/instagram-download"
                  className="rounded-2xl border border-pink-200 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 text-sm font-semibold text-pink-700 hover:border-pink-300 hover:from-purple-100 hover:to-pink-100"
                >
                  Instagram Download
                </Link>
                <Link
                  href="/utilities/tiktok-download"
                  className="rounded-2xl border border-[#25F4EE] bg-black px-4 py-3 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(254,44,85,0.35)] hover:border-[#FE2C55]"
                >
                  TikTok Download
                </Link>
              </div>

              <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
                  Also popular
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    PDF to JPG
                  </span>
                    <Link
                      href="/utilities/pdf-to-jpg"
                    className="text-xs font-semibold text-amber-700 hover:text-amber-800"
                  >
                    Open
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
