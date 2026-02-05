import fs from "node:fs/promises";
import path from "node:path";

const pad = (value) => String(value).padStart(2, "0");
const getMonthKey = (date = new Date()) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      out._.push(a);
      continue;
    }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function usageAndExit(code = 1) {
  console.error(`\nUsage: node scripts/set-usage.mjs [options]\n\nRequired:\n  --tool <toolKey>\n\nIdentify client (choose one):\n  --userId <id>\n  --ip <ip> [--token <token>]\n\nOptional:\n  --month <YYYY-MM>        (default: current UTC month)\n  --count <number>         set exact usage count\n  --reset                  shorthand for --count 0\n  --delete                 delete the record entirely\n  --dataDir <path>         override data dir (else PDFTOOLS_DATA_DIR or ./data)\n  --printKey               print computed key\n\nExamples:\n  node scripts/set-usage.mjs --userId 42 --tool compress-pdf --reset\n  node scripts/set-usage.mjs --ip 203.0.113.10 --tool compress-pdf --month 2026-01 --count 0\n  node scripts/set-usage.mjs --ip 203.0.113.10 --token abc --tool compress-pdf --delete\n`);
  process.exit(code);
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

async function readJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

async function writeJsonAtomic(filePath, data) {
  const tmp = `${filePath}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, filePath);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const toolKey = String(args.tool || "").trim();
  if (!toolKey) usageAndExit(1);

  const userId = args.userId ? String(args.userId).trim() : "";
  const ip = args.ip ? String(args.ip).trim() : "";
  const token = args.token ? String(args.token).trim() : "";

  if (!userId && !ip) {
    console.error("Provide either --userId or --ip (optionally --token).\n");
    usageAndExit(1);
  }

  const monthKey = args.month ? String(args.month).trim() : getMonthKey();
  if (!/^\d{4}-\d{2}$/.test(monthKey)) {
    console.error(`Invalid --month: ${monthKey} (expected YYYY-MM)`);
    process.exit(2);
  }

  const shouldDelete = Boolean(args.delete);
  const shouldReset = Boolean(args.reset);
  const hasCount = typeof args.count !== "undefined";

  if (shouldDelete && (shouldReset || hasCount)) {
    console.error("Use either --delete OR (--count/--reset), not both.");
    process.exit(2);
  }

  let count = null;
  if (!shouldDelete) {
    if (shouldReset) {
      count = 0;
    } else if (hasCount) {
      const parsed = Number(args.count);
      if (!Number.isFinite(parsed) || parsed < 0) {
        console.error(`Invalid --count: ${args.count}`);
        process.exit(2);
      }
      count = Math.floor(parsed);
    } else {
      console.error("Missing action: provide --count, --reset, or --delete.");
      usageAndExit(2);
    }
  }

  const dataDir = args.dataDir
    ? path.resolve(String(args.dataDir))
    : process.env.PDFTOOLS_DATA_DIR
      ? path.resolve(process.env.PDFTOOLS_DATA_DIR)
      : path.join(process.cwd(), "data");

  await fs.mkdir(dataDir, { recursive: true });
  const dbPath = path.join(dataDir, "usage.json");

  const clientKey = getClientKey({ ip, token, userId });
  const key = getUsageKey({ clientKey, toolKey, monthKey });

  if (args.printKey) {
    console.log(key);
  }

  const db = await readJson(dbPath);

  if (shouldDelete) {
    const existed = Object.prototype.hasOwnProperty.call(db, key);
    delete db[key];
    await writeJsonAtomic(dbPath, db);
    console.log(existed ? `Deleted: ${key}` : `No-op (missing): ${key}`);
    return;
  }

  const now = new Date().toISOString();
  db[key] = { count, lastUsed: now };
  await writeJsonAtomic(dbPath, db);
  console.log(`Set count=${count} for ${key}`);
  console.log(`DB: ${dbPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
