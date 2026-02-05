import React from 'react';
import ContentPage from '@/features/content/ui/ContentPage';

export const metadata = {
  title: 'Security | pdfSwifter',
  description: 'Security practices and data handling at pdfSwifter.',
};

export default function SecurityPage() {
  return (
    <ContentPage
      title="Security"
      intro="We take a defense-in-depth approach to protect your data and our infrastructure."
    >
      <div className="bg-emerald-50 border-l-4 border-emerald-300 p-6 mb-8">
        <h3 className="text-lg font-semibold text-emerald-800 mb-2">Security First</h3>
        <p className="text-emerald-700">
          We implement industry-standard security practices to protect your data and our infrastructure.
        </p>
      </div>

      <h2>Data handling</h2>
      <p>
        Where possible, processing occurs in-memory. When temporary persistence is required to enable downloading,
        files are stored in a transient location and cleaned up automatically.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">🔒 Encryption</h3>
          <p className="text-slate-700">All data in transit is protected with TLS/HTTPS encryption.</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">⏱️ Temporary Storage</h3>
          <p className="text-slate-700">Files are automatically deleted within 30 minutes of processing.</p>
        </div>
      </div>

      <h2>Transport security</h2>
      <p>
        All traffic is served over HTTPS. Avoid sharing sensitive files over insecure networks.
      </p>

      <h2>Responsible disclosure</h2>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <p className="text-amber-900 mb-3">
          <strong>Found a security issue?</strong> We appreciate responsible disclosure.
        </p>
        <p className="text-amber-700">
          Please report vulnerabilities to <a href="mailto:security@example.com" className="font-semibold">security@example.com</a> 
          and we will investigate promptly. We aim to respond within 48 hours.
        </p>
      </div>
    </ContentPage>
  );
}
