import { PDFDocument, degrees } from 'pdf-lib';

/**
 * rotate-pdf processor
 * --------------------
 * - Exports async `process(files, options)`
 * - `files` is an array of { name, type, buffer } where `buffer` is a Node Buffer
 * - `options` may contain tool-specific parameters (e.g., `angle`)
 *
 * Behavior:
 * - For each input PDF, rotate pages by `angle` degrees and produce a Buffer
 * - If exactly one file is uploaded, return an object shaped for direct download:
 *     { message, download: true, filename, buffer, contentType }
 *   The route handler will stream `buffer` back as the response with appropriate headers.
 * - If multiple files are uploaded, return metadata (buffers included) so callers
 *   can decide how to persist or bundle results (e.g., ZIP).
 */
export async function process(files = [], options = {}) {
  const angle = Number(options.angle);
  if (!Number.isFinite(angle)) {
    throw new Error("Rotation angle is required (e.g., 90).");
  }

  const results = [];
  for (const f of files) {
    const pdf = await PDFDocument.load(f.buffer);
    pdf.getPages().forEach(page => page.setRotation(degrees(angle)));
    const uint8 = await pdf.save();
    const buffer = Buffer.from(uint8);

    const filename = (f.name && `${Date.now()}-rotated-${f.name}`.replace(/[^a-zA-Z0-9._-]/g, '_')) || `${Date.now()}-rotated.pdf`;
    results.push({ original: f.name, filename, size: buffer.length, buffer, contentType: 'application/pdf' });
  }

  // Single-file: convenient direct-download response (route will stream)
  if (results.length === 1) {
    const r = results[0];
    return { message: `Rotated 1 file`, download: true, filename: r.filename, buffer: r.buffer, contentType: r.contentType };
  }

  // Multiple files: return results array (caller may ZIP or persist)
  return { message: `Rotated ${results.length} files`, files: results };
}
