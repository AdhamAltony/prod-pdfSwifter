"use client";

import React, { useMemo, useState } from "react";
import ToolList from "@/features/utilities/constants/tools";
import ToolCard from "@/features/utilities/ui/ToolCard";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import GoogleAd from "@/shared/ui/GoogleAd";

const TOOLS_LIST_AD_SLOT =
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOLS_LIST ??
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL_PAGE;

const MAIN_TOOLS = new Set( [
    "Compress PDF",
    "PDF to Word",
    "PDF to Excel",
    "PDF to JPG",
    "Download TikTok Video",
    "Download Instagram Video"
] );
const SECONDARY_TOOLS = new Set( [
    "Rotate PDF",
] );
const ADVANCED_TOOLS = new Set( [] );

const enrichTool = ( tool ) => {
    if ( MAIN_TOOLS.has( tool.title ) ) return { ...tool, category: "Main", tier: tool.tier || "freemium" };
    if ( SECONDARY_TOOLS.has( tool.title ) ) return { ...tool, category: "Secondary", tier: tool.tier || "freemium" };
    if ( ADVANCED_TOOLS.has( tool.title ) ) return { ...tool, category: "Advanced", tier: tool.tier || "freemium" };
    return { ...tool, category: "Other", tier: tool.tier || "freemium" };
};

