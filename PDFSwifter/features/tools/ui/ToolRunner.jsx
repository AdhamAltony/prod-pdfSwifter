"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import UsageLimitModal from "./UsageLimitModal";
import UsageBanner from "./UsageBanner";
// Uploads are handled by the server API at /api/utilities/[tool]

export default function ToolRunner({ tool }) {
  // Simple file uploader UI + preview for a tool.
  // - Builds FormData with files + tool + optional fields (angle/options)
  // - Posts to /api/utilities/<tool>/fileprocess
  // - Handles JSON responses or binary responses (downloads file)

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [angle, setAngle] = useState("90");
  const showAngleInput = tool === "rotate-pdf";
  const inputRef = useRef(null);
  const [usageStatus, setUsageStatus] = useState(null);
  const [usageLoading, setUsageLoading] = useState(true);

  // Convert FileList to array and reset message
  const handleFiles = (fileList) => {
    const arr = Array.from(fileList || []);
    setFiles(arr);
    setMessage("");
    // auto-preview first selected file
    if (arr.length) setPreviewFromFile(arr[0]);
  };

  const onChange = (e) => handleFiles(e.target.files);

  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => e.preventDefault();

  const clear = () => {
    setFiles([]);
    if (inputRef.current) inputRef.current.value = null;
    setMessage("");
    clearPreview();
  };

  // Preview state
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewName, setPreviewName] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  const clearPreview = () => {
    if (previewUrl) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (e) {}
    }
    setPreviewUrl(null);
    setPreviewName(null);
    setPreviewType(null);
  };

  const setPreviewFromFile = (file) => {
    if (!file) return clearPreview();
    clearPreview();
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPreviewName(file.name);
    setPreviewType(file.type || getFileExtension(file.name));
  };

  const getFileExtension = (name) => {
    const m = name.match(/\.([^.]+)$/);
    return m ? m[1].toLowerCase() : '';
  };

  // cleanup preview URL on unmount
  useEffect(() => {
    return () => clearPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    const loadUsage = async () => {
      setUsageLoading(true);
      try {
        const res = await fetch(`/api/utilities/${encodeURIComponent(tool)}/usage`, { cache: "no-store" });
        if (!res.ok) {
          setUsageStatus(null);
          return;
        }
        const body = await res.json();
        if (active) {
          setUsageStatus(body.usage || null);
        }
      } catch {
        if (active) {
          setUsageStatus(null);
        }
      } finally {
        if (active) {
          setUsageLoading(false);
        }
      }
    };
    loadUsage();
    return () => {
      active = false;
    };
  }, [tool]);

  const upload = async () => {
    if (!files.length) {
      setMessage("Please select at least one file to upload.");
      return;
    }

    if (showAngleInput) {
      const deg = Number(angle);
      if (!Number.isFinite(deg)) {
        setMessage("Please enter a rotation angle (e.g., 90).");
        return;
      }
    }

    setUploading(true);
    setMessage("Uploading...");

    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('files', f, f.name));

      // POST to the new fileprocess endpoint and include tool in the form data
      fd.append('tool', tool);
      if (showAngleInput) {
        fd.append("angle", String(angle));
      }

      const res = await fetch(`/api/utilities/${encodeURIComponent(tool)}/fileprocess`, {
        method: 'POST',
        body: fd,
      });

      // Handle usage limit (429) specially and show a modal
      if (res.status === 429) {
        let body = null;
        try { body = await res.json(); } catch (e) { body = { message: 'Usage limit exceeded' }; }
        setMessage(body.message || 'Usage limit exceeded.');
        if (body.usage) {
          setUsageStatus(body.usage);
        }
        setUsageInfo(body);
        setUsageModalOpen(true);
        setUploading(false);
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed: ${res.status}`);
      }

        // Decide how to handle the response: JSON vs binary.
        const contentType = res.headers.get('content-type') || '';

        if ((contentType || '').includes('application/json')) {
          // Normal JSON response from the API
          const body = await res.json();
          setMessage(body.message || `Uploaded ${body.files?.length || files.length} file(s) to ${tool}.`);
          // If API returned usage info, show a small notification (optional)
          if (body.usage && typeof body.usage.remaining === "number") {
            const rem = body.usage.remaining;
            setMessage((prev) => `${prev} (${rem} uses remaining this month)`);
            setUsageStatus(body.usage);
          } else if (body.usage) {
            setUsageStatus(body.usage);
          }
          if (body.success) {
            setFiles([]);
            if (inputRef.current) inputRef.current.value = null;
          }
        } else {
          // Binary response (PDF or other). Download it.
          const blob = await res.blob();
          // Fallback filename: use first selected file name or default
          let filename = files[0]?.name ? `processed-${files[0].name}` : 'downloaded-file';
          const disp = res.headers.get('content-disposition') || '';
          const m = /filename\*=UTF-8''(.+)$/.exec(disp) || /filename="?([^";]+)"?/.exec(disp);
          if (m && m[1]) {
            try {
              filename = decodeURIComponent(m[1]);
            } catch (e) {
              filename = m[1];
            }
          }

          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setMessage(`Downloaded ${filename}`);
          const usageLimit = res.headers.get("x-usage-limit");
          const usageRemaining = res.headers.get("x-usage-remaining");
          if (usageLimit || usageRemaining) {
            setUsageStatus((prev) => ({
              ...(prev || {}),
              limit: usageLimit ? Number(usageLimit) : prev?.limit,
              remaining: usageRemaining ? Number(usageRemaining) : prev?.remaining,
            }));
          }
          // cleanup
          setTimeout(() => URL.revokeObjectURL(url), 5000);
          setFiles([]);
          if (inputRef.current) inputRef.current.value = null;
        }
    } catch (err) {
      console.error(err);
      setMessage(err?.message || 'Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  // Usage modal state
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tool Info */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Tool</h2>
        <p className="mt-1 text-sm text-gray-600">
          You are using: <span className="font-medium text-teal-600">{tool}</span>
        </p>
      </div>

      <UsageBanner usage={usageStatus} loading={usageLoading} />

      {showAngleInput && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Rotation angle</p>
              <p className="text-xs text-gray-500">Enter degrees to rotate (e.g., 90, 180, 270).</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                className="w-28 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="90"
                aria-label="Rotation angle in degrees"
              />
              <span className="text-sm text-gray-600">deg</span>
            </div>
          </div>
        </div>
      )}

      {/* Drag & Drop */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center bg-white hover:border-teal-300"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={onChange}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="cursor-pointer">

          <div className="mx-auto max-w-[380px]">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              ></path>
            </svg>
            <p className="mt-3 text-sm text-gray-600">
              Drag & drop files here, or{" "}
              <span className="text-teal-600 underline">click to select</span>
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Files will be sent to the <span className="font-medium">{tool}</span> tool for processing.
            </p>
          </div>
        </label>
      </div>

      {/* File List */}
      <div className="mt-4">
        {files.length ? (
          <div className="bg-gray-50 border border-gray-100 rounded-md p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Selected files ({files.length})</p>
              <button onClick={clear} className="text-sm text-gray-500 hover:text-gray-700">
                Clear
              </button>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {files.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between cursor-pointer hover:bg-white/50 p-2 rounded"
                  onClick={() => setPreviewFromFile(f)}
                  title="Click to preview"
                >
                  <span className="truncate">{f.name}</span>
                  <span className="text-xs text-gray-400">{(f.size / 1024).toFixed(1)} KB</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <button
                onClick={upload}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded bg-teal-600 px-3 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload files"}
              </button>
              <button
                onClick={clear}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded border px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-sm text-gray-500">No files selected.</div>
        )}
      </div>

      {/* Preview Pane */}
      {previewUrl && (
        <div className="mt-6 border rounded-md p-4 bg-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Preview: {previewName}</p>
              <p className="text-xs text-gray-500">{previewType}</p>
            </div>
            <div>
              <button onClick={clearPreview} className="text-sm text-gray-500 hover:text-gray-700">Close preview</button>
            </div>
          </div>

          <div className="mt-4">
            {previewType && previewType.startsWith('image') ? (
              <Image
                src={previewUrl}
                alt={previewName || "File preview"}
                className="mx-auto max-h-[480px] w-auto object-contain"
                width={800}
                height={480}
                priority={false}
              />
            ) : previewType === 'application/pdf' || previewName?.toLowerCase().endsWith('.pdf') ? (
              <iframe src={previewUrl} className="w-full h-[600px] border" title={previewName}></iframe>
            ) : (
              <div className="text-sm text-gray-600">No preview available for this file type.</div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Message */}
      {message && <div className="mt-4 text-sm text-gray-700">{message}</div>}
      {/* Usage limit modal */}
      <UsageLimitModal
        open={usageModalOpen}
        onClose={() => setUsageModalOpen(false)}
        title={usageInfo?.title || 'Usage limit reached'}
        message={
          usageInfo?.message ||
          (usageInfo?.error ||
            "You have reached the current usage limit for this tool. Please try again later.")
        }
      />
    </div>
  );
}
