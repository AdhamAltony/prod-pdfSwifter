import fs from "node:fs/promises";
import path from "node:path";
import { getToolsConfig } from "./tools-config.js";

const DATA_DIR = process.env.PDFTOOLS_DATA_DIR || path.join(process.cwd(), "data");
const METRICS_PATH = path.join(DATA_DIR, "tool-metrics.json");

const defaultMetrics = {
  tools: {},
  alerts: [],
};

const readMetrics = async () => {
  try {
    const raw = await fs.readFile(METRICS_PATH, "utf8");
    return JSON.parse(raw || "{}");
  } catch {
    return { ...defaultMetrics };
  }
};

const writeMetrics = async (metrics) => {
  const next = {
    tools: metrics.tools || {},
    alerts: metrics.alerts || [],
  };
  const tmp = `${METRICS_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(next, null, 2), "utf8");
  await fs.rename(tmp, METRICS_PATH);
};

const getWindowRate = (window = []) => {
  if (!window.length) return 1;
  const successes = window.filter(Boolean).length;
  return successes / window.length;
};

const appendAlert = (metrics, alert) => {
  metrics.alerts = metrics.alerts || [];
  metrics.alerts.push(alert);
  if (metrics.alerts.length > 200) {
    metrics.alerts = metrics.alerts.slice(-200);
  }
};

export async function recordToolRun(toolKey, success) {
  const config = await getToolsConfig();
  const { threshold, window: windowSize, minRuns } = config.reliability || {};
  const metrics = await readMetrics();
  const toolMetrics = metrics.tools?.[toolKey] || {
    window: [],
    totalRuns: 0,
    successRuns: 0,
    failRuns: 0,
    disabled: false,
  };

  toolMetrics.window = [...(toolMetrics.window || []), !!success].slice(-windowSize);
  toolMetrics.totalRuns = (toolMetrics.totalRuns || 0) + 1;
  toolMetrics.successRuns = (toolMetrics.successRuns || 0) + (success ? 1 : 0);
  toolMetrics.failRuns = (toolMetrics.failRuns || 0) + (success ? 0 : 1);
  toolMetrics.updatedAt = new Date().toISOString();

  const windowRate = getWindowRate(toolMetrics.window);
  toolMetrics.windowSuccessRate = Number(windowRate.toFixed(4));

  const shouldGate =
    toolMetrics.window.length >= (minRuns || windowSize) &&
    windowRate < (threshold ?? 0.95);

  if (shouldGate && !toolMetrics.disabled) {
    toolMetrics.disabled = true;
    toolMetrics.disabledAt = new Date().toISOString();
    toolMetrics.disabledReason = `Reliability ${Math.round(windowRate * 100)}% below ${Math.round(
      (threshold ?? 0.95) * 100
    )}%`;
    toolMetrics.lastAlertAt = toolMetrics.disabledAt;
    appendAlert(metrics, {
      tool: toolKey,
      type: "reliability_gate",
      successRate: toolMetrics.windowSuccessRate,
      threshold,
      window: toolMetrics.window.length,
      at: toolMetrics.disabledAt,
      message: toolMetrics.disabledReason,
    });
    console.error(
      `[tool-reliability] ${toolKey} disabled: ${toolMetrics.disabledReason}`
    );
  }

  metrics.tools = metrics.tools || {};
  metrics.tools[toolKey] = toolMetrics;
  await writeMetrics(metrics);

  return toolMetrics;
}

export async function getReliabilityStatus(toolKey) {
  const metrics = await readMetrics();
  const toolMetrics = metrics.tools?.[toolKey];
  if (!toolMetrics) {
    return { disabled: false, windowSuccessRate: 1, window: 0 };
  }
  return {
    disabled: !!toolMetrics.disabled,
    windowSuccessRate: toolMetrics.windowSuccessRate ?? getWindowRate(toolMetrics.window),
    window: toolMetrics.window?.length || 0,
    disabledReason: toolMetrics.disabledReason,
    disabledAt: toolMetrics.disabledAt,
  };
}
