import type { SignalItem } from "@/lib/queries";
import { classLabel, hostname, timeAgo } from "@/lib/format";
import ScoreBar from "./ScoreBar";
import Badge from "./Badge";

/** One story in the Daily Signal / Friction feed.
 *  Hybrid look: editorial lead headline + terminal-grade meta strip.
 *  Left rule is colored by friction so the eye finds the contested stories. */
export default function StoryRow({ item }: { item: SignalItem }) {
  const c = item.components;
  const fri = c.friction ?? 0;
  const accent =
    fri >= 0.5 ? "var(--friction-hi)" : fri >= 0.2 ? "var(--friction)" : "var(--border)";

  const host = hostname(item.url);
  const showLabor = (c.labor_policy ?? 0) >= 0.15;
  const vendorDriven = (c.official_pr_dominance ?? 0) >= 0.5;
  const derivative = item.primary_vs_derivative && item.primary_vs_derivative !== "primary";

  return (
    <article
      className="group flex gap-3 border-b border-border px-4 py-3 hover:bg-surface-2"
      style={{ borderLeft: `2px solid ${accent}` }}
    >
      <div className="w-7 shrink-0 pt-0.5 text-right font-mono text-xs text-faint tnum">
        {String(item.rank_position).padStart(2, "0")}
      </div>

      <div className="min-w-0 flex-1">
        {/* Lead: why-it-matters headline (title for now; LLM-generated lead later) */}
        <a
          href={item.url ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="block text-[15px] font-medium leading-snug text-fg hover:underline decoration-faint underline-offset-2"
        >
          {item.title ?? "(untitled)"}
        </a>

        {/* Meta strip */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
          <span className="text-faint">{classLabel(item.source_class)}</span>
          {host && <span className="text-faint">· {host}</span>}
          <ScoreBar metric="friction" value={fri} />
          <ScoreBar metric="evidence" value={c.evidence ?? 0} />
          <ScoreBar metric="practitioner" value={c.practitioner_validation ?? 0} />
          {showLabor && <ScoreBar metric="labor" value={c.labor_policy ?? 0} />}
          {c.comment_count > 0 && <span className="text-faint">{c.comment_count}c</span>}
          <span className="text-faint">{timeAgo(item.first_seen_at)}</span>
        </div>

        {/* Badges */}
        {(fri >= 0.25 || showLabor || vendorDriven || c.loud_only || derivative) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {fri >= 0.25 && <Badge tone="friction">⚠ friction</Badge>}
            {showLabor && <Badge tone="labor">labor</Badge>}
            {vendorDriven && <Badge tone="vendor">vendor-driven</Badge>}
            {c.loud_only && <Badge tone="loud">loud only</Badge>}
            {derivative && <Badge tone="derivative">{item.primary_vs_derivative}</Badge>}
          </div>
        )}
      </div>

      {/* Composite score */}
      <div className="w-12 shrink-0 pt-0.5 text-right font-mono text-sm text-fg tnum">
        {item.score.toFixed(2)}
      </div>
    </article>
  );
}
