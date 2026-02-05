import { cookies } from "next/headers";
import { getSessionCookieName, parseSessionToken } from "@/lib/auth/session";

export async function GET() {
  const store = await cookies();
  const token = store.get(getSessionCookieName())?.value;
  const session = parseSessionToken(token);
  if (!session) {
    return Response.json({ authenticated: false }, { status: 200 });
  }
  return Response.json({ authenticated: true, user: session.user }, { status: 200 });
}
