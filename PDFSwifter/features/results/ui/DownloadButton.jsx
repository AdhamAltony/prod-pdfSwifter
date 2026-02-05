"use client";
import React, { useMemo } from 'react';

// DownloadButton: renders a button/link to download the converted file.
// Props:
// - filename: string (required for naming the file)
// - downloadUrl?: a server URL (preferred). If provided we render a simple anchor.
// - base64Data?: base64 string of file (without data URI prefix). Fallback when no URL.
// - contentType?: defaults to application/pdf.
// - auto?: if true and we have URL or data, trigger automatic download on mount.
export default function DownloadButton({ filename = 'converted.pdf', downloadUrl, base64Data, contentType = 'application/pdf', auto = false }) {
  const dataHref = useMemo(() => {
    if (downloadUrl) return null;
    if (!base64Data) return null;
    return `data:${contentType};base64,${base64Data}`;
  }, [downloadUrl, base64Data, contentType]);

  // Optionally auto-download via a hidden anchor
  React.useEffect(() => {
    if (auto && (downloadUrl || dataHref)) {
      const a = document.createElement('a');
      a.href = downloadUrl || dataHref;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 0);
    }
  }, [auto, downloadUrl, dataHref, filename]);

  if (!(downloadUrl || dataHref)) {
    return <p className="text-sm text-gray-500">No file available to download.</p>;
  }

  return (
    <a
      href={downloadUrl || dataHref}
      download={filename}
      className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
    >
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3 14a1 1 0 011-1h3v2H5v2h10v-2h-2v-2h3a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4z"/><path d="M9 2a1 1 0 00-1 1v7H5.5l4.5 5 4.5-5H12V3a1 1 0 00-1-1H9z"/></svg>
      Download {filename}
    </a>
  );
}
