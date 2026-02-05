"use client";

import { useState } from "react";

function YouTubeIcon() {
  return (
    <svg
      className="w-12 h-12 text-red-600 mb-4"
      viewBox="0 0 32 32"
      fill="currentColor"
    >
      <path d="M31.67 10.93a3.96 3.96 0 0 0-2.82-2.8C26.09 7.33 16 7.33 16 7.33s-10.09 0-12.85.8a3.96 3.96 0 0 0-2.82 2.8C0 13.68 0 16 0 16s0 2.32.33 5.07a3.96 3.96 0 0 0 2.82 2.8c2.76.8 12.85.8 12.85.8s10.09 0 12.85-.8a3.96 3.96 0 0 0 2.82-2.8c.33-2.75.33-5.07.33-5.07s0-2.32-.33-5.07zM12.73 21.12V10.88l8.38 5.12-8.38 5.12z" />
    </svg>
  );
}

const qualities = [
  { label: "Best", code: "best" },
  { label: "1080p", code: "137+140" },
  { label: "720p", code: "22" },
  { label: "480p", code: "135+140" },
  { label: "360p", code: "18" },
];

export default function YouTubeDownloadInput() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState(qualities[0].code);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleDownload = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube video URL.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("url", url);
      formData.append("quality", quality);

      const res = await fetch("/api/download-youtube", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to download video.");
      }

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "video.mp4";
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess("Download started!");
    } catch (err) {
      setError(err.message || "Error downloading video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center ring-1 ring-red-100">
      <YouTubeIcon />
      <h2 className="text-3xl font-extrabold mb-3 text-center text-gray-900">
        Download from YouTube
      </h2>
      <p className="mb-5 text-center text-gray-600">
        Paste a YouTube video link below, choose quality, and download video!
      </p>

      <input
        type="text"
        placeholder="https://www.youtube.com/watch?v=..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={loading}
        className="w-full border-2 border-red-300 rounded-xl p-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-red-300 focus:border-red-500 transition mb-4"
      />

      <select
        value={quality}
        onChange={(e) => setQuality(e.target.value)}
        disabled={loading}
        className="w-full mb-4 border-2 border-red-200 rounded-xl p-2 text-sm focus:border-red-500"
      >
        {qualities.map((q) => (
          <option key={q.code} value={q.code}>
            {q.label}
          </option>
        ))}
      </select>

      {error && (
        <div className="w-full p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="w-full p-3 mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={loading}
        className={`w-full py-3 font-semibold rounded-xl shadow-lg transition ${
          loading
            ? "bg-red-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white"
        }`}
      >
        {loading ? "Loading..." : "Download Video"}
      </button>
    </div>
  );
}
