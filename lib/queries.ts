import sql from "./db";

export type RankComponents = {
  novelty: number;
  friction: number;
  evidence: number;
  source_diversity: number;
  practitioner_validation: number;
  labor_policy: number;
  spread: number;
  promo_risk: number;
  derivative_density: number;
  official_pr_dominance: number;
  comment_count: number;
  anti_pr_capped: boolean;
  loud_only: boolean;
};

export type SignalItem = {
  rank_position: number;
  score: number;
  components: RankComponents;
  title: string | null;
  url: string | null;
  first_seen_at: string;
  item_role: string | null;
  primary_vs_derivative: string | null;
  booing: boolean;
  source_class: string;
  source_subclass: string | null;
};

function rows(view: "daily_signal" | "friction", limit: number) {
  return sql<SignalItem[]>`
    SELECT r.rank_position,
           r.score,
           r.components,
           i.title,
           i.url,
           i.first_seen_at,
           i.item_role::text                       AS item_role,
           i.primary_vs_derivative::text           AS primary_vs_derivative,
           i.booing_or_negative_reaction_flag      AS booing,
           s.source_class::text                    AS source_class,
           s.source_subclass
    FROM rankings r
    JOIN items i   ON i.id = r.item_id
    JOIN sources s ON s.id = i.source_id
    WHERE r.view = ${view}
      AND r.ranked_for_day = CURRENT_DATE
    ORDER BY r.rank_position
    LIMIT ${limit}
  `;
}

export async function getDailySignal(limit = 40) {
  return rows("daily_signal", limit);
}

export async function getFriction(limit = 40) {
  return rows("friction", limit);
}
