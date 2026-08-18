// Seed subreddits — carried over as DATA from the prior signal-noise project.
// Weights and trust-notes encode real editorial judgment; we keep them.
// Code from that project is intentionally NOT imported.

export interface SourceSeed {
  name: string;            // 'r/LocalLLaMA'
  homepage_url: string;
  source_class: string;    // practitioner_forum / public_forum
  source_subclass: string; // reddit / reddit/critic / reddit/labor
  source_weight: number;   // editorial multiplier
  originality_score: number;
  promo_risk: number;
  trust_notes: string;
}

export const SEED_SOURCES: SourceSeed[] = [
  {
    name: 'r/LocalLLaMA',
    homepage_url: 'https://reddit.com/r/LocalLLaMA',
    source_class: 'practitioner_forum',
    source_subclass: 'reddit',
    source_weight: 1.3,
    originality_score: 0.80,
    promo_risk: 0.05,
    trust_notes: 'Real model testing; top practitioner-validation signal. Discount brigading.',
  },
  {
    name: 'r/MachineLearning',
    homepage_url: 'https://reddit.com/r/MachineLearning',
    source_class: 'practitioner_forum',
    source_subclass: 'reddit',
    source_weight: 1.3,
    originality_score: 0.75,
    promo_risk: 0.05,
    trust_notes: 'Research community vs. press spin.',
  },
  {
    name: 'r/cscareerquestions',
    homepage_url: 'https://reddit.com/r/cscareerquestions',
    source_class: 'practitioner_forum',
    source_subclass: 'reddit/labor',
    source_weight: 1.2,
    originality_score: 0.55,
    promo_risk: 0.05,
    trust_notes: 'Labor reality; high labor_policy_relevance.',
  },
  {
    name: 'r/antiAI',
    homepage_url: 'https://reddit.com/r/antiAI',
    source_class: 'public_forum',
    source_subclass: 'reddit/critic',
    source_weight: 0.9,
    originality_score: 0.40,
    promo_risk: 0.05,
    trust_notes: 'Friction/critic. Discount doom bias; verify substance.',
  },
  {
    name: 'r/opposeAI',
    homepage_url: 'https://reddit.com/r/opposeAI',
    source_class: 'public_forum',
    source_subclass: 'reddit/critic',
    source_weight: 0.9,
    originality_score: 0.40,
    promo_risk: 0.05,
    trust_notes: 'Friction/critic. Discount doom bias; verify substance.',
  },
  {
    name: 'r/aiwars',
    homepage_url: 'https://reddit.com/r/aiwars',
    source_class: 'public_forum',
    source_subclass: 'reddit/critic',
    source_weight: 0.9,
    originality_score: 0.45,
    promo_risk: 0.05,
    trust_notes: 'Pro/anti-AI debate; friction + labor/artist resistance signal. Discount flamewar.',
  },
];
