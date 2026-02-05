import { getSessionCookieName } from "@/lib/auth/session";

export async function POST() {
  const response = new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
  response.headers.set(
    "Set-Cookie",
    `${getSessionCookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
  return response;
}
