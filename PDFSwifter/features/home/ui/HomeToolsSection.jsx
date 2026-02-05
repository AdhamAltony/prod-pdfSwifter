"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ToolList from "@/features/utilities/constants/tools";
import ToolCard from "@/features/utilities/ui/ToolCard";

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HomeToolsSection({ query = "", allowedToolKeys }) {
  const allowedSet = useMemo(
    () => (allowedToolKeys ? new Set(allowedToolKeys) : null),
    [allowedToolKeys]
  );
  const visibleTools = useMemo(
    () => ToolList.filter((tool) => !allowedSet || allowedSet.has(tool.key)),
    [allowedSet]
  );

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visibleTools;
    return visibleTools.filter((t) => {
      const haystack = `${t.title} ${t.description} ${t.href}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, visibleTools]);

  const featuredTools = useMemo(
    () => filteredTools.filter((tool) => tool.featured),
    [filteredTools]
  );
  const standardTools = useMemo(
    () => filteredTools.filter((tool) => !tool.featured),
    [filteredTools]
  );

  const hasQuery = query.trim().length > 0;
  const noResults = hasQuery && filteredTools.length === 0;

  return (
    <>
      <section id="tools" className="relative py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_55%)]"
        />
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 relative">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">
                All tools, unlimited
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-[var(--font-display)] text-slate-900">
                Every workflow is free to run as often as you need.
              </h2>
              <p className="mt-2 text-sm md:text-base text-[color:var(--muted)] max-w-2xl">
                {hasQuery
                  ? "Matches based on your search."
                  : "Pick a tool, upload once, and keep moving."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">
                {filteredTools.length}{" "}
                {filteredTools.length === 1 ? "tool" : "tools"}
              </span>
              <Link
                href="/utilities"
                className="inline-flex items-center rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700 hover:border-teal-300 hover:text-teal-800"
              >
                Browse all tools
              </Link>
            </div>
          </div>

          {featuredTools.length > 0 && (
            <motion.div
              variants={listVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {featuredTools.map((tool) => (
                <motion.div key={tool.title} variants={itemVariants}>
                  <ToolCard
                    icon={tool.icon}
                    title={tool.title}
                    description={tool.description}
                    href={tool.href}
                    color={tool.color}
                    tier={tool.tier}
                    featured={tool.featured}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {standardTools.length > 0 && (
            <motion.div
              variants={listVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {standardTools.map((tool) => (
                <motion.div key={tool.title} variants={itemVariants}>
                  <ToolCard
                    icon={tool.icon}
                    title={tool.title}
                    description={tool.description}
                    href={tool.href}
                    color={tool.color}
                    tier={tool.tier}
                    featured={tool.featured}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {noResults && (
        <section className="pb-10">
          <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-16">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              No tools match “{query}”. Try a different search.
            </div>
          </div>
        </section>
      )}
    </>
  );
}
