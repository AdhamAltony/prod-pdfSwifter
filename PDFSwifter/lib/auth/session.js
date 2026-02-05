import crypto from "node:crypto";

const DEFAULT_COOKIE = "auth_session";

const base64UrlEncode = (input) =>
  Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

const base64UrlDecode = (input) => {
  const padded = `${input}${"=".repeat((4 - (input.length % 4)) % 4)}`.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(padded, "base64").toString("utf8");
};

const getSecret = () => {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (process.env.NODE_ENV === "production" && !secret) {
    throw new Error("AUTH_SECRET must be set in production.");
  }
  return secret || "dev-secret-change-me";
};

const sign = (payload) => {
  const secret = getSecret();
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
};

export const createSessionToken = (session) => {
  const payload = base64UrlEncode(JSON.stringify(session));
  const signature = sign(payload);
  return `${payload}.${signature}`;
};

export const parseSessionToken = (token) => {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    return JSON.parse(base64UrlDecode(payload));
  } catch {
    return null;
  }
};

export const buildSessionCookie = ({
  name = DEFAULT_COOKIE,
  token,
  maxAgeDays = 7,
} = {}) => {
  const maxAge = maxAgeDays * 24 * 60 * 60;
  const secure = process.env.NODE_ENV === "production";
  const parts = [
    `${name}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
};

export const getSessionCookieName = () => DEFAULT_COOKIE;
