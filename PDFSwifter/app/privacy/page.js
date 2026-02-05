import React from 'react';
import ContentPage from '@/features/content/ui/ContentPage';

export const metadata = {
  title: 'Privacy Policy | pdfSwifter',
  description: 'How pdfSwifter collects, uses, and protects your data.',
};

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      intro="We design our tools to minimize data collection and respect your privacy."
    >
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Principle</p>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">Minimal collection</h3>
          <p className="mt-2 text-sm text-slate-600">
            We only collect what is needed to run the tools, keep them reliable, and support your account.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Principle</p>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">Short retention</h3>
          <p className="mt-2 text-sm text-slate-600">
            Files are processed temporarily and removed shortly after your download is ready.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Principle</p>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">No data resale</h3>
          <p className="mt-2 text-sm text-slate-600">
            We never sell personal data. We only share data with trusted vendors needed for core operations.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2>Information we collect</h2>
        <p>
          We aim to process files in-memory when possible. When a tool needs temporary storage to provide a
          download link, we store it securely and remove it after a short period.
        </p>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Typical data points</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
            <li>• File metadata (name, size, type)</li>
            <li>• Processing timestamps</li>
            <li>• Tool usage statistics</li>
            <li>• Error logs (anonymized)</li>
            <li>• Account email for support (if provided)</li>
            <li>• Payment confirmation status (via provider)</li>
          </ul>
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Usage analytics</h3>
          <p className="mt-2 text-sm text-slate-600">
            We record anonymized usage metrics (tool name, timestamp, status) to improve reliability and capacity
            planning. Signed-in actions may be associated with your account to provide history or support.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Payments</h3>
          <p className="mt-2 text-sm text-slate-600">
            Payments are handled by third-party providers. We never store full payment details on our servers.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2>Retention and deletion</h2>
        <p>
          Files are removed after processing within a short retention window. Logs and aggregated metrics are
          kept only as long as needed to maintain service reliability.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Temporary storage</h3>
            <p className="mt-2 text-sm text-slate-600">
              Files are stored only long enough for processing and download delivery.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Your choices</h3>
            <p className="mt-2 text-sm text-slate-600">
              You can request deletion or account changes by contacting support at any time.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2>Contact</h2>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <p className="text-emerald-900">
            Questions about privacy? Email us at{" "}
            <a href="mailto:hello@example.com" className="font-semibold underline">
              hello@example.com
            </a>
            . We typically respond within 24 hours.
          </p>
        </div>
      </section>
    </ContentPage>
  );
}
