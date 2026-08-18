// SQLite client + schema. Single shared connection per process; better-sqlite3
// is synchronous and safe for our scale (one writer = the poller, one reader
// = the Next.js server). If we ever go multi-writer, switch to WAL + queueing
// or graduate to Postgres/Turso — not a Stage-1 concern.

import Database from 'better-sqlite3';
import { dirname, resolve } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';

const DB_PATH = resolve(process.env['DATABASE_PATH'] ?? 'data/freqsource.db');

let _db: Database.Database | undefined;

export function db(): Database.Database {
  if (_db) return _db;
  if (!existsSync(dirname(DB_PATH))) {
    mkdirSync(dirname(DB_PATH), { recursive: true });
  }
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  return _db;
}

// Idempotent: safe to call on every process boot.
export function initSchema(): void {
  const d = db();
  d.exec(`
    CREATE TABLE IF NOT EXISTS sources (
      name              TEXT PRIMARY KEY,           -- 'r/LocalLLaMA'
      homepage_url      TEXT NOT NULL,
      source_class      TEXT NOT NULL,              -- practitioner_forum / public_forum / ...
      source_subclass   TEXT,                       -- reddit / reddit/critic / reddit/labor
      source_weight     REAL NOT NULL DEFAULT 1.0,  -- editorial multiplier (0.0 - 2.0)
      originality_score REAL,                       -- 0..1 self-content vs. aggregation
      promo_risk        REAL,                       -- 0..1 likelihood of promotional content
      trust_notes       TEXT,                       -- human-written editorial note
      active            INTEGER NOT NULL DEFAULT 1, -- bool: include in polling
      added_at          INTEGER NOT NULL            -- epoch seconds
    );

    CREATE TABLE IF NOT EXISTS posts (
      id              TEXT PRIMARY KEY,             -- reddit post id (without t3_ prefix)
      source_name     TEXT NOT NULL,                -- FK -> sources.name
      title           TEXT NOT NULL,
      selftext        TEXT,                         -- post body (may be empty)
      url             TEXT,                         -- outbound link OR self-permalink
      permalink       TEXT NOT NULL,                -- full reddit thread URL
      author          TEXT,
      thumbnail       TEXT,                         -- url, 'self', 'default', 'nsfw', or ''
      is_self         INTEGER NOT NULL,             -- bool
      is_video        INTEGER NOT NULL,             -- bool
      over_18         INTEGER NOT NULL,             -- bool
      score           INTEGER NOT NULL,
      num_comments    INTEGER NOT NULL,
      upvote_ratio    REAL,
      created_utc     INTEGER NOT NULL,             -- reddit post time (epoch s)
      first_seen_utc  INTEGER NOT NULL,             -- when our poller first saw it
      last_seen_utc   INTEGER NOT NULL,             -- last poll that refreshed stats
      FOREIGN KEY (source_name) REFERENCES sources(name)
    );

    CREATE INDEX IF NOT EXISTS idx_posts_source       ON posts(source_name);
    CREATE INDEX IF NOT EXISTS idx_posts_created      ON posts(created_utc);
    CREATE INDEX IF NOT EXISTS idx_posts_last_seen    ON posts(last_seen_utc);
  `);
}