export default function ToolsPageView ( { allowedToolKeys } ) {
    const [ query, setQuery ] = useState( "" );
    const [ category, setCategory ] = useState( "all" );
    const [ tier, setTier ] = useState( "all" );
    const allowedSet = useMemo(
        () => ( allowedToolKeys ? new Set( allowedToolKeys ) : null ),
        [ allowedToolKeys ]
    );
    const tools = useMemo(
        () => ToolList.filter( ( tool ) => !allowedSet || allowedSet.has( tool.key ) ).map( enrichTool ),
        [ allowedSet ]
    );

    const filtered = useMemo( () => {
        const q = query.trim().toLowerCase();
        return tools.filter( ( t ) => {
            if ( tier !== "all" && t.tier !== tier ) return false;
            if ( category !== "all" && t.category.toLowerCase() !== category ) return false;
            if ( !q ) return true;
            return ( `${ t.title } ${ t.description }` ).toLowerCase().includes( q );
        } );
    }, [ tools, query, category, tier ] );

    const featuredTools = useMemo(
        () => filtered.filter( ( tool ) => tool.featured ),
        [ filtered ]
    );

    const regularTools = useMemo(
        () => filtered.filter( ( tool ) => !tool.featured ),
        [ filtered ]
    );

    const groupedTools = useMemo( () => {
        const groups = {
            freemium: {},
        };

        for ( const tool of regularTools ) {
            const tierKey = tool.tier || "freemium";
            const categoryKey = tool.category || "Other";
            if ( !groups[ tierKey ][ categoryKey ] ) groups[ tierKey ][ categoryKey ] = [];
            groups[ tierKey ][ categoryKey ].push( tool );
        }

        for ( const tierKey of Object.keys( groups ) ) {
            for ( const categoryKey of Object.keys( groups[ tierKey ] ) ) {
                groups[ tierKey ][ categoryKey ].sort( ( a, b ) => a.title.localeCompare( b.title ) );
            }
        }

        return groups;
    }, [ regularTools ] );

    const categoryOrder = [ "Main", "Secondary", "Advanced", "Other" ];
    const tierOrder = [ "freemium" ];

    const counts = useMemo( () => {
        return tools.reduce(
            ( acc, t ) => {
                acc.total++;
                acc[ t.category ] = ( acc[ t.category ] || 0 ) + 1;
                return acc;
            },
            { total: 0 }
        );
    }, [ tools ] );

    const tierCounts = useMemo( () => {
        return tools.reduce(
            ( acc, t ) => {
                acc.total++;
                const key = t.tier || "freemium";
                acc[ key ] = ( acc[ key ] || 0 ) + 1;
                return acc;
            },
            { total: 0 }
        );
    }, [ tools ] );

    const tierChips = [
        { id: "all", label: `All (${ tierCounts.total || 0 })` },
        { id: "freemium", label: `Free (${ tierCounts.freemium || 0 })` },
    ];

    const heroStats = [
        { label: "Total tools", value: counts.total || 0 },
        { label: "Unlimited usage", value: "Yes" },
        { label: "Price", value: "$0" },
    ];

    const chips = [
        { id: "all", label: `All (${ counts.total || 0 })`, count: counts.total || 0 },
        { id: "main", label: `Main (${ counts.Main || 0 })`, count: counts.Main || 0 },
        { id: "secondary", label: `Secondary (${ counts.Secondary || 0 })`, count: counts.Secondary || 0 },
        { id: "advanced", label: `Advanced (${ counts.Advanced || 0 })`, count: counts.Advanced || 0 },
        { id: "other", label: `Other (${ counts.Other || 0 })`, count: counts.Other || 0 },
    ].filter( ( chip ) => chip.id === "all" || chip.count > 0 )
        .map( ( chip ) => ( { id: chip.id, label: chip.label } ) );

    const renderToolCard = ( tool ) => {
        const { key: toolKey, ...toolProps } = tool;
        return <ToolCard key={ toolKey || tool.title } { ...toolProps } />;
    };

    return (
        <div
            className="min-h-screen bg-[#f7f4ed] text-slate-900 font-[var(--font-body)]"
            style={{
                "--font-display": '"Space Grotesk", "Trebuchet MS", sans-serif',
                "--font-body": '"DM Sans", "Trebuchet MS", sans-serif',
            }}
        >
            <style>{`
                @keyframes toolFloat {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <header className="relative overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 10% 10%, rgba(13,148,136,0.18), transparent 50%), radial-gradient(circle at 90% 20%, rgba(245,158,11,0.2), transparent 55%), linear-gradient(120deg, #f6f2ea 0%, #eef5f3 45%, #f7efe4 100%)",
                    }}
                />
                <div className="absolute -top-20 right-0 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl" />
                <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />
                <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:py-20">
                    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                        <div style={{ animation: "toolFloat 0.8s ease-out both" }}>
                            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.35em] text-emerald-900">
                                Tool library
                            </span>
                            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl font-[var(--font-display)]">
                                Build your PDF workflow with the tools that stay reliable.
                            </h1>
                            <p className="mt-4 max-w-xl text-base text-slate-700 md:text-lg">
                                Filter by tier, focus on the high-demand utilities, and jump into each task with confidence.
                                Every tool is reviewed for speed, quality, and success rate.
                            </p>
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {heroStats.map( ( stat ) => (
                                    <div key={ stat.label } className="min-w-0 rounded-2xl bg-white/80 p-4 shadow-sm text-center">
                                        <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
                                        <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] leading-snug break-words text-slate-500">
                                            {stat.label}
                                        </p>
                                    </div>
                                ) )}
                            </div>
                        </div>

                        <div
                            className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
                            style={{ animation: "toolFloat 0.8s ease-out both", animationDelay: "120ms" }}
                        >
                            <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">How it works</p>
                            <h2 className="mt-4 text-2xl font-semibold text-slate-900 font-[var(--font-display)]">
                                Pick a tool, run it, keep moving.
                            </h2>
                            <div className="mt-5 space-y-4 text-sm text-slate-600">
                                <p>Every card links to a focused workflow that highlights input requirements and output checks.</p>
                                <p>All tools are free with unlimited usage.</p>
                                <p>Need help? Each tool has built-in guidance and quick links back to support.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="relative z-20 mx-auto -mt-12 max-w-6xl px-6">
                <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                { tierChips.map( ( c ) => (
                                    <button
                                        key={ c.id }
                                        onClick={ () => setTier( c.id ) }
                                        className={ `px-4 py-1.5 rounded-full text-sm font-semibold border transition ${ tier === c.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300' }` }
                                    >
                                        { c.label }
                                    </button>
                                ) ) }
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                { chips.map( ( c ) => (
                                    <button
                                        key={ c.id }
                                        onClick={ () => setCategory( c.id ) }
                                        className={ `px-4 py-1.5 rounded-full text-sm font-semibold border transition ${ category === c.id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300' }` }
                                    >
                                        { c.label }
                                    </button>
                                ) ) }
                            </div>
                        </div>

                        <div className="relative w-full lg:w-80">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                value={ query }
                                onChange={ ( e ) => setQuery( e.target.value ) }
                                placeholder="Search tools..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {TOOLS_LIST_AD_SLOT && (
                <div className="max-w-4xl mx-auto px-6 md:px-10 py-10">
                    <GoogleAd slot={TOOLS_LIST_AD_SLOT} style={{ minHeight: 90 }} />
                </div>
            )}

            <main className="max-w-6xl mx-auto px-6 md:px-10 py-12">
                {featuredTools.length > 0 && (
                    <section className="mb-14 rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-6 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Featured picks</p>
                                <h2 className="text-xl font-bold text-slate-900 font-[var(--font-display)]">
                                    Spotlight workflows
                                </h2>
                            </div>
                            <p className="text-sm text-slate-500">{featuredTools.length} highlighted</p>
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {featuredTools.map( renderToolCard )}
                        </div>
                    </section>
                )}

                {tierOrder.map( ( tierKey ) => {
                    const tierLabel = "Free tools";
                    const categories = categoryOrder.filter(
                        ( categoryName ) => groupedTools[ tierKey ]?.[ categoryName ]?.length
                    );

                    if ( categories.length === 0 ) return null;

                    return (
                        <section key={ tierKey } className="mb-12">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h2 className="text-xl font-bold text-slate-900 font-[var(--font-display)]">{tierLabel}</h2>
                                <p className="text-sm text-slate-500">
                                    {categories.reduce( ( total, cat ) => total + groupedTools[ tierKey ][ cat ].length, 0 )} tools
                                </p>
                            </div>

                            {categories.map( ( categoryName ) => (
                                <div key={ categoryName } className="mt-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                                            {categoryName}
                                        </h3>
                                        <span className="text-xs text-slate-400">
                                            {groupedTools[ tierKey ][ categoryName ].length}
                                        </span>
                                    </div>
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {groupedTools[ tierKey ][ categoryName ].map( renderToolCard )}
                                    </div>
                                </div>
                            ) )}
                        </section>
                );
                } )}

                {filtered.length === 0 && (
                    <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-slate-500">
                        No tools match your search. Try a different filter.
                    </div>
                )}
            </main>
        </div>
    );
}
