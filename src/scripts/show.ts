// CLI: print the current top-ranked posts so you can sanity-check the spine
// without firing up the web app. Reads the same query the page uses.

import { initSchema } from '../lib/db.js';
import { topRankedPosts } from '../lib/rank.js';

initSchema();

const rows = topRankedPosts(25);
if (rows.length === 0) {
  console.log('no posts yet — run `npm run poll` first.');
  process.exit(0);
}

console.log(`Top ${rows.length} ranked posts (traction × source_weight × freshness):\n`);
for (const r of rows) {
  const ageH = ((Date.now() / 1000 - r.created_utc) / 3600).toFixed(1);
  const score = r.rank_score.toFixed(2);
  console.log(
    `  ${score.padStart(7)}  ${r.source_name.padEnd(22)}  ${ageH.padStart(5)}h  ↑${String(r.score).padStart(5)}  💬${String(r.num_comments).padStart(4)}  ${r.title.slice(0, 80)}`,
  );
}
