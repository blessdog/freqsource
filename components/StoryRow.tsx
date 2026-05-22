import type { SignalItem } from "@/lib/queries";
import { classLabel, hostname, timeAgo } from "@/lib/format";
import Badge from "./Badge";

/** One curated story. Leads with the LLM's "why it matters" — the insight, not the
 *  headline. The original title is demoted to a quiet, clickable source line.
 *  Left rule is amber when there's real friction, so contested stories stand out. */
export default function StoryRow({ item }: { item: SignalItem }) {
  const host = hostname(item.url);
  const accent = item.friction_summary ? "var(--friction)" : "var(--border)";

  return (
    <article
      className="border-b border-border px-5 py-4 hover:bg-surface-2"
      style={{ borderLeft: `2px solid ${accent}` }}
    >
      {/* Lead: why it matters */}
      <h2 className="text-[15px] font-semibold leading-snug text-fg">
        {item.why_it_matters}
      </h2>

      {/* The take */}
      {item.the_take && (
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{item.the_take}</p>
      )}

      {/* Friction — the pushback */}
      {item.friction_summary && (
        <p className="mt-1.5 flex gap-1.5 text-[13px] leading-relaxed text-[color:var(--friction)]">
          <span aria-hidden>⚠</span>
          <span>{item.friction_summary}</span>
        </p>
      )}

      {/* Meta + badges */}
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px] text-faint">
        <span>{classLabel(item.source_class)}</span>
        {host && <span>· {host}</span>}
        {item.comment_count > 0 && <span>· {item.comment_count} comments</span>}
        <span>· {timeAgo(item.first_seen_at)}</span>
        {item.vendor_driven && <Badge tone="vendor">vendor-driven</Badge>}
        {item.worth_writing && <Badge tone="neutral">★ worth writing</Badge>}
        {item.horizon && item.horizon !== "noise" && (
          <Badge tone="neutral">{item.horizon === "week" ? "this week" : "developing"}</Badge>
        )}
      </div>

      {/* Original source — demoted, clickable */}
      {item.title && (
        <a
          href={item.url ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 block truncate text-[12px] text-faint hover:text-muted hover:underline decoration-faint underline-offset-2"
          title={item.title}
        >
          ↳ {item.title}
        </a>
      )}
    </article>
  );
}
