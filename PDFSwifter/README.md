<!-- README: concise developer guide for this project -->

# pdfSwifter (Next.js)

A collection of PDF utilities built with Next.js (app directory) featuring ARB Payment Gateway integration for premium subscriptions.

## Features

- **pdfSwifter**: Compress, rotate, merge, and split PDF files
- **Usage Limits**: Standard users get 3 uses per tool per month, tracked by user/IP + token
- **Premium Plans**: Unlimited access via ARB Payment Gateway integration
- **Secure Payments**: AES-256-CBC encrypted payment flow with Al Rajhi Bank
- **File-based Storage**: Simple JSON databases for usage and order tracking
- **Tool Policy**: `data/tools-config.json` controls allowed tools, plan limits, and reliability gate settings

## Quick start

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Copy `.env.example` to `.env.local` and fill in your ARB Payment Gateway credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
ARB_RESOURCE_KEY=your_resource_key_here
ARB_MERCHANT_ID=your_merchant_id_here
ARB_PASSWORD=your_password_here
ARB_API_URL=https://securepayments.alrajhibank.com.sa/pg/payment/hosted.htm
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-6225595378099419
NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP=2869688333
NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID=8418879555
NEXT_PUBLIC_ADSENSE_SLOT_TOOLS_LIST=3908788909
NEXT_PUBLIC_ADSENSE_SLOT_TOOL_DETAIL=7683031317
YOUTUBE_API_BASE_URL=http://localhost:8000
```

AdSense ads only render when the client ID and a slot are configured. Set each slot to match the unit IDs you create inside your AdSense account (reusing the same slot across pages is fine). The project will also read the legacy `NEXT_PUBLIC_ADSENSE_SLOT_TOOL_PAGE` when the new tool list/detail slots are absent.

`YOUTUBE_API_BASE_URL` points to the external service that fetches/merges YouTube videos. During development it defaults to a local instance on port 8000—set it to your production host when deploying.

### Async downloader workflow

YouTube downloads now run as background jobs:

1. `lib/tools/youtube-download.js` POSTs `/youtube/download?url=...` to the service configured by `YOUTUBE_API_BASE_URL`. The server responds immediately with `{ process_id }`.
2. The Next.js proxy routes `app/api/download-jobs/[processId]/route.js` and `app/api/download-jobs/[processId]/file/route.js` call `/downloads/{process_id}` and `/downloads/{process_id}/file` so the client avoids CORS issues.
3. `UrlToolRunner` detects the returned job info, polls the status route for `status`/`progress`, and displays a progress bar until the server reports `status === "completed"`, then streams the finished file through the proxy.

If the remote job reports `status === "failed"`, the error string from the downloader is surfaced directly to the user.

3. **Run development server**

```bash
npm run dev
# opens on http://localhost:3000
```

## Project Structure

### Core Directories

- `app/` — Next.js app routes and pages
  - `app/utilities/[tool]/page.js` — Individual utility pages
  - `app/api/utilities/[tool]/fileprocess/route.js` — File processing API
  - `app/api/payment/` — Payment gateway endpoints
  - `app/payment/` — Payment response handlers
  - `app/pricing/` — Pricing page with payment integration
- `components/` — React components
  - `ToolRunner.jsx` — File upload UI with usage limit handling
  - `UsageLimitModal.jsx` — Modal for upgrade prompts
- `lib/` — Business logic
  - `lib/tools/` — PDF processing tools (using pdf-lib)
  - `lib/server/usage-db.js` — Usage tracking with premium bypass
  - `lib/payment/arb-gateway.js` — ARB Payment Gateway integration
- `data/` — JSON databases
  - `data/usage.json` — Usage tracking per IP+token
  - `data/orders.json` — Payment orders and transaction status
  - `data/plans.js` — Pricing plan definitions

## Payment Flow

### 1. User Initiates Payment

User clicks "Upgrade Now" on pricing page (`/pricing`):

```javascript
// Client-side code in app/pricing/page.js
const response = await fetch('/api/payment/create-order', {
  method: 'POST',
  body: JSON.stringify({ planName: 'Premium', amount: 9 })
});

