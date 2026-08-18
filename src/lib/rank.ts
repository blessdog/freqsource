// Stage-1 ranking. Intentionally simple — we'll iterate once we see real
// data on the page. The shape:
//
//   traction        = (score + 2 * num_comments) / max(age_hours, 0.5)
//   freshness       = exp(-age_hours / HALF_LIFE_HOURS)        // recency decay
//   rank_score      = traction × source_weight × freshness
//
// `traction` captures "people are actually engaging" (comments weighted 2×
// since a comment is more effort than an upvote). `freshness` keeps the feed
// from being dominated by old viral posts even if they earned high traction
// once. `source_weight` is your editorial multiplier (LocalLLaMA's 1.3 vs.
// aiwars's 0.9). Posts older than MAX_AGE_HOURS are excluded so we never
// show a 3-week-old thread on the front page.

import { db } from './db.js';

const HALF_LIFE_HOURS = 24;       // ~1 day half-life: yesterday's top ≈ today's #2
const MAX_AGE_HOURS = 24 * 7;     // hide anything older than a week

export interface RankedPost {
  id: string;
  source_name: string;
  source_weight: number;
  title: string;
  url: string;
  permalink: string;
  author: string;
  thumbnail: string;
  is_self: number;
  is_video: number;
  over_18: number;
  score: number;
  num_comments: number;
  upvote_ratio: number;
  created_utc: number;
  first_seen_utc: number;
  rank_score: number;
}

interface Row {
  id: string;
  source_name: string;
  source_weight: number;
  title: string;
  url: string;
  permalink: string;
  author: string;
  thumbnail: string;
  is_self: number;
  is_video: number;
  over_18: number;
  score: number;
  num_comments: number;
  upvote_ratio: number;
  created_utc: number;
  first_seen_utc: number;
}

export function topRankedPosts(limit = 100): RankedPost[] {
  const d = db();
  const now = Math.floor(Date.now() / 1000);
  const oldest = now - MAX_AGE_HOURS * 3600;

  const rows = d
    .prepare(
      `SELECT p.id, p.source_name, s.source_weight, p.title, p.url, p.permalink,
              p.author, p.thumbnail, p.is_self, p.is_video, p.over_18,
              p.score, p.num_comments, p.upvote_ratio,
              p.created_utc, p.first_seen_utc
         FROM posts p
         JOIN sources s ON s.name = p.source_name
        WHERE p.created_utc >= ?
          AND s.active = 1`,
    )
    .all(oldest) as Row[];

  const scored: RankedPost[] = rows.map((r) => {
    const ageHours = Math.max((now - r.created_utc) / 3600, 0.5);
    const traction = (r.score + 2 * r.num_comments) / ageHours;
    const freshness = Math.exp(-ageHours / HALF_LIFE_HOURS);
    const rank_score = traction * r.source_weight * freshness;
    return { ...r, rank_score };
  });

  scored.sort((a, b) => b.rank_score - a.rank_score);
  return scored.slice(0, limit);
}
