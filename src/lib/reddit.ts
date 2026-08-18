// Reddit JSON fetcher. No auth — uses the public `.json` endpoints. Reddit
// requires a descriptive User-Agent or returns 429/403. We back off on 429
// and surface other failures so the ingest pass can mark the sub as failed
// for that run without crashing the whole poll.

const DEFAULT_UA = 'freqsource/0.1 (by /u/anonymous)';

export interface RedditPost {
  id: string;             // 'abc123' (without t3_ prefix)
  subreddit: string;      // 'LocalLLaMA'
  title: string;
  selftext: string;
  url: string;            // outbound link or self URL
  permalink: string;      // '/r/LocalLLaMA/comments/abc123/...'
  author: string;
  thumbnail: string;
  is_self: boolean;
  is_video: boolean;
  over_18: boolean;
  score: number;
  num_comments: number;
  upvote_ratio: number;
  created_utc: number;    // epoch seconds
}

interface RedditListing {
  kind: 'Listing';
  data: {
    children: Array<{ kind: 't3'; data: Record<string, unknown> }>;
    after: string | null;
  };
}

const UA = process.env['REDDIT_USER_AGENT'] ?? DEFAULT_UA;

/**
 * Fetch the latest posts from one subreddit's /new feed. `name` may be with
 * or without the `r/` prefix. Returns at most `limit` posts (Reddit caps at
 * 100 per request).
 */
export async function fetchSubredditNew(name: string, limit = 100): Promise<RedditPost[]> {
  const slug = name.replace(/^r\//, '');
  const url = `https://www.reddit.com/r/${slug}/new.json?limit=${limit}&raw_json=1`;

  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    redirect: 'follow',
  });

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get('retry-after') ?? '0');
    throw new RedditRateLimitError(slug, retryAfter);
  }
  if (!res.ok) {
    throw new Error(`reddit fetch ${slug}: ${res.status} ${res.statusText}`);
  }

  const body = (await res.json()) as RedditListing;
  if (body?.data?.children === undefined) {
    throw new Error(`reddit fetch ${slug}: unexpected payload shape`);
  }

  return body.data.children
    .filter((c) => c.kind === 't3')
    .map((c) => normalizePost(c.data));
}

export class RedditRateLimitError extends Error {
  constructor(public readonly subreddit: string, public readonly retryAfterSec: number) {
    super(`reddit 429 for r/${subreddit}; retry-after=${retryAfterSec}s`);
    this.name = 'RedditRateLimitError';
  }
}

// Cast through `unknown` so each field is explicitly narrowed — silently
// trusting Reddit's shape is how this kind of code rots later. If a field
// is missing we fall back to a sensible default rather than throw.
function normalizePost(d: Record<string, unknown>): RedditPost {
  const get = <T>(k: string, fallback: T): T => (d[k] === undefined || d[k] === null ? fallback : (d[k] as T));
  return {
    id: get<string>('id', ''),
    subreddit: get<string>('subreddit', ''),
    title: get<string>('title', ''),
    selftext: get<string>('selftext', ''),
    url: get<string>('url', ''),
    permalink: get<string>('permalink', ''),
    author: get<string>('author', '[unknown]'),
    thumbnail: get<string>('thumbnail', ''),
    is_self: Boolean(get<boolean>('is_self', false)),
    is_video: Boolean(get<boolean>('is_video', false)),
    over_18: Boolean(get<boolean>('over_18', false)),
    score: Number(get<number>('score', 0)),
    num_comments: Number(get<number>('num_comments', 0)),
    upvote_ratio: Number(get<number>('upvote_ratio', 0)),
    created_utc: Math.floor(Number(get<number>('created_utc', 0))),
  };
}
