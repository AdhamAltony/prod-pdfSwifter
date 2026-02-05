"use client";

import { useEffect } from "react";

const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-6225595378099419";

/**
 * Lightweight wrapper around a Google AdSense responsive ad unit.
 * Renders nothing when the client ID or slot is not configured to keep dev builds clean.
 */
export default function GoogleAd({
  slot,
  format = "autorelaxed",
  layout,
  responsive = "true",
  className = "",
  style = {},
}) {
  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error", err);
    }
  }, [slot]);

  if (!ADSENSE_CLIENT || !slot) return null;

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
        {...(layout ? { "data-ad-layout": layout } : {})}
      />
    </div>
  );
}
