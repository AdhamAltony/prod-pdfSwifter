export const runtime = 'nodejs';

// Temporary download route. Serves files saved by fileprocess route under uploads/tmp.
// Path pattern: /api/download/:id
// Expects two files: uploads/tmp/<id>.bin (binary) and uploads/tmp/<id>.json (metadata)
// Automatically cleans up old files (> 30 minutes) opportunistically.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const TMP_ROOT = path.join(process.cwd(), 'uploads', 'tmp');
const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

async function cleanupOld() {
  try {
    const entries = await fs.readdir(TMP_ROOT);
    const now = Date.now();
    for (const e of entries) {
      if (!e.endsWith('.json')) continue;
      const id = e.slice(0, -5);
      const metaPath = path.join(TMP_ROOT, e);
      try {
        const raw = await fs.readFile(metaPath, 'utf8');
        const meta = JSON.parse(raw);
        if (now - (meta.createdAt || 0) > MAX_AGE_MS) {
          // remove both meta and bin
            await fs.unlink(metaPath).catch(()=>{});
            await fs.unlink(path.join(TMP_ROOT, `${id}.bin`)).catch(()=>{});
        }
      } catch (err) {
        // ignore
      }
    }
  } catch (err) {
    // ignore cleanup errors
  }
}

export async function GET(request, { params }) {
    const modParams = await params
  const { id } = modParams || {};
  if (!id) {
    return new Response(JSON.stringify({ success: false, message: 'Missing id' }), { status: 400 });
  }
  try {
    await cleanupOld();
    const binPath = path.join(TMP_ROOT, `${id}.bin`);
    const metaPath = path.join(TMP_ROOT, `${id}.json`);
    const metaRaw = await fs.readFile(metaPath, 'utf8');
    const meta = JSON.parse(metaRaw);
    const data = await fs.readFile(binPath);

    const headers = {
      'Content-Type': meta.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${meta.filename || 'output'}"`,
      'Content-Length': String(meta.size || data.length),
      'Cache-Control': 'no-store',
    };
    return new Response(data, { status: 200, headers });
  } catch (err) {
    console.error('download error', err);
    return new Response(JSON.stringify({ success: false, message: 'Not found' }), { status: 404 });
  }
}
