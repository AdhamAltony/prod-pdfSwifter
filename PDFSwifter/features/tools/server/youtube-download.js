// youtube-download.js
// YouTube video downloader using the custom API provided in the infra notes.

import { env as processEnv } from 'node:process';
import axios from 'axios';

const env = processEnv || (typeof process !== 'undefined' ? process.env : {}) || {};
const DEFAULT_API_BASE = 'https://api.pdfswifter.com';
const YOUTUBE_API_BASE_URL = (env.API_BASE_URL || env.YOUTUBE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, '');

export async function process(files, options = {}) {
    if (!files || files.length === 0) {
        throw new Error('No URL provided');
    }

    const urlData = files[0];
    if (!urlData.url) {
        throw new Error('No URL provided');
    }

    const youtubeUrl = urlData.url;

    // Basic validation to avoid obviously invalid links before hitting the API
    if (!extractVideoId(youtubeUrl)) {
        throw new Error('Please provide a valid YouTube URL');
    }

    try {
        const endpoint = `${YOUTUBE_API_BASE_URL}/youtube/download`;
        const form = new URLSearchParams();
        form.append('url', youtubeUrl);
        const response = await axios.post(endpoint, form, {
            timeout: 30000,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const result = response?.data;
        if (!result || !result.process_id) {
            throw new Error(result?.message || 'Download server did not return a process ID');
        }

        const jobId = result.process_id;
        const message = result.message || 'Download queued, preparing video...';

        return {
            message,
            requiresPolling: true,
            jobType: 'youtube-download',
            job: {
                id: jobId,
                status: result.status || 'pending',
                statusUrl: `/api/download-jobs/${jobId}`,
                fileUrl: `/api/download-jobs/${jobId}/file`,
                suggestedFilename: result.suggested_name,
                raw: result,
            },
        };

    } catch (error) {
        console.error('YouTube download error:', error);

        if (error.code === 'ECONNABORTED') {
            throw new Error('Download timeout - video may be too large or server took too long to respond');
        }

        if (error.response) {
            const status = error.response.status;
            const message = parseErrorMessage(error.response.data) ||
                error.response.statusText ||
                'Remote download service error';

            if (status === 422) {
                throw new Error('Validation failed: please check that the YouTube URL is correct and accessible.');
            }

            if (status === 404) {
                throw new Error('Download service unavailable - please try again later.');
            }

            throw new Error(message);
        }

        throw new Error(error.message || 'Failed to download YouTube video. The video may be private, age-restricted, or unavailable.');
    }
}

function extractVideoId(url) {
    try {
        const urlObj = new URL(url);
        
        // Handle youtu.be URLs
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1).split('?')[0];
        }
        
        // Handle youtube.com URLs
        if (urlObj.hostname.includes('youtube.com')) {
            const videoId = urlObj.searchParams.get('v');
            if (videoId) return videoId;
            
            // Handle /embed/ URLs
            const embedMatch = urlObj.pathname.match(/\/embed\/([^/?]+)/);
            if (embedMatch) return embedMatch[1];
            
            // Handle /v/ URLs
            const vMatch = urlObj.pathname.match(/\/v\/([^/?]+)/);
            if (vMatch) return vMatch[1];
        }
        
        return null;
    } catch {
        return null;
    }
}


function sanitizeFilename(name) {
    return name
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .substring(0, 50) // Limit length
        .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
}

function parseErrorMessage(data) {
    if (!data) return null;
    let text;
    if (Buffer.isBuffer(data)) {
        text = data.toString('utf8');
    } else if (typeof data === 'string') {
        text = data;
    } else if (data instanceof ArrayBuffer) {
        text = Buffer.from(data).toString('utf8');
    } else if (typeof data === 'object') {
        try {
            return data.detail || data.message || data.error || JSON.stringify(data);
        } catch {
            return null;
        }
    }

    if (!text) return null;

    try {
        const parsed = JSON.parse(text);
        return parsed?.detail || parsed?.message || parsed?.error || text;
    } catch {
        return text;
    }
}

function extractFilename(contentDisposition = '') {
    if (!contentDisposition) return null;
    const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
    const asciiMatch = /filename="?([^";]+)"?/i.exec(contentDisposition);
    const raw = utfMatch?.[1] || asciiMatch?.[1];
    if (!raw) return null;
    try {
        return sanitizeFilename(decodeURIComponent(raw));
    } catch {
        return sanitizeFilename(raw);
    }
}
