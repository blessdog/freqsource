import Link from "next/link";

const NAV = [
  { href: "/", label: "Daily Signal", active: true },
  { href: "/friction", label: "Friction", active: false },
  { href: "/clusters", label: "Clusters", active: false },
  { href: "/claims", label: "Claims", active: false },
  { href: "/sources", label: "Sources", active: false },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        {/* Wordmark: freqsource, signal / noise as ethos */}
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-semibold tracking-tight text-fg">
            freqsource
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-faint">
            signal / noise
          </span>
        </Link>
        <nav className="flex items-center gap-4 font-mono text-[11px]">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={
                n.active
                  ? "text-fg"
                  : "text-faint hover:text-muted"
              }
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
