"use client";

import React, { useEffect, useRef, useState } from "react";
import { LinkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import UsageLimitModal from "./UsageLimitModal";
import UsageBanner from "./UsageBanner";

export default function UrlToolRunner({ tool }) {
	const [url, setUrl] = useState("");
	const [processing, setProcessing] = useState(false);
	const [message, setMessage] = useState("");
	const [jobInfo, setJobInfo] = useState(null);
	const [jobStatus, setJobStatus] = useState(null);
	const [jobProgress, setJobProgress] = useState(0);
	const [jobProgressKnown, setJobProgressKnown] = useState(false);
	const [jobDetail, setJobDetail] = useState("");
	const [downloadReadyJob, setDownloadReadyJob] = useState(null);
	const [downloadInProgress, setDownloadInProgress] = useState(false);
	const [manualDownloadData, setManualDownloadData] = useState(null);
	const jobPollRef = useRef(null);
	const showIndeterminate = !jobProgressKnown && !["completed", "failed", "error"].includes(jobStatus);
	const [usageStatus, setUsageStatus] = useState(null);
	const [usageLoading, setUsageLoading] = useState(true);
	const [usageModalOpen, setUsageModalOpen] = useState(false);
	const [usageInfo, setUsageInfo] = useState(null);

	useEffect(() => {
		return () => {
			if (jobPollRef.current) {
				clearInterval(jobPollRef.current);
			}
		};
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

	const cleanupJobPolling = () => {
		if (jobPollRef.current) {
			clearInterval(jobPollRef.current);
			jobPollRef.current = null;
		}
	};

	const downloadJobFile = async (job, suggestedFilename) => {
		const endpoint =
			job?.fileUrl ||
			(job?.id ? `/api/download-jobs/${job.id}/file` : job?.jobId ? `/api/download-jobs/${job.jobId}/file` : null);

		if (!endpoint) {
			throw new Error("Missing download endpoint for job.");
		}

		const link = document.createElement("a");
		link.href = endpoint;
		if (suggestedFilename || job?.filename) {
			link.download = suggestedFilename || job?.filename;
		}
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const triggerBlobDownload = (blob, filename) => {
		const downloadUrl = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = downloadUrl;
		link.download = filename || "download";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(downloadUrl);
	};

	const handleManualDownload = async () => {
		if (!manualDownloadData) return;
		setDownloadInProgress(true);
		setMessage("Downloading...");
		try {
			if (manualDownloadData.type === "job") {
				await downloadJobFile(manualDownloadData.job, manualDownloadData.filename);
			} else if (manualDownloadData.type === "url") {
				const link = document.createElement("a");
				link.href = manualDownloadData.downloadUrl;
				link.download = manualDownloadData.filename || "download";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			} else if (manualDownloadData.type === "blob" && manualDownloadData.blob) {
				triggerBlobDownload(manualDownloadData.blob, manualDownloadData.filename);
			}
			setMessage("✓ Download started!");
		} catch (error) {
			console.error("Download error:", error);
			setMessage(`Error: ${error.message}`);
		} finally {
			setDownloadInProgress(false);
		}
	};

	const clampPercentage = (value) => Math.min(100, Math.max(0, value));

	const extractJobProgress = (jobPayload) => {
		if (!jobPayload) {
			return { progress: 0, known: false };
		}

		const rawProgress = jobPayload.progress;
		if (rawProgress !== undefined && rawProgress !== null) {
			const numericProgress = Number(rawProgress);
			if (Number.isFinite(numericProgress)) {
				if (numericProgress > 0 || jobPayload.downloadReady || jobPayload.status === "completed") {
					return { progress: clampPercentage(numericProgress), known: true };
				}
				return { progress: 0, known: false };
			}
		}

		const bytesDownloaded = Number(
			jobPayload.bytesDownloaded ?? jobPayload.bytes_downloaded ?? jobPayload.downloadedBytes ?? jobPayload.downloaded_bytes
		);
		const totalBytes = Number(jobPayload.totalBytes ?? jobPayload.total_bytes ?? jobPayload.total);

		if (Number.isFinite(bytesDownloaded) && Number.isFinite(totalBytes) && totalBytes > 0) {
			return { progress: clampPercentage((bytesDownloaded / totalBytes) * 100), known: true };
		}

		return { progress: 0, known: false };
	};

	const pollJobStatus = async (job) => {
		const statusEndpoint =
			job?.statusUrl ||
			(job?.id ? `/api/download-jobs/${job.id}` : job?.jobId ? `/api/download-jobs/${job.jobId}` : null);

		if (!statusEndpoint) {
			throw new Error("Missing job status endpoint.");
		}

		const response = await fetch(statusEndpoint, { cache: "no-store" });
		if (!response.ok) {
			const errorPayload = await response.json().catch(() => ({}));
			throw new Error(errorPayload?.message || `Status error ${response.status}`);
		}

		const payload = await response.json();
		if (!payload.success) {
			throw new Error(payload?.message || "Failed to fetch job status.");
		}

		const jobPayload = payload.job || {};
		const { progress, known } = extractJobProgress(jobPayload);
		if (known) {
			setJobProgress(progress);
			setJobProgressKnown(true);
		}
		if (jobPayload.status) {
			setJobStatus(jobPayload.status);
		}
		if (jobPayload.message) {
			setJobDetail(jobPayload.message);
		}

		if (jobPayload.error) {
			cleanupJobPolling();
			setProcessing(false);
			setJobInfo(null);
			setMessage(`Error: ${jobPayload.message || "Download failed"}`);
			setDownloadReadyJob(null);
			setDownloadInProgress(false);
			setManualDownloadData(null);
			return false;
		}

		if (jobPayload.downloadReady || jobPayload.status === "completed") {
			cleanupJobPolling();
			setProcessing(false);
			setJobProgress(100);
			setJobProgressKnown(true);
			setJobStatus("completed");
			setJobDetail(jobPayload.message || "Download ready");
			setDownloadReadyJob({
				job,
				filename: jobPayload.filename || job?.filename || job?.suggestedFilename,
			});
			setManualDownloadData({
				type: "job",
				job,
				filename: jobPayload.filename || job?.filename || job?.suggestedFilename,
			});
			setMessage("✓ Download ready! Click Download Video to start.");
			return false;
		}

		return true;
	};

	const startJobTracking = (job, initialMessage) => {
		setDownloadReadyJob(null);
		setDownloadInProgress(false);
		setJobInfo(job);
		setJobStatus("queued");
		setJobProgress(0);
		setJobProgressKnown(false);
		setJobDetail(initialMessage || "Preparing download...");
		setMessage("");
		setManualDownloadData(null);

		cleanupJobPolling();

		const poll = async () => {
			try {
				const shouldContinue = await pollJobStatus(job);
				if (!shouldContinue) {
					return;
				}
			} catch (error) {
				cleanupJobPolling();
				setProcessing(false);
				setJobStatus("error");
				setMessage(`Error: ${error.message}`);
				setDownloadReadyJob(null);
				setDownloadInProgress(false);
			}
		};

		poll();
		jobPollRef.current = window.setInterval(poll, 2000);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
    
		if (!url.trim()) {
			setMessage("Please enter a valid URL");
			return;
		}

		try {
			new URL(url);
		} catch {
			setMessage("Please enter a valid URL");
			return;
		}

		cleanupJobPolling();
		setJobInfo(null);
		setJobProgress(0);
		setJobProgressKnown(false);
		setJobStatus(null);
		setJobDetail("");
		setDownloadReadyJob(null);
		setDownloadInProgress(false);
		setManualDownloadData(null);

		setProcessing(true);
		setMessage("");
		setJobInfo({ pending: true });
		setJobStatus("queued");
		setJobDetail("Starting download...");

		let jobStarted = false;

		try {
			const response = await fetch(`/api/utilities/${tool}/fileprocess`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					tool,
					url: url.trim(),
				}),
			});

			if (response.status === 429) {
				const errorData = await response.json().catch(() => ({}));
				setUsageInfo(errorData);
				if (errorData.usage) {
					setUsageStatus(errorData.usage);
				}
				setUsageModalOpen(true);
				throw new Error(errorData.message || "Usage limit reached");
			}

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || `Server error: ${response.status}`);
			}

			const contentType = response.headers.get("content-type");
      
			if (contentType?.includes("application/json")) {
				const data = await response.json();
				if (data.success) {
					if (data.usage) {
						setUsageStatus(data.usage);
					}
					const downloadResult = data.result;
					if ((tool === "youtube-download" || tool === "tiktok-download") && downloadResult?.job) {
						jobStarted = true;
						startJobTracking(downloadResult.job, data.message || downloadResult.message);
						return;
					}

					setDownloadReadyJob(null);
					setManualDownloadData(null);
					setJobInfo(null);
					setJobStatus(null);
					setJobDetail("");

					if (downloadResult?.downloadUrl) {
						setManualDownloadData({
							type: "url",
							downloadUrl: downloadResult.downloadUrl,
							filename: downloadResult.filename || "download",
						});
						setMessage("✓ Download ready! Click Download Video to start.");
					} else {
						setMessage("✓ Processing completed successfully!");
					}
				} else {
					setMessage(`Error: ${data.message || "Processing failed"}`);
				}
			} else {
				const blob = await response.blob();
				const contentDisposition = response.headers.get("content-disposition");
				let filename = "download";
        
				if (contentDisposition) {
					const filenameMatch = contentDisposition.match(/filename\?=UTF-8''(.+)$|filename="?(.+)"?/);
					if (filenameMatch) {
						filename = filenameMatch[1] || filenameMatch[2] || filename;
					}
				}

				setDownloadReadyJob(null);
				setJobInfo(null);
				setJobStatus(null);
				setJobDetail("");
				setManualDownloadData({
					type: "blob",
					blob,
					filename,
					contentType: response.headers.get("content-type") || "application/octet-stream",
				});
				setMessage("✓ Download ready! Click Download Video to start.");
				const usageLimit = response.headers.get("x-usage-limit");
				const usageRemaining = response.headers.get("x-usage-remaining");
				if (usageLimit || usageRemaining) {
					setUsageStatus((prev) => ({
						...(prev || {}),
						limit: usageLimit ? Number(usageLimit) : prev?.limit,
						remaining: usageRemaining ? Number(usageRemaining) : prev?.remaining,
					}));
				}
			}
		} catch (error) {
			console.error("Processing error:", error);
			cleanupJobPolling();
			setJobInfo(null);
			setJobStatus(null);
			setJobDetail("");
			setMessage(`Error: ${error.message}`);
		} finally {
			if (!jobStarted) {
				setProcessing(false);
			}
		}
	};

	const handleClear = () => {
		setUrl("");
		setMessage("");
		cleanupJobPolling();
		setJobInfo(null);
		setJobStatus(null);
		setJobProgress(0);
		setJobProgressKnown(false);
		setJobDetail("");
		setDownloadReadyJob(null);
		setDownloadInProgress(false);
		setProcessing(false);
	};

	return (
		<div className="max-w-2xl mx-auto">
			<div className="mb-6">
				<UsageBanner usage={usageStatus} loading={usageLoading} />
			</div>
		<form onSubmit={handleSubmit} className="space-y-6">
				<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 transition-colors">
					<LinkIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          
					<div className="space-y-4">
						<label htmlFor="url-input" className="block text-sm font-medium text-gray-700">
							Enter URL
						</label>
						<input
							id="url-input"
							type="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://www.youtube.com/watch?v=... or https://www.tiktok.com/@..."
							className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
							disabled={processing}
						/>
					</div>
				</div>

			<div className="flex gap-4">
				<button
					type={manualDownloadData ? "button" : "submit"}
					onClick={manualDownloadData ? handleManualDownload : undefined}
					disabled={
						processing ||
						downloadInProgress ||
						(!manualDownloadData && !url.trim())
					}
					className="flex-1 bg-teal-600 text-white py-3 px-6 rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
				>
						{processing ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
								Processing...
							</>
						) : downloadInProgress ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
								Downloading...
							</>
					) : manualDownloadData ? (
						<>
							<ArrowDownTrayIcon className="h-5 w-5" />
							Download Video
						</>
					) : (
						<>
							<ArrowDownTrayIcon className="h-5 w-5" />
							Download
						</>
					)}
				</button>

					<button
						type="button"
						onClick={handleClear}
						disabled={processing}
						className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						Clear
					</button>
				</div>

				{jobInfo && (
					<div className="space-y-3 rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
						<div className="flex items-center justify-between text-sm text-gray-600">
							<span className="font-medium text-gray-800">Download progress</span>
							<span>{jobProgressKnown ? `${Math.round(jobProgress)}%` : "..."}</span>
						</div>
						<div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
							<div
								className={`h-full bg-teal-500 transition-all duration-300 ease-out ${
									showIndeterminate ? "animate-pulse" : ""
								}`}
								style={{
									width: jobProgressKnown
										? `${clampPercentage(Math.round(jobProgress))}%`
										: showIndeterminate
											? "100%"
											: "0%",
								}}
							/>
						</div>
						<p className="text-sm text-gray-600">
							Status: <span className="font-semibold text-gray-800 capitalize">{jobStatus || "starting"}</span>
						</p>
						{jobDetail && <p className="text-sm text-gray-500">{jobDetail}</p>}
						{downloadReadyJob && (
							<p className="text-sm text-gray-500">Download ready.</p>
						)}
					</div>
				)}

				{message && (
					<div
						className={`p-4 rounded-md ${
							message.startsWith("✓")
								? "bg-green-50 text-green-800 border border-green-200"
								: "bg-red-50 text-red-800 border border-red-200"
						}`}
					>
						{message}
					</div>
				)}
			</form>

		<div className="mt-8 text-sm text-gray-500 text-center">
			<p>Supported platforms: TikTok, YouTube</p>
			<p>Downloads videos in HD quality when available</p>
		</div>

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
