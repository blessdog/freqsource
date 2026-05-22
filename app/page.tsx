import Header from "@/components/Header";
import StoryRow from "@/components/StoryRow";
import { getDailySignal } from "@/lib/queries";

// Always read fresh from the DB (the ranking job updates it out of band).
export const dynamic = "force-dynamic";

export default async function Page() {
  let items;
  try {
    items = await getDailySignal(40);
  } catch (err) {
    return (
      <Shell>
        <p className="px-4 py-10 font-mono text-sm text-muted">
          No database connection. Set <code className="text-fg">DATABASE_URL</code> and run the
          ranking job.{" "}
          <span className="text-faint">({(err as Error).message})</span>
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-center justify-between px-4 py-2 font-mono text-[11px] text-faint">
        <span>Most important emerging stories · last 72h</span>
        <span className="tnum">{items.length} ranked</span>
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-10 font-mono text-sm text-muted">
          Nothing meets the bar in this window.
        </p>
      ) : (
        <div>
          {items.map((it) => (
            <StoryRow key={`${it.rank_position}-${it.title}`} item={it} />
          ))}
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl">{children}</main>
    </>
  );
}
