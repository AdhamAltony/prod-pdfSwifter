"use client";
import React from 'react';

// Progress bar component for file upload and conversion states
// Props:
// - state: 'idle' | 'uploading' | 'converting' | 'complete' | 'error'
// - progress: number (0-100) for upload progress
// - fileName?: string to display current file name
// - message?: custom status message
export default function ProgressBar({ state = 'idle', progress = 0, fileName, message }) {
  const getStateInfo = () => {
    switch (state) {
      case 'uploading':
        return {
          label: 'Uploading',
          color: 'bg-blue-500',
          bgColor: 'bg-blue-100',
          icon: '📤',
          showProgress: true
        };
      case 'converting':
        return {
          label: 'Converting',
          color: 'bg-green-500',
          bgColor: 'bg-green-100',
          icon: '⚙️',
          showProgress: false // Indeterminate for conversion
        };
      case 'complete':
        return {
          label: 'Complete',
          color: 'bg-green-600',
          bgColor: 'bg-green-100',
          icon: '✅',
          showProgress: true
        };
      case 'error':
        return {
          label: 'Error',
          color: 'bg-red-500',
          bgColor: 'bg-red-100',
          icon: '❌',
          showProgress: false
        };
      default:
        return null;
    }
  };

  const stateInfo = getStateInfo();

  if (!stateInfo || state === 'idle') {
    return (
      <div className="text-red-500 text-sm">
        Debug: ProgressBar called with state {state} but no stateInfo found
      </div>
    );
  }

  const displayProgress = stateInfo.showProgress ? progress : 100;
  const isIndeterminate = state === 'converting';

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Status header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{stateInfo.icon}</span>
          <span className="font-medium text-gray-700">{stateInfo.label}</span>
        </div>
        {stateInfo.showProgress && (
          <span className="text-sm font-medium text-gray-600">
            {Math.round(displayProgress)}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className={`w-full h-3 rounded-full ${stateInfo.bgColor} overflow-hidden`}>
        <div
          className={`h-full transition-all duration-300 ease-out ${stateInfo.color} ${
            isIndeterminate ? 'animate-pulse' : ''
          }`}
          style={{
            width: isIndeterminate ? '100%' : `${displayProgress}%`,
            animation: isIndeterminate ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : undefined
          }}
        />
      </div>

      {/* Status message */}
      <div className="mt-2 text-sm text-gray-600">
        {message ? (
          <span>{message}</span>
        ) : fileName ? (
          <span>
            {state === 'uploading' && 'Uploading '}
            {state === 'converting' && 'Converting '}
            <span className="font-medium">{fileName}</span>
          </span>
        ) : (
          <span>
            {state === 'uploading' && 'Uploading your file...'}
            {state === 'converting' && 'Processing your file...'}
            {state === 'complete' && 'Ready for download!'}
            {state === 'error' && 'Something went wrong. Please try again.'}
          </span>
        )}
      </div>
    </div>
  );
}
