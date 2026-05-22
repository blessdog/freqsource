import sql from "./db";

export type SignalItem = {
  rank_position: number | null;
  title: string | null;
  url: string | null;
  first_seen_at: string;
  source_class: string;
  source_subclass: string | null;
  comment_count: number;
  // editorial (the LLM curation layer — the actual product)
  why_it_matters: string;
  the_take: string | null;
  friction_summary: string | null;
  vendor_driven: boolean | null;
  worth_writing: boolean | null;
  horizon: string | null;
};

// The feed is the CURATED set: only stories the LLM judged as real signal and
// wrote a take on. Noise never reaches here. Ordered by the cheap rank within that set.
function curated(opts: { frictionOnly?: boolean; limit: number }) {
  return sql<SignalItem[]>`
    SELECT
      r.rank_position,
      i.title,
      i.url,
      i.first_seen_at,
      s.source_class::text AS source_class,
      s.source_subclass,
      COALESCE((SELECT count(*) FROM items c WHERE c.parent_item_id = i.id), 0)::int AS comment_count,
      e.why_it_matters,
      e.the_take,
      e.friction_summary,
      e.vendor_driven,
      e.worth_writing,
      e.horizon
    FROM item_editorial e
    JOIN items i   ON i.id = e.item_id
    JOIN sources s ON s.id = i.source_id
    LEFT JOIN rankings r ON r.item_id = i.id AND r.view = 'daily_signal'
      AND r.ranked_for_day = (SELECT max(ranked_for_day) FROM rankings WHERE view = 'daily_signal')
    WHERE e.why_it_matters IS NOT NULL
      ${opts.frictionOnly ? sql`AND e.friction_summary IS NOT NULL` : sql``}
    ORDER BY r.rank_position NULLS LAST
    LIMIT ${opts.limit}
  `;
}

export async function getDailySignal(limit = 40) {
  return curated({ limit });
}

export async function getFriction(limit = 40) {
  return curated({ frictionOnly: true, limit });
}
