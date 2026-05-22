type Metric = "friction" | "evidence" | "practitioner" | "labor";

const COLOR: Record<Metric, string> = {
  friction: "var(--friction)",
  evidence: "var(--evidence)",
  practitioner: "var(--practitioner)",
  labor: "var(--labor)",
};

const LABEL: Record<Metric, string> = {
  friction: "fri",
  evidence: "evi",
  practitioner: "prc",
  labor: "lab",
};

/** Tiny labeled bar for one ranking component. Color = which signal. */
export default function ScoreBar({
  metric,
  value,
  high,
}: {
  metric: Metric;
  value: number;
  high?: boolean; // friction escalates toward red
}) {
  const v = Math.max(0, Math.min(1, value || 0));
  const color = metric === "friction" && (high || v >= 0.5) ? "var(--friction-hi)" : COLOR[metric];
  return (
    <span className="flex items-center gap-1" title={`${LABEL[metric]} ${v.toFixed(2)}`}>
      <span className="text-[10px] uppercase tracking-wide text-faint">{LABEL[metric]}</span>
      <span className="h-[3px] w-9 rounded-full bg-border overflow-hidden">
        <span
          className="block h-full rounded-full"
          style={{ width: `${v * 100}%`, background: color }}
        />
      </span>
    </span>
  );
}
