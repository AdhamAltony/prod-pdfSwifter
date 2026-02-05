# PDFSwifter API Guide for Next.js Developers

## Overview

This API provides video downloading and PDF conversion/compression services. There are **two types of endpoints**:

1. **Job-Based (Async)**: Returns immediately with a `process_id`, work happens in background
2. **Synchronous**: Waits for processing to complete, returns file directly

---

## Base URL

- **Production**: `https://api.pdfswifter.com`
- **Local Dev**: `http://localhost:8000`

For Next.js:
- Use `API_BASE_URL` (from env) for **server-side** calls
- Use `NEXT_PUBLIC_API_URL` (from env) for **client-side** calls

---

## Job-Based Endpoints (Async Pattern)

These endpoints handle large/slow tasks without blocking. Perfect for user-facing apps.

### Pattern Overview

```typescript
// Step 1: Initiate the job
const response = await fetch(`${API_URL}/endpoint`, {
  method: 'POST',
  body: formData // or query params
});
const { process_id } = await response.json();

// Step 2: Poll for status
const pollStatus = async () => {
  const status = await fetch(`${API_URL}/downloads/${process_id}`);
  const data = await status.json();
  
  if (data.status === 'completed') {
    // Step 3: Download the file
    window.location.href = `${API_URL}/downloads/${process_id}/file`;
  } else if (data.status === 'failed') {
    console.error(data.error);
  } else {
    // Still running, check again in 1 second
    setTimeout(pollStatus, 1000);
  }
};
pollStatus();
```

### Status Response Format

```typescript
interface JobStatus {
  process_id: string;
  source: string;          // "youtube" | "tiktok" | "pdf_compress"
  url: string;             // Original URL or filename
  status: "pending" | "running" | "completed" | "failed";
  progress: number;        // 0-100
  bytes_downloaded?: number;
  total_bytes?: number;
  file_path?: string;
  suggested_name?: string;
  error?: string;          // Only present if status === "failed"
  file_exists: boolean;
}
```

---

## 1. YouTube Download (Job-Based)

### POST `/youtube/download`

Downloads a YouTube video.

**Request:**
```typescript
const formData = new URLSearchParams();
formData.append('url', 'https://www.youtube.com/watch?v=VIDEO_ID');

const response = await fetch(`${API_URL}/youtube/download`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: formData
});

const { process_id } = await response.json();
```

**Response:**
```json
{
  "process_id": "abc123def456..."
}
```

**Then poll** `GET /downloads/{process_id}` for status and download via `GET /downloads/{process_id}/file`

---

## 2. TikTok Download (Job-Based)

### POST `/tiktok/download`

Downloads a TikTok video.

**Request:**
```typescript
const formData = new URLSearchParams();
formData.append('url', 'https://www.tiktok.com/@user/video/1234567890');

const response = await fetch(`${API_URL}/tiktok/download`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: formData
});

const { process_id } = await response.json();
```

**Response:**
```json
{
  "process_id": "xyz789abc123..."
}
```

**Then poll** `GET /downloads/{process_id}` for status and download via `GET /downloads/{process_id}/file`

---

## 3. PDF Compress (Job-Based)

### POST `/pdf/compress`

Compresses a PDF file. Returns job ID for tracking.

**Request:**
```typescript
const formData = new FormData();
formData.append('file', pdfFile);           // File object from input
formData.append('level', 'balanced');        // "fast" | "balanced" | "max"

const response = await fetch(`${API_URL}/pdf/compress`, {
  method: 'POST',
  body: formData
});

const { process_id } = await response.json();
```

**Compression Levels:**
- `fast`: Quick compression, less file size reduction
- `balanced`: Good balance (default)
- `max`: Maximum compression, slower

**Response:**
```json
{
  "process_id": "compress123..."
}
```

**Then poll** `GET /downloads/{process_id}` for status and download via `GET /downloads/{process_id}/file`

---

## Job Status & Download Endpoints

### GET `/downloads/{process_id}`

