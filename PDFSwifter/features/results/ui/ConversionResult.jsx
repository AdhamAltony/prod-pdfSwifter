import React from 'react';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import DownloadButton from './DownloadButton';

// ConversionResult: presentational component to show conversion outcome
// Props:
// - status: 'success' | 'error'
// - title?: string
// - message?: string
// - filename?: string
// - downloadUrl?: string (preferred)
// - base64Data?: string (fallback when file is in-memory)
// - contentType?: string
// - extra?: optional React node (e.g., tips)
export default function ConversionResult({
  status = 'success',
  title,
  message,
  filename,
  downloadUrl,
  base64Data,
  contentType = 'application/pdf',
  extra,
}) {
  const isSuccess = status === 'success';
  const defaultTitle = isSuccess ? 'Conversion complete' : 'Conversion failed';
  const defaultMessage = isSuccess
    ? 'Your file is ready to download.'
    : 'Something went wrong while converting your file.';

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title || defaultTitle}</h1>
        <StatusBadge status={status} />
      </div>

      <p className={`mt-3 text-sm ${isSuccess ? 'text-gray-700' : 'text-red-700'}`}>{message || defaultMessage}</p>

      <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">Output file</p>
            <p className="text-base font-medium text-gray-900">{filename || 'converted.pdf'}</p>
          </div>
          {isSuccess ? (
            <DownloadButton
              filename={filename || 'converted.pdf'}
              downloadUrl={downloadUrl}
              base64Data={base64Data}
              contentType={contentType}
            />
          ) : (
            <div className="text-sm text-gray-500">No download available</div>
          )}
        </div>
      </div>

      {extra ? <div className="mt-6">{extra}</div> : null}

      <div className="mt-8">
        <Link href="/utilities" className="text-sm font-medium text-blue-600 hover:underline">Back to tools</Link>
      </div>
    </section>
  );
}
