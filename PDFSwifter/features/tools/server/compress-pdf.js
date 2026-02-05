import axios from 'axios';
import FormData from 'form-data';

const env = (typeof process !== "undefined" && process.env) ? process.env : {};
const PDF_API_BASE = (
  env.API_BASE_URL ||
  env.PDF_API_BASE_URL ||
  env.PDF_CONVERTER_API_BASE_URL ||
  'https://api.pdfswifter.com'
).replace(/\/$/, '');

export async function process(files, options = {}) {
  if (!files || files.length === 0) {
    throw new Error('compress-pdf: no files provided');
  }

  const file = files[0];
  const originalName = file.name || 'input.pdf';
  if (!/\.pdf$/i.test(originalName) && !(file.type && file.type.includes('pdf'))) {
    throw new Error('compress-pdf: only PDF files are supported');
  }

  const form = new FormData();
  form.append('file', file.buffer, { filename: originalName, contentType: file.type || 'application/pdf' });
  if (options.level) {
    form.append('level', String(options.level));
  }

  const response = await axios.post(`${PDF_API_BASE}/pdf/compress`, form, {
    responseType: 'arraybuffer',
    headers: form.getHeaders(),
    timeout: 60000,
  });

  const contentType = response.headers['content-type'] || 'application/json';
  if (contentType.includes('application/json') || contentType.startsWith('text/')) {
    const text = Buffer.from(response.data).toString('utf8');
    let payload = null;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
    if (payload?.process_id) {
      return await fetchRemoteCompressionFile(payload.process_id, originalName);
    }
    throw new Error(payload?.error || payload?.message || payload?.detail || text || 'Compression failed');
  }

  const disposition = response.headers['content-disposition'] || '';
  const filenameMatch = disposition.match(/filename=\"?([^\";]+)\"?/i);
  const filename = filenameMatch ? filenameMatch[1] : originalName.replace(/\.pdf$/i, '') + '-compressed.pdf';

  return {
    download: true,
    filename,
    buffer: Buffer.from(response.data),
    contentType,
  };
}

async function fetchRemoteCompressionFile(processId, originalName) {
  const statusUrl = `${PDF_API_BASE}/downloads/${processId}`;
  const fileUrl = `${PDF_API_BASE}/downloads/${processId}/file`;

  for (let i = 0; i < 30; i += 1) {
    const statusRes = await axios.get(statusUrl, { timeout: 10000 });
    const payload = statusRes.data || {};
    const status = payload.status || '';
    if (status === 'failed') {
      throw new Error(payload.error || 'Remote compression failed');
    }
    if (status === 'completed' && payload.file_exists) {
      const res = await axios.get(fileUrl, { responseType: 'arraybuffer', timeout: 60000 });
      const contentType = res.headers['content-type'] || 'application/pdf';
      const disposition = res.headers['content-disposition'] || '';
      const filenameMatch = disposition.match(/filename=\"?([^\";]+)\"?/i);
      const filename =
        filenameMatch || payload.suggested_name
          ? (filenameMatch ? filenameMatch[1] : payload.suggested_name)
          : originalName.replace(/\.pdf$/i, '') + '-compressed.pdf';
      return {
        download: true,
        filename,
        buffer: Buffer.from(res.data),
        contentType,
      };
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('Remote compression did not finish in time.');
}
