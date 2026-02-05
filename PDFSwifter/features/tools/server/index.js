// Static registry of available tool processors.
// Import modules here for static analysis and tree-shaking.
// Required for Next.js/Turbopack to analyze code at build-time and avoid dynamic imports.

import * as compressPdfModule from './compress-pdf.js';
import * as rotatePdfModule from './rotate-pdf.js';
import * as pdfToWordModule from './pdf-to-word.js';
import * as pdfToExcelModule from './pdf-to-excel.js';
import * as pdfToJpgModule from './pdf-to-jpg.js';
import * as tiktokDownloadModule from './tiktok-download.js';
import * as youtubeDownloadModule from './youtube-download.js';


// Named processor exports for code clarity and reuse.
export const compressPdfProcessor = compressPdfModule;
export const rotatePdfProcessor = rotatePdfModule;
export const tiktokDownloadProcessor = tiktokDownloadModule;
export const youtubeDownloadProcessor = youtubeDownloadModule;

// Central registry mapping tool keys to their modules.
// registry object lets you easily reference tools by key (e.g. registry['pdf-to-word'])
const registry = {
  'compress-pdf': compressPdfProcessor,
  'rotate-pdf': rotatePdfProcessor,
  'pdf-to-word': pdfToWordModule,
  'pdf-to-excel': pdfToExcelModule,
  'pdf-to-jpg': pdfToJpgModule,
  'tiktok-download': tiktokDownloadProcessor,
  'youtube-download': youtubeDownloadProcessor,
};

export default registry;

// Named convenience exports for direct imports.
// You can import these in other files with:
// import { pdfToWord, compressPdf } from '@/features/tools/server'
export const compressPdf = compressPdfProcessor;
export const rotatePdf = rotatePdfProcessor;
export const tiktokDownload = tiktokDownloadProcessor;
export const youtubeDownload = youtubeDownloadProcessor;
export const pdfToWord = pdfToWordModule;
export const pdfToExcel = pdfToExcelModule;
export const pdfToJpg = pdfToJpgModule;

// Note: Remove any redundant or duplicate imports/exports to avoid "already been declared" errors.
// If you add a new tool, just import the module above and add it to the registry and named exports.

// If 'exampleProcessor' is needed, define and import it above, otherwise comment/remove the next line.
// export const example = exampleProcessor;
