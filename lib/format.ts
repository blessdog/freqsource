export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

// Short, uppercase source-class label for the meta strip.
const CLASS_LABEL: Record<string, string> = {
  researcher: "RESEARCH",
  academic_preprint: "ARXIV",
  practitioner_forum: "FORUM",
  public_forum: "FORUM",
  independent_analyst: "ANALYST",
  mainstream_media: "MEDIA",
  financial_media: "FINANCE",
  earnings_filing: "EARNINGS",
  policy_government: "POLICY",
  event_transcript: "EVENT",
  creator: "CREATOR",
  newsletter: "NEWSLTR",
  infrastructure: "INFRA",
  vendor: "VENDOR",
};

export function classLabel(c: string): string {
  return CLASS_LABEL[c] ?? c.toUpperCase().slice(0, 8);
}

export function hostname(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
