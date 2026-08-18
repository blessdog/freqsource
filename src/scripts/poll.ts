// CLI entrypoint for one polling pass. Cron-friendly — pipe into a logfile
// from `crontab -e` (or later a hosted scheduler) every ~15 min:
//   */15 * * * * cd /path/to/freaksource && npm run poll >> data/poll.log 2>&1

import { initSchema } from '../lib/db.js';
import { pollAllSources } from '../lib/ingest.js';

async function main(): Promise<void> {
  initSchema(); // safety: cron'd machine may not have run init-db recently

  const t0 = Date.now();
  const results = await pollAllSources();
  const dt = Math.round((Date.now() - t0) / 100) / 10;

  let totalFetched = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  const errors: string[] = [];

  for (const r of results) {
    totalFetched += r.fetched;
    totalInserted += r.inserted;
    totalUpdated += r.updated;
    if (r.error) errors.push(`${r.source}: ${r.error}`);

    const line = r.error
      ? `  ✗ ${r.source.padEnd(22)} ERROR  ${r.error}`
      : `  ✓ ${r.source.padEnd(22)} fetched=${String(r.fetched).padStart(3)}  new=${String(r.inserted).padStart(3)}  updated=${String(r.updated).padStart(3)}`;
    console.log(line);
  }

  console.log(`poll done in ${dt}s — sources=${results.length} fetched=${totalFetched} new=${totalInserted} updated=${totalUpdated} errors=${errors.length}`);
  if (errors.length > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error('poll failed:', e);
  process.exit(1);
});
