"use client";

import React from 'react';

export default function UsageLimitModal({ open, onClose, title = 'Usage limit reached', message }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-600">
              {message ||
                "You have reached the current usage limit for this tool. Please try again later."}
            </p>
          </div>
          <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onClose} className="px-3 py-2 border rounded text-sm text-gray-700 hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}
