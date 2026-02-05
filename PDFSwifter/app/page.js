import React from "react";
import Footer from "@/shared/ui/Footer";
import Benefits from "@/features/home/ui/Benefits";
import ClientReview from "@/features/home/ui/ClientReview";
import GoogleAd from "@/shared/ui/GoogleAd";
import HomePageClient from "@/features/home/ui/HomePageClient";
import { getAllowedToolKeys } from "@/lib/utilities/tools-policy";

const HERO_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP;
const MIDPAGE_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID;

export const metadata = {
  title: "pdfSwifter | Fast conversions and downloads",
  description:
    "Free PDF toolkit for conversions, compression, and video downloads. Find the right tool in seconds.",
};
export const dynamic = "force-dynamic";

export default async function Home() {
  const allowedToolKeys = await getAllowedToolKeys();
  return (
    <div
      className="min-h-screen bg-[color:var(--page-bg)] text-[color:var(--ink)] font-[var(--font-body)]"
      style={{
        "--page-bg": "#f8fafc",
        "--ink": "#0f172a",
        "--muted": "#475569",
        "--accent": "#f97316",
        "--accent-2": "#14b8a6",
        "--surface": "#ffffff",
        "--font-display": '"Fraunces", "Georgia", serif',
        "--font-body": '"Space Grotesk", "Trebuchet MS", sans-serif',
      }}
    >
      <HomePageClient allowedToolKeys={allowedToolKeys} />

      {HERO_AD_SLOT && (
        <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-16 py-6">
          <GoogleAd slot={HERO_AD_SLOT} style={{ minHeight: 90 }} />
        </div>
      )}
      <Benefits />
      {MIDPAGE_AD_SLOT && (
        <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-16 py-10">
          <GoogleAd slot={MIDPAGE_AD_SLOT} style={{ minHeight: 90 }} />
        </div>
      )}
      <ClientReview />
      <Footer />
    </div>
  );
}
