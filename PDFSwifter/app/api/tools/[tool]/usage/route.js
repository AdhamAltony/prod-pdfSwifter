import { getToolPolicy } from "@/lib/utilities/tools-policy";
import { getUsageStatus } from "@/lib/usage/usage-db";
import { getClientInfo } from "@/shared/utils/getClientInfo";

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const toolKey = String(resolvedParams?.tool || "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toLowerCase();
  const policy = await getToolPolicy(toolKey);

  if (!policy.enabled) {
    return new Response(
      JSON.stringify({
        success: false,
        code: "tool_disabled",
        message:
          policy.reason === "reliability_gate"
            ? "This tool is temporarily unavailable due to reliability checks."
            : "This tool is currently unavailable.",
        reason: policy.reason,
      }),
      { status: 403 }
    );
  }

  const { ip, token } = getClientInfo(request, null);
  const usage = await getUsageStatus({ ip, token, toolKey });

  return new Response(
    JSON.stringify({ success: true, tool: toolKey, usage }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
