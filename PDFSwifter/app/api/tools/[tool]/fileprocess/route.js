export const runtime = 'nodejs';

import { processFilesForTool } from "@/features/utilities/server/processor";
import { canUseTool, getUsageStatus, incrementUsage } from "@/lib/usage/usage-db";
import { getClientInfo } from "@/shared/utils/getClientInfo";
import { getConnection } from "@/lib/db";
import { getToolPolicy } from "@/lib/utilities/tools-policy";
import sql from "mssql";

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const contentType = request.headers.get("content-type");
    let tool, files, options = {}, userId;
    
    if (contentType?.includes('application/json')) {
      // Handle URL-based tools (JSON payload)
      const body = await request.json();
      tool = body.tool || resolvedParams?.tool || "unknown";
      userId = body.user_id;
      
      if (!body.url) {
        return new Response(JSON.stringify({ success: false, message: "No URL provided" }), { status: 400 });
      }
      
      // For URL tools, we pass the URL as the "file" data
      files = [{ url: body.url, name: "url_input" }];
      options = body.options || {};
    } else {
      // Handle file-based tools (FormData)
      const form = await request.formData();
      files = form.getAll("files");
      const toolFromForm = form.get("tool");
      tool = toolFromForm || resolvedParams?.tool || "unknown";
      userId = form.get("user_id");
      
      if ( !files || !files.length )
      {
        return new Response(JSON.stringify({ success: false, message: "No files uploaded" }), { status: 400 });
      }
      
      const angleField = form.get("angle");
      const optionsField = form.get("options");
      if (optionsField) {
        try {
          options = JSON.parse(String(optionsField));
        } catch (e) {}
      }
      if (angleField && !options.angle) options.angle = Number(angleField);
    }

    const toolKey = String(tool || "")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .toLowerCase();
    const policy = await getToolPolicy(toolKey);
    if (!policy.enabled) {
      return new Response(
        JSON.stringify({
          success: false,
          code: "tool_disabled",
          message: "This tool is currently unavailable.",
          reason: policy.reason,
        }),
        { status: 403 }
      );
    }

    // Identify client by IP + token using shared helper
    const { ip, token } = getClientInfo(request, null);
    const usageBefore = await canUseTool({ ip, token, userId, toolKey });
    if (!usageBefore.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          code: "usage_limit",
          message: "Usage limit reached.",
          usage: usageBefore,
        }),
        { status: 429 }
      );
    }

    try {
      const result = await processFilesForTool(toolKey, files, options);
      const payload = result?.result;
      const toolSucceeded =
        result?.success !== false && result?.result?.success !== false;

      let toolId = null;
      try
      {
        const pool = await getConnection();
        const toolResult = await pool.request()
          .input( 'toolName', sql.NVarChar, tool )
          .query( 'SELECT id FROM Tools WHERE name = @toolName' );
        toolId = toolResult.recordset[ 0 ]?.id || null;
      } catch ( err )
      {
        toolId = null;
      }

      // Log user action only if we have a valid user_id and tool_id
      if (userId && toolId) {
        try {
          const pool = await getConnection();
          await pool
            .request()
            .input("userId", sql.Int, Number(userId))
            .input("toolId", sql.Int, toolId)
            .input("timestamp", sql.DateTime, new Date())
            .input("status", sql.NVarChar, toolSucceeded ? "completed" : "failed")
            .query(`
              INSERT INTO User_Actions (user_id, tool_id, timestamp, status)
              VALUES (@userId, @toolId, @timestamp, @status)
            `);
        } catch (dbErr) {
          console.error("User_Actions insert error:", dbErr);
        }
      }
      // Only proceed if processing succeeded
      if (result && result.success) {
        // Increment usage now that processing succeeded
        try {
          await incrementUsage({ ip, token, userId, toolKey });
          const updatedUsage = await getUsageStatus({ ip, token, userId, toolKey });
          result.usage = updatedUsage;
        } catch (e) {
          console.error("usage-db error", e);
        }

        // If the processor returned a direct download buffer for a single file,
        // instead of streaming immediately, persist temporarily and return a JSON downloadUrl
        if (payload && payload.download && payload.buffer) {
          try {
            const { writeFile, mkdir } = await import("node:fs/promises");
            const path = await import("node:path");
            const crypto = await import("node:crypto");

            const filename = payload.filename || 'output';
            const contentType = payload.contentType || 'application/octet-stream';

            const cwd = process.cwd();
            const tmpDir = path.join(cwd, "uploads", "tmp");
            await mkdir(tmpDir, { recursive: true });

            const id = crypto.randomBytes(12).toString('hex');
            const binPath = path.join(tmpDir, `${id}.bin`);
            const metaPath = path.join(tmpDir, `${id}.json`);

            const buf = Buffer.isBuffer(payload.buffer) ? payload.buffer : Buffer.from(payload.buffer);
            await writeFile(binPath, buf);
            await writeFile(metaPath, JSON.stringify({ filename, contentType, size: buf.length, createdAt: Date.now() }));

            const downloadUrl = `/api/download/${id}`;

            return new Response(
              JSON.stringify({
                success: true,
                message: result.message || 'Processing completed',
                result: { downloadUrl, filename, contentType, size: buf.length },
                usage: result?.usage || usageBefore,
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
          } catch (persistErr) {
            console.error("Error persisting temp download file", persistErr);
            const filename = payload.filename || 'output';
            const contentType = payload.contentType || 'application/octet-stream';
            const headers = {
              'Content-Type': contentType,
              'Content-Disposition': `attachment; filename="${filename}"`,
              'X-Usage-Limit': String(result?.usage?.limit ?? ""),
              'X-Usage-Remaining': String(result?.usage?.remaining ?? ""),
            };
            const data = Buffer.isBuffer(payload.buffer) ? payload.buffer : Buffer.from(payload.buffer);
            return new Response(data, { status: 200, headers });
          }
        }

        // JSON response: include remaining uses
        return new Response(
          JSON.stringify({
            success: true,
            message: result.message || 'Processing completed',
            result: payload,
            usage: result?.usage || usageBefore,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // If no processor was found or it failed
      return new Response(
        JSON.stringify({
          success: false,
          message: result?.message || "No processor for this tool; processing not performed",
          usage: usageBefore,
        }),
        { status: 202 }
      );
    } catch (err) {
      console.error("Processor error:", err);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Processor error",
          error: String(err),
          usage: usageBefore,
        }),
        { status: 500 }
      );
    }
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), { status: 500 });
  }
}
