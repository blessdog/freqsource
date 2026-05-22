# freqsource — web

The analyst-terminal front end for freqsource (signal / noise): high-signal AI-industry
intelligence. Next.js 16 (App Router) + React 19 + Tailwind v4. Reads a Postgres database
(populated out-of-band by the ingestion/ranking pipeline) via server components.

## Env
Set one variable:

```
DATABASE_URL=postgres://USER:PASS@HOST/DB   # Postgres with pgvector (e.g. Neon)
```

Locally, copy to `.env.local`. On Hostinger, set it in the Node.js app's environment panel.

## Scripts
```
npm run dev      # local dev (localhost:3000)
npm run build    # production build
npm start        # production server (respects $PORT — Hostinger sets this)
```

## Deploy (Hostinger Node.js Web App)
Hostinger imports this GitHub repo and redeploys on every push. Build command
`npm run build`, start command `npm start`. Point freqsource.com at the app and set
`DATABASE_URL` to the hosted Postgres (Neon free tier supports the schema + pgvector).

The data pipeline (HN/Reddit/RSS ingestion → enrich → rank) lives in the separate
`signal-noise` project and writes to the same database; this app only reads.
