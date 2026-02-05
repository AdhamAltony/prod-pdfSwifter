"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import reviews from "@/features/home/data/reviews";

export default function ClientReview({ autoplay = true, interval = 4000 }) {
  const slides = reviews;
  const containerRef = useRef(null);
  const autoplayRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);
  const [activeDot, setActiveDot] = useState(0);

  // responsive visibleCount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setVisibleCount(mq.matches ? 2 : 1);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const clones = visibleCount;
  const extended = React.useMemo(() => {
    if (!slides || slides.length === 0) return [];
    const head = slides.slice(-clones);
    const tail = slides.slice(0, clones);
    return [...head, ...slides, ...tail];
  }, [slides, clones]);

  // compute card width (reads CSS var set by ResizeObserver)
  const cardWidth = useCallback(() => {
    const el = containerRef.current;
    if (!el) return 0;
    const val = parseFloat(getComputedStyle(el).getPropertyValue("--card-width"));
    if (!isNaN(val) && val > 0) return val;
    return el.clientWidth / visibleCount;
  }, [visibleCount]);

  // set exact card width and inner width so snapping math is exact
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const inner = el.querySelector(":scope > div");
    if (!inner) return;

    const update = () => {
      const style = getComputedStyle(inner);
      const gap = parseFloat(style.getPropertyValue("gap")) || parseFloat(style.getPropertyValue("column-gap")) || parseFloat(style.columnGap) || 0;
      const cw = Math.floor(Math.max(0, (el.clientWidth - gap * (visibleCount - 1)) / visibleCount));
      el.style.setProperty("--card-width", `${cw}px`);
      const totalGaps = gap * (extended.length - 1);
      inner.style.width = `${extended.length * cw + totalGaps}px`;
      // position to first real slide
      el.scrollLeft = cw * clones;
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [visibleCount, clones, extended.length]);

  // inject hide-scrollbar CSS once and keep it scoped to the component class
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = "client-review-scroll-style";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      .client-review-scroll.hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      .client-review-scroll.hide-scrollbar::-webkit-scrollbar { display: none; height: 0; }
    `;
    document.head.appendChild(style);
  }, []);

  // scroll by one card and wrap using clones
  const scrollByOne = useCallback((behavior = "smooth") => {
    const el = containerRef.current;
    if (!el) return;
    const cw = cardWidth();
    if (!cw) return;
    el.scrollBy({ left: cw, behavior });

    // after smooth scroll finishes, fix if we're in clone area
    setTimeout(() => {
      const idx = Math.round(el.scrollLeft / cw);
      const n = slides.length;
      if (!n) return;
      if (idx >= n + clones) {
        const newIdx = idx - n;
        el.scrollTo({ left: newIdx * cw, behavior: "auto" });
      } else if (idx < clones) {
        const newIdx = idx + n;
        el.scrollTo({ left: newIdx * cw, behavior: "auto" });
      }
      const nextActive = ((Math.round(el.scrollLeft / cw) - clones) % n + n) % n;
      setActiveDot(nextActive);
    }, 520);
  }, [cardWidth, clones, slides.length]);

  useEffect(() => {
    if (!autoplay) return;
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      if (!paused) scrollByOne("smooth");
    }, interval);
    return () => clearInterval(autoplayRef.current);
  }, [autoplay, interval, paused, scrollByOne]);

  const goTo = useCallback((i) => {
    const el = containerRef.current;
    if (!el) return;
    const cw = cardWidth();
    if (!cw) return;
    el.scrollTo({ left: (i + clones) * cw, behavior: "smooth" });
  }, [cardWidth, clones]);

  const updateActiveIndex = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const cw = cardWidth() || 1;
    const idx = Math.round(el.scrollLeft / cw) - clones;
    const n = slides.length || 1;
    const nextActive = ((idx % n) + n) % n;
    setActiveDot(nextActive);
  }, [cardWidth, clones, slides.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => updateActiveIndex();
    el.addEventListener("scroll", onScroll, { passive: true });
    updateActiveIndex();
    return () => el.removeEventListener("scroll", onScroll);
  }, [updateActiveIndex]);

  return (
    <section className="py-20 bg-[linear-gradient(180deg,#ffffff,rgba(15,23,42,0.04))]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-[var(--font-display)] text-slate-900">
            What clients say
          </h2>
          <p className="mt-2 text-base text-[color:var(--muted)]">
            Real feedback from users who rely on these tools every day.
          </p>
        </div>

        <div
          className="mt-8 relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div
            ref={containerRef}
            className={`client-review-scroll`}
            style={{
              overflowX: !paused && autoplay ? "hidden" : "auto",
              overflowY: "hidden",
              scrollBehavior: "smooth",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              msOverflowStyle: "none",
            }}
          >
            <div className="flex gap-8 items-stretch">
              {extended.map((r, idx) => (
                <div
                  key={`${r.id}-${idx}`}
                  className="shrink-0"
                  style={{ width: "var(--card-width)", scrollSnapAlign: "start" }}
                >
                  <blockquote className="relative rounded-xl border border-gray-100 p-8 md:p-10 bg-linear-to-b from-white to-gray-50 shadow-sm min-h-64 md:min-h-80 flex flex-col justify-between">
                    <svg className="h-7 w-7 text-teal-400 absolute -top-3 left-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                      <path d="M7.667 6.5C6.12 6.5 5 7.656 5 9.25v.5C5 11.414 6.448 12.5 8.083 12.5c.846 0 1.5-.577 1.5-1.5v-3c0-.846-.654-1.5-1.5-1.5zM14.5 6.5c-1.547 0-2.667 1.156-2.667 2.75v.5c0 1.664 1.448 2.75 3.083 2.75.846 0 1.5-.577 1.5-1.5v-3c0-.846-.654-1.5-1.5-1.5z" />
                    </svg>

                    <p className="text-base md:text-lg text-gray-700 mt-2">“{r.text}”</p>

                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.role}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</p>
                        <div className="mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} className={`inline h-4 w-4 ${i < r.rating ? "text-amber-400" : "text-gray-200"}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.382 2.455a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.382 2.455c-.784.57-1.84-.197-1.54-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.619 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69L9.05 2.927z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  </blockquote>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            {slides.map((_, i) => {
              const active = activeDot === i;
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to review ${i + 1}`}
                  aria-current={active || undefined}
                  className={`h-3 w-3 rounded-full transition-all duration-200 ${active ? 'bg-teal-600 scale-110' : 'bg-gray-300 hover:bg-gray-400'}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