const { paymentUrl } = await response.json();
window.location.href = paymentUrl; // Redirect to ARB gateway
```

### 2. Payment Processing

Backend creates order and generates payment token:

```javascript
// app/api/payment/create-order/route.js
import { generatePaymentToken } from '@/lib/payment/arb-gateway';

// 1. Generate unique trackId
// 2. Encrypt payment data with AES-256-CBC
// 3. Call ARB API to get payment URL
// 4. Save order to data/orders.json
// 5. Return paymentUrl to client
```

### 3. Payment Response Handling

ARB redirects back to your app:

- **Success**: `/payment/response?paymentId=xxx&trackId=xxx`
  - Calls `/api/payment/verify` to confirm transaction
  - Updates order status to APPROVED
  - Grants unlimited access to user
  - Redirects to tools page

- **Failure**: `/payment/error?errorCode=xxx&errorText=xxx`
  - Displays error message
  - Provides retry option

### 4. Premium Access

Usage limit check bypasses premium users:

```javascript
// lib/server/usage-db.js
async function canUse(ip, token) {
  const isPremium = await checkPremiumStatus(ip, token);
  if (isPremium) return true; // Unlimited access
  
  // Free users: check usage count
  const usage = await getUsage(ip, token);
  return usage.count < 5;
}
```

## File Upload Flow

1. User visits a utility page (e.g. `/utilities/merge`). The server renders `app/utilities/[tool]/page.js` which includes the `ToolRunner` client component.
2. The user selects or drags files into `ToolRunner`. The component shows a preview (client-side blob URL) and a list of selected files.
3. When the user clicks "Upload files", `ToolRunner` builds a `FormData` payload with:
   - `files[]` — each selected File appended as `files`
   - `tool` — the tool name (string)
  and POSTs it to: `/api/utilities/<tool>/fileprocess`
4. The API route `app/api/utilities/[tool]/fileprocess/route.js` calls `request.formData()` to parse the multipart upload, extracts files and the `tool` field, and saves files to disk using `actions/uploadFile.js`. It returns a JSON response `{ success, message, files }`.

Example client request (conceptual):

```bash
curl -X POST "http://localhost:3000/api/utilities/merge/fileprocess" \
  -F "tool=merge" \
  -F "files=@/path/to/doc1.pdf" \
  -F "files=@/path/to/doc2.pdf"
```

Example successful response:

```json
{ "success": true, "message": "2 file(s) uploaded to merge", "files": ["doc1.pdf","doc2.pdf"] }
```

## Preview behavior

- `ToolRunner` shows an immediate client-side preview (via `URL.createObjectURL`) for images and PDFs — this happens before upload and does not require server storage.
- If you need persistent previews across pages or devices, upload the file to the server (or cloud storage) and return a stable URL from the API. The project currently saves uploads to `uploads/<tool>/` (via `actions/uploadFile.js`) or falls back to `public/uploads/<tool>/`.

## Security & production notes

- Sanitize filenames before writing to disk. Currently the helper uses `file.name` — replace with a generated safe name (UUID) in production.
- Validate allowed MIME types and maximum file sizes server-side.
- Avoid saving sensitive files in `public/` if they should not be publicly accessible. Use private storage and an authenticated download route or signed URLs.
- For large files, avoid buffering the entire upload in memory — use streaming parsers or direct-to-cloud uploads.

## Next improvements (suggested)

- Add server-side validation (size/type) and filename sanitization. 
- Generate thumbnails for PDFs/images to speed up previews and gallery pages.
- Add job queue / background worker for CPU-bound processing (recommended for heavy PDF algorithms).
- Return stable URLs for uploaded files and store metadata in a small DB table (owner, timestamp, original name, url).

## Contributing

Feel free to open issues or PRs. The repository follows a small, focused approach — prefer tiny, testable utilities over large monoliths.

## License

This project does not include a LICENSE file by default. Add one if you plan to open-source the project.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
