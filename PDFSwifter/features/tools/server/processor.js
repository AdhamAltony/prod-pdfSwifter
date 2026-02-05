
import * as tools from './index.js';

export async function processFilesForTool(tool, files, options = {}) {
  // normalize tool name and look up the processor in the static registry
  const safeTool = String(tool).replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  // tools may be a module namespace; the index file exports a default registry object.
  const registry = tools.default || tools;
  const mod = registry[safeTool] || tools[safeTool];

  if (!mod || typeof mod.process !== 'function') {
    return { success: false, message: `No processor implemented for tool '${tool}'` };
  }

  const prepared = await Promise.all(files.map(async (file) => {
    // Handle URL-based tools (like TikTok download)
    if (file.url && file.name === 'url_input') {
      return {
        url: file.url,
        name: file.name,
        type: 'url/input',
      };
    }
    
    // Handle regular file uploads
    const arrayBuffer = await file.arrayBuffer();
    return {
      name: file.name || `file-${Date.now()}`,
      type: file.type || 'application/octet-stream',
      buffer: Buffer.from(arrayBuffer),
    };
  }));

  // Call the tool-specific processor. Let errors propagate so the route can log them.
  const result = await mod.process(prepared, options);
  return { success: true, result, message: result?.message };
}
