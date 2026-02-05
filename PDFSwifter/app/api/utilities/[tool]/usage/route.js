export const runtime = 'nodejs';

import { getToolPolicy } from "@/lib/utilities/tools-policy";
import { canUseTool } from "@/lib/usage/usage-db";
import { getClientInfo } from "@/shared/utils/getClientInfo";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const tool = resolvedParams?.tool || "unknown";
    const policy = await getToolPolicy(tool);
    if (!policy.enabled) {
      return new Response(JSON.stringify({ success: false, message: "Tool disabled" }), { status: 403 });
    }

    const { ip, token } = getClientInfo(request, null);
    const status = await canUseTool({ ip, token, userId: null, toolKey: tool });
    return new Response(JSON.stringify({ success: true, usage: status }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), { status: 500 });
  }
}
