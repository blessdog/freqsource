'use client';

// Small client island: nudges the server component to re-render every minute
// so a long-lived tab stays current as new polls land in the DB. No state of
// its own; just calls router.refresh().

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const REFRESH_INTERVAL_MS = 60_000;

export function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);
    return () => clearInterval(t);
  }, [router]);
  return null;
}
