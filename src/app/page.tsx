// Stage-1 feed page. Server component reads SQLite directly (no API layer
// needed yet). Re-validates every minute so a page kept open updates as new
// polls land. The <AutoRefresh /> island forces a router refresh on the
// same cadence so an idle tab stays current without a hard reload.

import { initSchema } from '@/lib/db';
import { topRankedPosts, type RankedPost } from '@/lib/rank';
import { AutoRefresh } from './auto-refresh';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

initSchema();

export default function Home() {
  const posts = topRankedPosts(60);
  const lastUpdated = new Date().toLocaleTimeString();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <AutoRefresh />
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">freqsource</h1>
        <span className="text-xs text-neutral-500">updated {lastUpdated}</span>
      </header>

      <p className="mb-8 text-sm text-neutral-400">
        Topic radar — emerging posts across {new Set(posts.map((p) => p.source_name)).size} curated AI/tech
        subreddits, ranked by traction × source weight × freshness. Reddit is a
        signpost, not the substance — follow the links out.
      </p>

      {posts.length === 0 ? (
        <EmptyState />
      ) : (
        <ol className="space-y-3">
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} rank={i + 1} />
          ))}
        </ol>
      )}
    </main>
  );
}

function PostCard({ post, rank }: { post: RankedPost; rank: number }) {
  const ageH = ((Date.now() / 1000 - post.created_utc) / 3600).toFixed(1);
  const outboundIsSelf = post.is_self === 1 || post.url.includes('reddit.com');
  return (
    <li className="rounded-md border border-neutral-800 bg-neutral-950/50 p-3 transition hover:border-neutral-700">
      <div className="flex items-start gap-3">
        <span className="w-8 shrink-0 text-right font-mono text-xs text-neutral-600">{rank}</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-medium leading-snug">
            {outboundIsSelf ? (
              <a href={post.permalink} target="_blank" rel="noreferrer noopener" className="hover:underline">
                {post.title}
              </a>
            ) : (
              <a href={post.url} target="_blank" rel="noreferrer noopener" className="hover:underline">
                {post.title}
              </a>
            )}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500">
            <span className="font-mono text-neutral-400">{post.source_name}</span>
            <span>↑{post.score.toLocaleString()}</span>
            <span>💬{post.num_comments.toLocaleString()}</span>
            <span>{ageH}h old</span>
            <span className="font-mono text-neutral-600">score {post.rank_score.toFixed(1)}</span>
            <a
              href={post.permalink}
              target="_blank"
              rel="noreferrer noopener"
              className="text-neutral-500 hover:text-neutral-300"
            >
              comments →
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="rounded-md border border-dashed border-neutral-800 p-8 text-center text-neutral-500">
      <p className="mb-2">No posts yet.</p>
      <p className="font-mono text-xs">
        run <span className="text-neutral-300">npm run init-db</span> then{' '}
        <span className="text-neutral-300">npm run poll</span>
      </p>
    </div>
  );
}
