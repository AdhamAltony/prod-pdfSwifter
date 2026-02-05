import fs from "node:fs/promises";
import path from "node:path";
import { getToolsConfig } from "../tools/tools-config.js";

const DATA_DIR = process.env.PDFTOOLS_DATA_DIR || path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "usage.json");

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

async function readDB() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

async function writeDB(db) {
  const tmp = `${DB_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DB_PATH);
}

const pad = (value) => String(value).padStart(2, "0");

export function getMonthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

function getClientKey({ ip, token, userId }) {
  if (userId) return `user:${userId}`;
  const safeIp = ip || "unknown";
  const safeToken = token ? String(token) : "";
  return `ip:${safeIp}::token:${safeToken}`;
}

function getUsageKey({ clientKey, toolKey, monthKey }) {
  return `${clientKey}::${toolKey}::${monthKey}`;
}

export async function incrementUsage({ ip, token, userId, toolKey, date = new Date() }) {
  await ensureDir();
  const db = await readDB();
  const clientKey = getClientKey({ ip, token, userId });
  const monthKey = getMonthKey(date);
  const key = getUsageKey({ clientKey, toolKey, monthKey });
  const now = new Date().toISOString();

  const rec = db[key] || { count: 0, lastUsed: null };
  rec.count = (rec.count || 0) + 1;
  rec.lastUsed = now;
  db[key] = rec;
  await writeDB(db);
  return rec;
}

export async function getUsageStatus({ ip, token, userId, toolKey, date = new Date() }) {
  const plan = "free";
  const config = await getToolsConfig();
  const limit = config.plans?.standard?.monthlyLimit ?? null;
  const monthKey = getMonthKey(date);

  const clientKey = getClientKey({ ip, token, userId });
  const key = getUsageKey({ clientKey, toolKey, monthKey });
  const db = await readDB();
  const rec = db[key] || { count: 0 };

  const used = rec.count || 0;
  const remaining = limit === null ? null : Math.max(0, limit - used);
  const allowed = limit === null ? true : used < limit;

  return {
    plan,
    limit,
    used,
    remaining,
    period: "month",
    monthKey,
    allowed,
  };
}

export async function canUseTool({ ip, token, userId, toolKey, date = new Date() }) {
  return getUsageStatus({ ip, token, userId, toolKey, date });
}

// Premium detection based on orders.json (approved or captured)
async function checkPremiumStatus(ip, token) {
  try {
    const ordersPath = path.join(DATA_DIR, "orders.json");
    const ordersData = await fs.readFile(ordersPath, "utf-8");
    const { orders } = JSON.parse(ordersData);

    const approvedOrders = orders.filter(
      (order) =>
        order.ip === ip &&
        (order.status === "APPROVED" || order.status === "CAPTURED")
    );

    return approvedOrders.length > 0;
  } catch {
    return false;
  }
}

export async function getPlanForClient({ ip, token }) {
  return "free";
}
