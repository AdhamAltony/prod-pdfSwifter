"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/shared/ui/ProgressBar";
import UsageBanner from "@/features/utilities/ui/UsageBanner";
import UsageLimitModal from "@/features/utilities/ui/UsageLimitModal";

// Simple file upload component - only handles upload, then redirects to result page
// Props:
// - tool: string (tool name like 'rotate-pdf')
// - accept?: string (file types to accept)
// - multiple?: boolean (allow multiple files)
export default function FileUploadWithProgress({
  tool,
  accept = ".pdf",
  multiple = false,
}) {
  const [state, setState] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [angle, setAngle] = useState("90");
  const showAngleInput = tool === "rotate-pdf";
  const fileInputRef = useRef(null);
  const router = useRouter();
  const [usageStatus, setUsageStatus] = useState(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [usageInfo, setUsageInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    
    setSelectedFiles(files);
    setFileName(files.length === 1 ? files[0].name : `${files.length} files`);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;
    setErrorMessage("");
    if (showAngleInput) {
      const deg = Number(angle);
      if (!Number.isFinite(deg)) {
        setState("error");
        setErrorMessage("Please enter a rotation angle (e.g., 90).");
        return;
      }
    }

    try {
      setState("uploading");
      setProgress(0);

      // Simulate upload progress more visibly
      for (let i = 0; i <= 100; i += 5) {
        setProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 50)); // Faster updates
      }

      // Process file directly without sessionStorage to avoid quota issues
      const file = selectedFiles[0];
      
      // Check file size - if too large, process directly
      const maxSessionStorageSize = 4 * 1024 * 1024; // 4MB limit for sessionStorage
      
      if (file.size > maxSessionStorageSize) {
        // For large files, send directly to conversion API
        setState("converting");
        setProgress(0);
        
        try {
          const formData = new FormData();
          formData.append("files", file);
          formData.append("tool", tool);
          if (showAngleInput) {
            formData.append("angle", String(angle));
          }
          
          const response = await fetch(`/api/utilities/${tool}/fileprocess`, {
            method: "POST",
            body: formData,
          });

          if (response.status === 429) {
            const body = await response.json().catch(() => ({}));
            setUsageInfo(body);
            if (body.usage) {
              setUsageStatus(body.usage);
            }
            setUsageModalOpen(true);
            setState("idle");
            return;
          }

          const result = await response.json();
          
          if (result.success && result.result?.downloadUrl) {
            setProgress(100);
            setState("complete");
            if (result.usage) {
              setUsageStatus(result.usage);
            }
            
            // Redirect to success page
            setTimeout(() => {
              const params = new URLSearchParams({
                status: "success",
                filename: file.name,
                url: result.result.downloadUrl,
              });
              router.push(`/result?${params.toString()}`);
            }, 1000);
          } else {
            throw new Error(result.message || "Conversion failed");
          }
        } catch (conversionError) {
          console.error("Direct conversion error:", conversionError);
          setState("error");
          return;
        }
        
        return; // Exit early for direct processing
      }
      
      // For smaller files, use sessionStorage approach
      const arrayBuffer = await file.arrayBuffer();
      
      // Convert ArrayBuffer to base64 safely for large files
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = "";
      const chunkSize = 8192; // Process in chunks to avoid stack overflow
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
      }
      
      const base64 = btoa(binary);
      
      // Try to store in sessionStorage with error handling
      const sessionId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        sessionStorage.setItem(sessionId, JSON.stringify({
          filename: file.name,
          tool: tool,
          data: base64,
          size: file.size,
          contentType: file.type || "application/pdf",
          angle: showAngleInput ? Number(angle) : undefined,
        }));
        
        // Redirect to result page with session reference
        const redirectUrl = `/result?status=uploaded&session=${sessionId}`;
        router.push(redirectUrl);
        
      } catch (storageError) {
        console.warn("SessionStorage failed, falling back to direct processing:", storageError);
        
        // Fallback to direct processing if sessionStorage fails
        setState("converting");
        setProgress(0);
        
        const formData = new FormData();
        formData.append("files", file);
        formData.append("tool", tool);
        if (showAngleInput) {
          formData.append("angle", String(angle));
        }
        
        const response = await fetch(`/api/utilities/${tool}/fileprocess`, {
          method: "POST",
          body: formData,
        });

        if (response.status === 429) {
          const body = await response.json().catch(() => ({}));
          setUsageInfo(body);
          if (body.usage) {
            setUsageStatus(body.usage);
          }
          setUsageModalOpen(true);
          setState("idle");
          return;
        }

        const result = await response.json();
        
        if (result.success && result.result?.downloadUrl) {
          setProgress(100);
          setState("complete");
          if (result.usage) {
            setUsageStatus(result.usage);
          }
          
          setTimeout(() => {
            const params = new URLSearchParams({
              status: "success",
              filename: file.name,
              url: result.result.downloadUrl,
            });
            router.push(`/result?${params.toString()}`);
          }, 1000);
        } else {
          throw new Error(result.message || "Conversion failed");
        }
      }
      
    } catch (error) {
      console.error("Upload error:", error);
      setState("error");
      setErrorMessage("Upload failed. Please try again.");
    }
  };

  const reset = () => {
    setState("idle");
    setProgress(0);
    setFileName("");
    setSelectedFiles([]);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <UsageBanner usage={usageStatus} loading={usageLoading} />
      {showAngleInput && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
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
                className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="90"
                aria-label="Rotation angle in degrees"
              />
              <span className="text-sm text-gray-600">deg</span>
            </div>
          </div>
        </div>
      )}
      {/* File input area */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={state !== 'idle'}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            state !== 'idle'
              ? 'border-blue-400 bg-blue-50 cursor-not-allowed'
              : selectedFiles.length > 0
              ? 'border-green-400 bg-green-50 hover:bg-green-100'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              {selectedFiles.length > 0 ? (
                <span className="font-medium text-green-600">
                  {fileName} selected
                </span>
              ) : (
                <>
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            <p className="text-xs text-gray-500">PDF files only</p>
          </div>
        </label>
      </div>

      {/* Progress bar - always show for debugging when not idle */}
      {state !== 'idle' && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">
            State: {state} | Progress: {progress}%
          </div>
          <ProgressBar 
            state={state}
            progress={progress}
            fileName={fileName}
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            uploadFiles();
          }}
          disabled={selectedFiles.length === 0 || state !== 'idle'}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {state === 'uploading' ? 'Uploading...' : state === 'converting' ? 'Converting...' : 'Upload File'}
        </button>
        
        {state === 'error' && (
          <button
            onClick={reset}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="text-sm text-red-600">{errorMessage}</div>
      )}

      <UsageLimitModal
        open={usageModalOpen}
        onClose={() => setUsageModalOpen(false)}
        title={usageInfo?.title || "Usage limit reached"}
        message={
          usageInfo?.message ||
          "You have reached the current usage limit for this tool. Please try again later."
        }
      />
    </div>
  );
}
