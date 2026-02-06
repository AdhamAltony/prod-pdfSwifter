import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_CONFIG = {
  plans: {
    standard: { monthlyLimit: null },
    premium: { monthlyLimit: null },
  },
  reliability: {
    threshold: 0.95,
    window: 50,
    minRuns: 20,
  },
  tools: {
    "compress-pdf": { enabled: true, tier: "freemium" },
    "rotate-pdf": { enabled: true, tier: "freemium" },
    "pdf-to-excel": { enabled: true, tier: "freemium" },
    "pdf-to-jpg": { enabled: true, tier: "freemium" },
    "tiktok-download": { enabled: true, tier: "freemium" },
    "youtube-download": { enabled: false, tier: "freemium" },
    "instagram-download": { enabled: true, tier: "freemium" },
    "pdf-to-word": { enabled: true, tier: "freemium" },
  },
  overrides: {
    forceEnable: [],
    forceDisable: [],
  },
};

const DATA_DIR = process.env.PDFTOOLS_DATA_DIR || path.join(process.cwd(), "data");
const CONFIG_PATH = path.join(DATA_DIR, "tools-config.json");

const mergeConfig = (base, override) => ({
  ...base,
  ...override,
  plans: { ...base.plans, ...override?.plans },
  reliability: { ...base.reliability, ...override?.reliability },
  tools: { ...base.tools, ...override?.tools },
  overrides: { ...base.overrides, ...override?.overrides },
});

const readJson = async (filePath, fallback) => {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw || "{}");
    return mergeConfig(fallback, parsed);
  } catch {
    return fallback;
  }
};

export async function getToolsConfig() {
  return readJson(CONFIG_PATH, DEFAULT_CONFIG);
}

export function getConfigPaths() {
  return { DATA_DIR, CONFIG_PATH };
}
