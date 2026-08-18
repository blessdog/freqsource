import type { NextConfig } from 'next';

// Stage 1 spine: minimal config. Image domains let us render Reddit thumbnails
// with a plain <img> via `unoptimized: true` so we don't fight Next/Image rules
// while iterating; we tighten this when the design solidifies.
const config: NextConfig = {
  images: { unoptimized: true },
  serverExternalPackages: ['better-sqlite3'],
};

export default config;
