import Link from "next/link";
import Footer from "@/shared/ui/Footer";

export const metadata = {
  title: "Page Not Found | pdfSwifter",
  description: "The page you're looking for doesn't exist or has been moved.",
};

export default function NotFound() {
  return (
    <div
      className="min-h-screen bg-[color:var(--page-bg)] text-[color:var(--ink)] font-[var(--font-body)] flex flex-col"
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
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <span className="text-8xl font-extrabold text-teal-600 font-[var(--font-display)]">
              404
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-4 font-[var(--font-display)]">
            Page not found
          </h1>

          <p className="text-slate-600 mb-8 text-lg">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
            >
              Go home
            </Link>
            <Link
              href="/utilities"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Browse tools
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
