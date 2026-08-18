// Create schema (idempotent) and upsert the seed sources. Safe to re-run; a
// change to a seed row's weight/notes here will overwrite the DB row on the
// next init-db. We intentionally do NOT overwrite `active` so a manually
// disabled source stays disabled across re-seeds.

import { db, initSchema } from '../lib/db.js';
import { SEED_SOURCES } from '../lib/sources.js';

initSchema();

const d = db();
const now = Math.floor(Date.now() / 1000);

const upsert = d.prepare(`
  INSERT INTO sources (
    name, homepage_url, source_class, source_subclass,
    source_weight, originality_score, promo_risk, trust_notes,
    active, added_at
  ) VALUES (
    @name, @homepage_url, @source_class, @source_subclass,
    @source_weight, @originality_score, @promo_risk, @trust_notes,
    1, @added_at
  )
  ON CONFLICT(name) DO UPDATE SET
    homepage_url      = excluded.homepage_url,
    source_class      = excluded.source_class,
    source_subclass   = excluded.source_subclass,
    source_weight     = excluded.source_weight,
    originality_score = excluded.originality_score,
    promo_risk        = excluded.promo_risk,
    trust_notes       = excluded.trust_notes
`);

const tx = d.transaction(() => {
  for (const s of SEED_SOURCES) upsert.run({ ...s, added_at: now });
});
tx();

const count = d.prepare('SELECT COUNT(*) as n FROM sources WHERE active = 1').get() as { n: number };
console.log(`init-db: schema ready, ${count.n} active sources seeded.`);
for (const row of d.prepare('SELECT name, source_weight, trust_notes FROM sources ORDER BY source_weight DESC').all() as Array<{
  name: string;
  source_weight: number;
  trust_notes: string;
}>) {
  console.log(`  ${row.source_weight.toFixed(1)}  ${row.name.padEnd(22)}  ${row.trust_notes}`);
}
