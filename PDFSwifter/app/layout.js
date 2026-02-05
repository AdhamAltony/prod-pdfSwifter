import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/shared/ui/Navbar";

const adsenseClient =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-6225595378099419";
export const metadata = {
  title: "pdfSwifter",
  description: "Free PDF toolkit for fast conversions, compression, and downloads.",
  icons: {
    icon: "/favicone.png",
    shortcut: "/favicone.png",
    apple: "/favicone.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {adsenseClient && (
          <Script
            id="google-adsense"
            async
            strategy="beforeInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        )}
        <Navbar />
        {children}
      </body>
    </html>
  );
}
