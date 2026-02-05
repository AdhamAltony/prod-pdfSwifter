"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Lightweight preview + convert fallback component.
export default function FilePreviewWithConvert({ filename, base64Data, tool, contentType, sessionId }) {
  const router = useRouter();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [payload, setPayload] = useState({ filename, base64Data, tool, contentType, angle: undefined });
  const [hydrating, setHydrating] = useState(Boolean(sessionId));
  const [downloadUrl, setDownloadUrl] = useState("");

  // Hydrate from sessionStorage when a sessionId is provided (client-side only).
  useEffect(() => {
    if (!sessionId || typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(sessionId);
      if (!raw) {
        setMessage("Session expired. Please upload again.");
        setHydrating(false);
        return;
      }
      const parsed = JSON.parse(raw);
      setPayload({
        filename: parsed.filename || filename,
        base64Data: parsed.data || base64Data,
        tool: parsed.tool || tool,
        contentType: parsed.contentType || contentType,
        angle: parsed.angle,
      });
      setHydrating(false);
    } catch (err) {
      setMessage("Could not load upload session. Please re-upload.");
      setHydrating(false);
      console.error("Session hydrate error:", err);
    }
  }, [sessionId, filename, base64Data, tool, contentType]);

  const base64ToBlob = (data, type) => {
    const clean = String(data || "");
    const byteString = atob(clean);
    const buf = new ArrayBuffer(byteString.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < byteString.length; i += 1) {
      view[i] = byteString.charCodeAt(i);
    }
    return new Blob([buf], { type: type || "application/octet-stream" });
  };

  const handleConvert = async () => {
    const activeFilename = payload.filename || filename;
    const activeData = payload.base64Data || base64Data;
    const activeTool = payload.tool || tool;
    const activeContentType = payload.contentType || contentType;
    const activeAngle = payload.angle;

    if (!activeData || !activeTool) {
      setMessage("No file data. Please upload first.");
      return;
    }

    setStatus("processing");
    try {
      const formData = new FormData();
      const blob = base64ToBlob(activeData, activeContentType);
      formData.append("files", blob, activeFilename || "upload.pdf");
      formData.append("tool", activeTool);
      if (activeTool === "rotate-pdf" && Number.isFinite(Number(activeAngle))) {
        formData.append("angle", String(activeAngle));
      }

      const res = await fetch(`/api/utilities/${encodeURIComponent(activeTool)}/fileprocess`, {
        method: "POST",
        body: formData,
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.success) {
        setStatus("done");
        if (body.result?.downloadUrl) {
          setDownloadUrl(body.result.downloadUrl);
          setMessage("Conversion complete. Your file is ready.");
        } else {
          setMessage("Conversion queued");
        }
      } else if (res.status === 429) {
        setStatus("blocked");
        setMessage(body.message || "Usage limit reached");
      } else {
        setStatus("error");
        setMessage(body.message || "Conversion failed");
      }
    } catch (err) {
      setStatus("error");
      setMessage(String(err));
    }
  };

  if (hydrating) {
    return (
      <div className="p-6 bg-white rounded shadow">
        <p>Loading your upload...</p>
      </div>
    );
  }

  const displayName = payload.filename || filename;
  const hasData = payload.base64Data || base64Data;

  if (!hasData || !displayName) {
    return (
      <div className="p-6 bg-white rounded shadow">
        <p>{message || "No file data. Please upload first."}</p>
        <button onClick={() => router.push('/utilities')} className="mt-4 text-blue-600">Back to tools</button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded shadow">
      <h3 className="font-semibold mb-2">Preview & Convert</h3>
      <p className="text-sm text-gray-600">{displayName}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={() => router.back()} className="text-sm text-blue-600">Back</button>
        <button onClick={handleConvert} className="px-4 py-2 bg-green-600 text-white rounded">
          {status === "processing" ? "Processing..." : "Convert"}
        </button>
        {downloadUrl && (
          <a
            href={downloadUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Download
          </a>
        )}
      </div>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}
