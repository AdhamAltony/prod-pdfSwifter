// tiktok-download.js
// Delegates TikTok downloads to the shared download service.

import { env as processEnv } from 'node:process';
import axios from 'axios';

const env = processEnv || (typeof process !== 'undefined' ? process.env : {}) || {};
const DEFAULT_API_BASE = 'https://api.pdfswifter.com';
const REMOTE_API_BASE =
  (env.API_BASE_URL || env.TIKTOK_API_BASE_URL || env.YOUTUBE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, '');

export async function process(files) {
  if (!files || files.length === 0) {
    throw new Error('No URL provided');
  }

  const urlData = files[0];
  if (!urlData.url) {
    throw new Error('No URL provided');
  }

  if (!isValidTikTokUrl(urlData.url)) {
    throw new Error('Please provide a valid TikTok URL');
  }

  try {
    const endpoint = `${REMOTE_API_BASE}/tiktok/download`;
    const form = new URLSearchParams();
    form.append('url', urlData.url);
    const response = await axios.post(endpoint, form, {
      params: { url: urlData.url },
      timeout: 30000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const result = response.data;
    if (!result || !result.process_id) {
      throw new Error(result?.message || 'Download server did not return a process ID');
    }

    const jobId = result.process_id;
    const message = result.message || 'Download queued, preparing video...';

    return {
      message,
      requiresPolling: true,
      jobType: 'tiktok-download',
      job: {
        id: jobId,
        status: result.status || 'pending',
        statusUrl: `/api/download-jobs/${jobId}`,
        fileUrl: `/api/download-jobs/${jobId}/file`,
        suggestedFilename: result.suggested_name || result.filename,
        raw: result,
      },
    };
  } catch (error) {
    console.error('TikTok download error:', error);

    if (error.code === 'ECONNABORTED') {
      throw new Error('Download timeout - video may be too large or the server took too long to respond');
    }

    if (error.code === 'ECONNREFUSED') {
      throw new Error('Download service unavailable. Start the downloader on port 8000 or set TIKTOK_API_BASE_URL to your running instance.');
    }

    if (error.response) {
      const status = error.response.status;
      const message =
        parseRemoteError(error.response.data) ||
        error.response.statusText ||
        'Remote download service error';

      if (status === 422) {
        throw new Error('Validation failed: please check that the TikTok URL is correct and accessible.');
      }

      if (status === 404) {
        throw new Error('Download service unavailable - please try again later.');
      }

      throw new Error(message);
    }

    throw new Error(error.message || 'Failed to initiate TikTok download');
  }
}

function parseRemoteError(data) {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    return data.detail || data.message || data.error || null;
  }
  return null;
}

function isValidTikTokUrl(url) {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname.endsWith('tiktok.com') ||
      urlObj.hostname.endsWith('vm.tiktok.com') ||
      urlObj.hostname.endsWith('vt.tiktok.com')
    );
  } catch {
    return false;
  }
}