Check job status and progress.

**Response (Running):**
```json
{
  "process_id": "abc123",
  "source": "youtube",
  "url": "https://youtube.com/watch?v=...",
  "status": "running",
  "progress": 45.2,
  "bytes_downloaded": 1048576,
  "total_bytes": 2097152,
  "file_exists": false
}
```

**Response (Completed):**
```json
{
  "process_id": "abc123",
  "source": "youtube",
  "url": "https://youtube.com/watch?v=...",
  "status": "completed",
  "progress": 100,
  "file_path": "/data/downloads/video_123.mp4",
  "suggested_name": "video_123.mp4",
  "file_exists": true
}
```

**Response (Failed):**
```json
{
  "process_id": "abc123",
  "source": "tiktok",
  "url": "https://tiktok.com/@user/video/...",
  "status": "failed",
  "progress": 0,
  "error": "ERROR: Unable to extract webpage video data",
  "file_exists": false
}
```

### GET `/downloads/{process_id}/file`

Download the completed file.

**Response:**
- `200`: File download (binary stream)
- `404`: Process not found
- `400`: File not ready (status != completed or file missing)

**Usage:**
```typescript
// Client-side download
if (status.status === 'completed' && status.file_exists) {
  window.location.href = `${NEXT_PUBLIC_API_URL}/downloads/${process_id}/file`;
}

// Server-side (for processing/storage)
const fileResponse = await fetch(`${API_BASE_URL}/downloads/${process_id}/file`);
const blob = await fileResponse.blob();
```

---

## Synchronous Endpoints (Immediate Response)

These endpoints process and return the file in a single request. Best for smaller PDFs.

### POST `/pdf/to-excel`

Convert PDF tables to Excel.

**Request:**
```typescript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch(`${API_URL}/pdf/to-excel`, {
  method: 'POST',
  body: formData
});

if (response.ok) {
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tables.xlsx';
  a.click();
} else {
  const { error } = await response.json();
  console.error(error);
}
```

**Response:**
- `200`: Excel file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
- `200` with error JSON: `{"error": "No tables found in PDF."}`

---

### POST `/pdf/to-word`

Convert PDF to Word document.

**Request:**
```typescript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch(`${API_URL}/pdf/to-word`, {
  method: 'POST',
  body: formData
});

if (response.ok && response.headers.get('content-type')?.includes('application/')) {
  const blob = await response.blob();
  // Trigger download
} else {
  const { error } = await response.json();
  console.error(error);
}
```

