import { getToolsConfig } from "./tools-config.js";
import { getReliabilityStatus } from "./reliability-gate.js";

const normalizeKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

export async function getToolPolicy(toolKey) {
  const config = await getToolsConfig();
  const normalized = normalizeKey(toolKey);
  const toolConfig = config.tools?.[normalized];

  if (!toolConfig) {
    return { enabled: false, reason: "not_configured" };
  }

  const forceEnable = new Set(config.overrides?.forceEnable || []);
  const forceDisable = new Set(config.overrides?.forceDisable || []);

  if (forceDisable.has(normalized)) {
    return { enabled: false, reason: "forced_disabled" };
  }

  if (toolConfig.hardDisabled && !forceEnable.has(normalized)) {
    return { enabled: false, reason: "hard_disabled" };
  }

  if (!toolConfig.enabled && !forceEnable.has(normalized)) {
    return { enabled: false, reason: "disabled" };
  }

  const reliability = await getReliabilityStatus(normalized);
  if (reliability.disabled) {
    return { enabled: false, reason: "reliability_gate", reliability };
  }

  return {
    enabled: true,
    tier: toolConfig.tier || "freemium",
    reliability,
  };
}

export async function getAllowedToolKeys() {
  const config = await getToolsConfig();
  const keys = Object.keys(config.tools || {});
  const allowed = [];
  for (const key of keys) {
    const policy = await getToolPolicy(key);
    if (policy.enabled) allowed.push(key);
  }
  return allowed;
}

export async function getPlanLimits() {
  const config = await getToolsConfig();
  return config.plans || {};
}
