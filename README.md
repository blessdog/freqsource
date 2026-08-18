# freqsource

Stage 1: Reddit radar spine for **freqsource.com**.

> Reddit is a topic radar, not a source of truth — fresh interest spikes here
> first. Stage 1 polls a small set of weighted, AI-focused subreddits, stores
> posts in SQLite, ranks them by traction × source weight, and renders a page.
> No LLM yet. Clustering, primary-source synthesis, media capture, and
> newsletter export come in later stages.

## Stack

- **Next.js 15 + TypeScript + Tailwind** — single web app, App Router.
- **SQLite (better-sqlite3)** — local file at `data/freqsource.db`.
- **Reddit native JSON** — no auth, polite User-Agent. Upgrade to OAuth only
  if/when we hit rate limits.

## Quickstart

```bash
# 1. Install
npm install

# 2. Configure your User-Agent (Reddit is grumpy about anonymous polling)
cp .env.example .env
# edit .env, set REDDIT_USER_AGENT to your real reddit handle

# 3. Initialize DB + seed the 6 weighted subreddits
npm run init-db

# 4. Pull one polling pass from Reddit (proves the spine end to end)
npm run poll

# 5. Eyeball what landed in the DB
npm run show

# 6. Run the web app
npm run dev
# open http://localhost:3000
```

## Seeded sources (Stage 1)

Carried over as **data only** from the prior signal-noise project — the
weights and trust-notes encode editorial judgment we want to keep.

| Subreddit            | Weight | Notes                                       |
| -------------------- | ------ | ------------------------------------------- |
| r/LocalLLaMA         | 1.3    | Real model testing; top practitioner signal |
| r/MachineLearning    | 1.3    | Research community vs. press spin           |
| r/cscareerquestions  | 1.2    | Labor reality                               |
| r/antiAI             | 0.9    | Friction/critic — discount doom bias        |
| r/opposeAI           | 0.9    | Friction/critic — discount doom bias        |
| r/aiwars             | 0.9    | Pro/anti debate — discount flamewar         |

## Layout

```
src/
  lib/
    db.ts          better-sqlite3 client + schema init
    sources.ts     the 6 seeded subs + their weights/notes
    reddit.ts      Reddit JSON fetcher (polite UA, 429 handling)
    ingest.ts      poll loop: fetch, upsert, track first/last_seen
    rank.ts        traction × source_weight × freshness scorer
  app/
    layout.tsx     Tailwind base
    page.tsx       ranked feed (server component, auto-refresh)
    globals.css
  scripts/
    init-db.ts     create schema, seed sources
    poll.ts        one polling pass (cron-friendly)
    show.ts        eyeball the top-ranked rows from the CLI
data/              gitignored — SQLite file lives here
```

## What V1 does NOT do (yet)

No LLM. No clustering. No outbound-link fetch. No media capture. No
newsletter. No deployment. Those are Stages 2–5. The spine runs first.
