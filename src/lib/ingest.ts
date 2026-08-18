// One polling pass: for each active source, fetch /new and upsert. Dedup on
// reddit post id. New rows get first_seen_utc; existing rows refresh their
// score/num_comments/last_seen_utc so the traction scorer sees current numbers.
//
// Politeness: we sleep briefly between subs so a 6-sub poll spreads over ~3s
// instead of slamming Reddit with parallel requests.

import { db } from './db.js';
import { fetchSubredditNew, RedditRateLimitError, type RedditPost } from './reddit.js';

interface SourceRow {
  name: string;
  active: number;
}

interface PollResult {
  source: string;
  fetched: number;
  inserted: number;
  updated: number;
  error?: string;
}

const SLEEP_BETWEEN_SUBS_MS = 500;

export async function pollAllSources(): Promise<PollResult[]> {
  const d = db();
  const sources = d
    .prepare('SELECT name, active FROM sources WHERE active = 1 ORDER BY name')
    .all() as SourceRow[];

  const results: PollResult[] = [];
  for (const s of sources) {
    results.push(await pollOne(s.name));
    await sleep(SLEEP_BETWEEN_SUBS_MS);
  }
  return results;
}

export async function pollOne(sourceName: string): Promise<PollResult> {
  const result: PollResult = { source: sourceName, fetched: 0, inserted: 0, updated: 0 };
  try {
    const posts = await fetchSubredditNew(sourceName);
    result.fetched = posts.length;
    const { inserted, updated } = upsertPosts(sourceName, posts);
    result.inserted = inserted;
    result.updated = updated;
  } catch (e) {
    if (e instanceof RedditRateLimitError) {
      result.error = `rate_limited (retry-after ${e.retryAfterSec}s)`;
    } else {
      result.error = e instanceof Error ? e.message : String(e);
    }
  }
  return result;
}

function upsertPosts(sourceName: string, posts: RedditPost[]): { inserted: number; updated: number } {
  const d = db();
  const now = Math.floor(Date.now() / 1000);

  // Pre-check which ids already exist so we can report inserted vs updated
  // counts. SQLite's RETURNING + ON CONFLICT doesn't distinguish cleanly.
  const existing = new Set<string>(
    (d.prepare('SELECT id FROM posts WHERE source_name = ?').all(sourceName) as Array<{ id: string }>)
      .map((r) => r.id),
  );

  const upsert = d.prepare(`
    INSERT INTO posts (
      id, source_name, title, selftext, url, permalink, author, thumbnail,
      is_self, is_video, over_18, score, num_comments, upvote_ratio,
      created_utc, first_seen_utc, last_seen_utc
    ) VALUES (
      @id, @source_name, @title, @selftext, @url, @permalink, @author, @thumbnail,
      @is_self, @is_video, @over_18, @score, @num_comments, @upvote_ratio,
      @created_utc, @first_seen_utc, @last_seen_utc
    )
    ON CONFLICT(id) DO UPDATE SET
      score          = excluded.score,
      num_comments   = excluded.num_comments,
      upvote_ratio   = excluded.upvote_ratio,
      last_seen_utc  = excluded.last_seen_utc
  `);

  let inserted = 0;
  let updated = 0;
  const tx = d.transaction((rows: RedditPost[]) => {
    for (const p of rows) {
      const isNew = !existing.has(p.id);
      upsert.run({
        id: p.id,
        source_name: sourceName,
        title: p.title,
        selftext: p.selftext,
        url: p.url,
        permalink: `https://reddit.com${p.permalink}`,
        author: p.author,
        thumbnail: p.thumbnail,
        is_self: p.is_self ? 1 : 0,
        is_video: p.is_video ? 1 : 0,
        over_18: p.over_18 ? 1 : 0,
        score: p.score,
        num_comments: p.num_comments,
        upvote_ratio: p.upvote_ratio,
        created_utc: p.created_utc,
        first_seen_utc: now,
        last_seen_utc: now,
      });
      if (isNew) inserted++;
      else updated++;
    }
  });
  tx(posts);

  return { inserted, updated };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
