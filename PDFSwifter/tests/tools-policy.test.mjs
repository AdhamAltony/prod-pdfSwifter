import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "pdf-tools-"));
process.env.PDFTOOLS_DATA_DIR = tempDir;

const writeConfig = async (config) => {
  await fs.writeFile(
    path.join(tempDir, "tools-config.json"),
    JSON.stringify(config, null, 2),
    "utf8"
  );
};

const writeOrders = async (orders) => {
  await fs.writeFile(
    path.join(tempDir, "orders.json"),
    JSON.stringify({ orders }, null, 2),
    "utf8"
  );
};

await writeConfig({
  plans: {
    standard: { monthlyLimit: 3 },
    premium: { monthlyLimit: null },
  },
  reliability: { threshold: 0.95, window: 5, minRuns: 3 },
  tools: {
    "compress-pdf": { enabled: true, tier: "freemium" },
    "pdf-to-word": { enabled: false, tier: "premium", hardDisabled: true },
  },
  overrides: { forceEnable: [], forceDisable: [] },
});

await writeOrders([]);

const { incrementUsage, getUsageStatus } = await import("../lib/usage/usage-db.js");
const { recordToolRun, getReliabilityStatus } = await import("../lib/tools/reliability-gate.js");
const { getToolPolicy, getAllowedToolKeys } = await import("../lib/tools/tools-policy.js");

test("Tools & limits policy suite", async (t) => {
  await t.test("Standard plan is limited to 3 uses per tool per month", async () => {
    const client = { ip: "1.2.3.4", token: "demo", toolKey: "compress-pdf" };
    let status = await getUsageStatus(client);
    assert.equal(status.plan, "standard");
    assert.equal(status.remaining, 3);
    assert.equal(status.allowed, true);

    await incrementUsage({ ...client });
    await incrementUsage({ ...client });
    await incrementUsage({ ...client });

    status = await getUsageStatus(client);
    assert.equal(status.remaining, 0);
    assert.equal(status.allowed, false);
  });

  await t.test("Monthly usage resets for a new month", async () => {
    const client = { ip: "5.6.7.8", token: "", toolKey: "compress-pdf" };
    const october = new Date(Date.UTC(2024, 9, 2));
    const november = new Date(Date.UTC(2024, 10, 2));

    await incrementUsage({ ...client, date: october });
    await incrementUsage({ ...client, date: october });

    const octoberStatus = await getUsageStatus({ ...client, date: october });
    const novemberStatus = await getUsageStatus({ ...client, date: november });

    assert.equal(octoberStatus.remaining, 1);
    assert.equal(novemberStatus.remaining, 3);
  });

  await t.test("Premium plan has unlimited usage", async () => {
    await writeOrders([{ ip: "9.9.9.9", status: "APPROVED" }]);

    const client = { ip: "9.9.9.9", token: "pro", toolKey: "compress-pdf" };
    const status = await getUsageStatus(client);
    assert.equal(status.plan, "premium");
    assert.equal(status.limit, null);
    assert.equal(status.allowed, true);
  });

  await t.test("Hard-disabled tools remain disabled unless explicitly overridden", async () => {
    let policy = await getToolPolicy("pdf-to-word");
    assert.equal(policy.enabled, false);
    assert.equal(policy.reason, "hard_disabled");

    await writeConfig({
      plans: {
        standard: { monthlyLimit: 3 },
        premium: { monthlyLimit: null },
      },
      reliability: { threshold: 0.95, window: 5, minRuns: 3 },
      tools: {
        "compress-pdf": { enabled: true, tier: "freemium" },
        "pdf-to-word": { enabled: true, tier: "premium", hardDisabled: true },
      },
      overrides: { forceEnable: ["pdf-to-word"], forceDisable: [] },
    });

    policy = await getToolPolicy("pdf-to-word");
    assert.equal(policy.enabled, true);
  });

  await t.test("Reliability gate disables tools below threshold", async () => {
    await recordToolRun("compress-pdf", false);
    await recordToolRun("compress-pdf", false);
    await recordToolRun("compress-pdf", false);

    const reliability = await getReliabilityStatus("compress-pdf");
    assert.equal(reliability.disabled, true);

    const allowed = await getAllowedToolKeys();
    assert.equal(allowed.includes("compress-pdf"), false);
  });
});