**Response:**
- `200`: DOCX file (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
- `200` with error JSON: `{"error": "Failed to convert PDF: ..."}`

**Note**: Requires `pdf2docx` package on server. If missing, returns error.

---

### POST `/pdf/to-image`

Convert PDF pages to PNG images (returns a ZIP).

**Request:**
```typescript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch(`${API_URL}/pdf/to-image`, {
  method: 'POST',
  body: formData
});

if (response.ok && response.headers.get('content-type')?.includes('application/zip')) {
  const blob = await response.blob();
  // Trigger download
} else {
  const { error } = await response.json();
  console.error(error);
}
```

**Response:**
- `200`: ZIP file containing PNG images (one per page)
- `200` with error JSON: `{"error": "No pages found in PDF."}`

---

## Complete Next.js Example

### Job-Based Download (YouTube/TikTok/Compress)

```typescript
'use client';

import { useState } from 'react';

export default function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [polling, setPolling] = useState(false);

  const startDownload = async () => {
    const formData = new URLSearchParams();
    formData.append('url', url);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/youtube/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });

    const { process_id } = await response.json();
    setPolling(true);
    pollStatus(process_id);
  };

  const pollStatus = async (processId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/downloads/${processId}`);
    const data = await response.json();
    setStatus(data);

    if (data.status === 'completed') {
      setPolling(false);
    } else if (data.status === 'failed') {
      setPolling(false);
    } else {
      setTimeout(() => pollStatus(processId), 1000);
    }
  };

  const downloadFile = () => {
    if (status?.process_id) {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/downloads/${status.process_id}/file`;
    }
  };

  return (
    <div>
      <input 
        value={url} 
        onChange={(e) => setUrl(e.target.value)}
        placeholder="YouTube URL"
      />
      <button onClick={startDownload} disabled={polling}>
        Download
      </button>

      {status && (
        <div>
          <p>Status: {status.status}</p>
          <p>Progress: {status.progress.toFixed(1)}%</p>
          
          {status.status === 'completed' && (
            <button onClick={downloadFile}>Download File</button>
          )}
          
          {status.status === 'failed' && (
            <p style={{ color: 'red' }}>Error: {status.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

### Synchronous PDF Conversion

```typescript
'use client';

import { useState } from 'react';

export default function PDFConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);

  const convertToExcel = async () => {
    if (!file) return;
    
    setConverting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pdf/to-excel`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // Check if it's a file or error JSON
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const { error } = await response.json();
          alert(error);
        } else {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'converted.xlsx';
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      alert('Conversion failed: ' + error);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={convertToExcel} disabled={converting || !file}>
        {converting ? 'Converting...' : 'Convert to Excel'}
      </button>
    </div>
  );
}
```

---

## Error Handling

### Job-Based Endpoints

Always check the `status` field:
```typescript
if (data.status === 'failed') {
  // Show data.error to user
  console.error('Job failed:', data.error);
}
```

Common errors:
- **YouTube**: "YouTube requires sign-in to pass the bot check" → cookies needed on server
- **TikTok**: "Unable to extract webpage video data" → video unavailable/region-locked
- **PDF Compress**: "output file is only X bytes" → compression failed

### Synchronous Endpoints

Check response content-type:
```typescript
const contentType = response.headers.get('content-type');
if (contentType?.includes('application/json')) {
  const { error } = await response.json();
  // Handle error
} else {
  // It's a file, download it
  const blob = await response.blob();
}
```

---

## Environment Variables (Next.js)

```env
# .env.local

# For server-side API calls (from Next.js API routes / Server Components)
API_BASE_URL=http://fastapi:8000

# For client-side API calls (from browser)
NEXT_PUBLIC_API_URL=https://api.pdfswifter.com
```

---

## Rate Limiting & Concurrency

- **PDF Compress**: Limited to 4 concurrent jobs (configurable via `PDF_COMPRESS_CONCURRENCY` env var)
- **Progress Updates**: Throttled to ~1 update per second per job (reduces server load)
- **File Retention**: Downloaded files are auto-deleted after 10 minutes (600s) by default

---

## Tips & Best Practices

1. **Always poll for status** on job-based endpoints - don't assume instant completion
2. **Show progress bars** using the `progress` and `bytes_downloaded` fields
3. **Handle failed jobs gracefully** - display `error` message to user
4. **Set timeouts** - if polling exceeds 5 minutes, show "taking longer than expected" message
5. **Validate file uploads** client-side before sending (file type, size limits)
6. **Use server-side API calls** when possible (avoids CORS, keeps API URL private)
7. **Compress large PDFs async** - use `/pdf/compress` (job-based) not synchronous endpoints

---

## Testing Locally

Start the FastAPI server:
```bash
cd PDFSwifter-api
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Access API docs: http://localhost:8000/docs

Test with curl:
```bash
# Job-based
curl -X POST "http://localhost:8000/youtube/download" \
  -d "url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Check status
curl "http://localhost:8000/downloads/{process_id}"

# Download file
curl "http://localhost:8000/downloads/{process_id}/file" -o video.mp4
```

---

## Redis (Production)

In production with Redis enabled (`REDIS_URL` env var set):
- Job status is shared across all FastAPI workers/containers
- Multiple Next.js instances can query the same job
- Jobs persist even if a worker restarts

Without Redis:
- Jobs are stored in-memory only
- Only the worker that created the job can see its status
- Fine for single-instance dev/testing
