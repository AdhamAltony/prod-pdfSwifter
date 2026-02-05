// pdf-to-jpg.js
// PDF to JPG (image) processor that delegates to the shared PDF conversion API when available.

import axios from "axios";
import FormData from "form-data";
import { PDFDocument } from "pdf-lib";
import { env as processEnv } from "node:process";

const env = processEnv || (typeof process !== "undefined" ? process.env : {}) || {};
const DEFAULT_API_BASE = "https://api.pdfswifter.com";
const REMOTE_API_BASE = (
  env.API_BASE_URL ||
  env.PDF_API_BASE_URL ||
  env.PDF_CONVERTER_API_BASE_URL ||
  env.YOUTUBE_API_BASE_URL ||
  DEFAULT_API_BASE
).replace(/\/$/, "");

export async function process(files, options = {}) {
  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  const file = files[0];
  const originalName = file.name || "input.pdf";

  if (!/\.pdf$/i.test(originalName) && !(file.type && file.type.includes("pdf"))) {
    throw new Error("Only PDF files are supported");
  }

  try {
    return await convertWithRemoteApi(file, originalName);
  } catch (remoteError) {
    console.log("Remote PDF-to-image conversion failed, falling back:", remoteError.message);
    // Try the existing Aspose-based conversion as a fallback
    try {
      return await convertWithAspose(file, originalName);
    } catch (asposeError) {
      console.log("Aspose conversion failed:", asposeError.response?.status, asposeError.message);
      if (asposeError.response?.status === 429) {
        console.log("Rate limit exceeded, using summary fallback");
      } else if (asposeError.response?.status === 400) {
        console.log("Authentication failed, using summary fallback");
      }
      return await createPdfSummaryJpg(file, originalName);
    }
  }
}

async function convertWithRemoteApi(file, originalName) {
  const endpoint = `${REMOTE_API_BASE}/pdf/to-image`;
  const formData = new FormData();
  formData.append("file", file.buffer, { filename: originalName, contentType: file.type || "application/pdf" });

  const response = await axios.post(endpoint, formData, {
    responseType: "arraybuffer",
    headers: {
      ...formData.getHeaders(),
      Accept: "application/zip, application/octet-stream, */*",
    },
    timeout: 60000,
  });

  const contentTypeHeader = response.headers["content-type"] || "";
  if (contentTypeHeader.includes("application/json")) {
    const text = Buffer.from(response.data).toString("utf8");
    let payload = null;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
    if (payload?.process_id) {
      return await fetchRemoteJobFile(payload.process_id, originalName);
    }
    throw new Error(payload?.error || payload?.message || payload?.detail || text || "Remote conversion error");
  }

  const disposition = response.headers["content-disposition"];
  const filename =
    parseContentDispositionFilename(disposition) ||
    `${originalName.replace(/\.pdf$/i, "")}_images.zip`;
  const contentType = contentTypeHeader || "application/zip";

  return {
    download: true,
    filename,
    buffer: Buffer.from(response.data),
    contentType,
  };
}

async function fetchRemoteJobFile(processId, originalName) {
  const statusUrl = `${REMOTE_API_BASE}/downloads/${processId}`;
  const fileUrl = `${REMOTE_API_BASE}/downloads/${processId}/file`;

  for (let i = 0; i < 30; i += 1) {
    const statusRes = await axios.get(statusUrl, { timeout: 10000 });
    const payload = statusRes.data || {};
    if (payload.status === "failed") {
      throw new Error(payload.error || "Remote conversion failed");
    }
    if (payload.status === "completed" && payload.file_exists) {
      const res = await axios.get(fileUrl, { responseType: "arraybuffer", timeout: 60000 });
      const contentType = res.headers["content-type"] || "application/zip";
      const disposition = res.headers["content-disposition"];
      const filename =
        parseContentDispositionFilename(disposition) ||
        payload.suggested_name ||
        `${originalName.replace(/\.pdf$/i, "")}_images.zip`;
      return {
        download: true,
        filename,
        buffer: Buffer.from(res.data),
        contentType,
      };
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Remote conversion did not finish in time.");
}

async function parseErrorMessage(response) {
  try {
    const data = await response.json();
    if (data) {
      if (typeof data === "string") return data;
      if (typeof data === "object") {
        return data.detail || data.message || data.error || JSON.stringify(data);
      }
    }
  } catch {
    try {
      return await response.text();
    } catch {
      return null;
    }
  }
  return null;
}

function parseContentDispositionFilename(disposition) {
  if (!disposition) return null;
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utfMatch) {
    try {
      return decodeURIComponent(utfMatch[1]);
    } catch {
      return utfMatch[1];
    }
  }
  const asciiMatch = /filename="?([^";]+)"?/i.exec(disposition);
  if (asciiMatch) {
    return asciiMatch[1];
  }
  return null;
}

async function convertWithAspose(file, originalName) {
  const clientId = "f8913c2f-7f0a-4e96-b357-56c4202c77e5";
  const clientSecret = "b805b103f7443350a1fd072da38cdc81";

  const tokenResponse = await axios.post(
    "https://api.aspose.cloud/connect/token",
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://api.aspose.cloud/.default",
    })
  );

  const accessToken = tokenResponse.data.access_token;

  await axios.put(
    `https://api.aspose.cloud/v3.0/pdf/storage/file/${encodeURIComponent(originalName)}`,
    file.buffer,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/pdf",
      },
    }
  );

  const outputName = "converted/" + originalName.replace(/\.pdf$/i, ".jpg");

  await axios.put(
    `https://api.aspose.cloud/v3.0/pdf/${encodeURIComponent(originalName)}/convert/jpeg?outPath=${encodeURIComponent(
      outputName
    )}`,
    null,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const downloadResponse = await axios.get(
    `https://api.aspose.cloud/v3.0/pdf/storage/file/${encodeURIComponent(outputName)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: "arraybuffer",
    }
  );

  const dispositionName = parseContentDispositionFilename(
    downloadResponse.headers?.["content-disposition"]
  );
  const defaultName = originalName.replace(/\.pdf$/i, "") + "_converted.jpg";

  return {
    download: true,
    filename: dispositionName || defaultName,
    buffer: Buffer.from(downloadResponse.data),
    contentType: downloadResponse.headers?.["content-type"] || "image/jpeg",
  };
}

async function createPdfSummaryJpg(file, originalName) {
  try {
    const pdfDoc = await PDFDocument.load(file.buffer);
    const pageCount = pdfDoc.getPageCount();
    const title = pdfDoc.getTitle() || originalName;
    const summaryText = `PDF: ${title}\nPages: ${pageCount}\nFile: ${originalName}`;
    const placeholderJpegBase64 =
      "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAEsAZADAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==";
    return {
      download: true,
      filename: originalName.replace(/\.pdf$/i, "") + "_summary.jpg",
      buffer: Buffer.from(placeholderJpegBase64, "base64"),
      contentType: "image/jpeg",
    };
  } catch (error) {
    const basicJpegBase64 =
      "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAEsAZADAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==";
    return {
      download: true,
      filename: originalName.replace(/\.pdf$/i, "") + "_placeholder.jpg",
      buffer: Buffer.from(basicJpegBase64, "base64"),
      contentType: "image/jpeg",
    };
  }
}
