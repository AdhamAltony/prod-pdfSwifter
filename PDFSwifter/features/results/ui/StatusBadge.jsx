import React from 'react';

// StatusBadge: small pill showing success or error state
// Props:
// - status: 'success' | 'error'
// - label?: optional custom text, defaults to Success / Failed
export default function StatusBadge({ status = 'success', label }) {
  const isSuccess = status === 'success';
  const bg = isSuccess ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300';
  const text = label || (isSuccess ? 'Success' : 'Failed');
  const icon = isSuccess ? (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd"/></svg>
  ) : (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
  );
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${bg}`}> {icon}{text}</span>
  );
}
