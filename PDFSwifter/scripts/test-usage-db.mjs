import { incrementUsage, getUsageStatus } from '../lib/usage/usage-db.js';

async function run() {
  const ip = '127.0.0.1';
  const token = 'test-token';
  console.log('Starting usage test for', ip, token);
  console.log('Status (before):', await getUsageStatus({ ip, token, toolKey: 'compress-pdf' }));
  console.log('Incrementing...');
  const rec = await incrementUsage({ ip, token, toolKey: 'compress-pdf' });
  console.log('After increment:', rec);
  console.log('Status (after):', await getUsageStatus({ ip, token, toolKey: 'compress-pdf' }));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
