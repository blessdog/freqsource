import type { ReactNode } from "react";

type Tone = "friction" | "labor" | "vendor" | "loud" | "derivative" | "neutral";

const TONE: Record<Tone, string> = {
  friction: "border-[color:var(--friction-hi)] text-[color:var(--friction)]",
  labor: "border-[color:var(--labor)] text-[color:var(--labor)]",
  vendor: "border-[color:var(--derivative)] text-muted",
  loud: "border-[color:var(--friction)] text-[color:var(--friction)]",
  derivative: "border-border text-faint",
  neutral: "border-border text-muted",
};

/** Small bordered status pill. No fills, no gradients — restrained. */
export default function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-1.5 py-px text-[10px] uppercase tracking-wide ${TONE[tone]}`}
    >
      {children}
    </span>
  );
}
