# Architecture

ClipForge is built so the lightweight creator tool and the heavier automation SaaS can grow from
one codebase without a rewrite. The guiding rules:

1. **Interfaces at the seams.** Every AI capability (transcription, translation, categorization,
   music, viral scoring, publishing) is a small interface (`src/lib/ai/types.ts`). Call sites
   depend on the interface, never a concrete provider. Swapping a provider is a config change.
2. **Heavy work is out-of-band.** Whisper transcription and ffmpeg (caption burn-in, clip cutting,
   audio mixing) exceed serverless time limits, so they run in a self-hostable worker fed by a
   DB-backed job queue (`jobs` table). The web app enqueues; the worker executes. Zero managed
   infra required.
3. **Storage & DB are pluggable.** libSQL/SQLite locally, Turso in prod. Local disk storage in
   dev, Cloudflare R2 / Supabase Storage in prod — same `StorageDriver` interface.
4. **Extensible for monetization.** Users, plans, credits and billing hooks slot in behind the
   same service layer (Phase 6) without touching the pipeline.

## Layers

```
src/
  app/                 Next.js App Router (pages + API routes)
    api/               videos, import/youtube, videos/upload, categorize, settings
  components/          UI primitives (shadcn-style) + feature components
  lib/
    ai/                provider contracts, config, registry, providers/*
    catalog/           taxonomy + categorization engine + grouping
    ingest/            youtube (oEmbed + RSS) ingestion
    storage/           pluggable storage drivers
    db/                Drizzle schema, client, seed
    videos.ts          service layer: ingest -> categorize -> persist -> query
```

## Data model (Phase 0)

`users`, `channels`, `topics`, `videos`, `clips`, `captions`, `music_tracks`, `jobs`, `posts`,
`settings`. The pipeline maps to columns: `channels` (Connect/Detect), `clips.viralScore`
(AI Clip), `posts` (Auto-Post), `settings` + flags (Earn/monetization).

## Request flow (Phase 1 — import)

```
POST /api/import/youtube
  -> parseYouTubeUrl()            (video | channelId | handle)
  -> fetchVideo() / fetchChannelUploads()   (free oEmbed / RSS)
  -> getCategorizationProvider().categorize()
  -> ensureTopic() + insert into videos
GET /api/videos  ->  listVideosGrouped()  ->  groupVideosByTopic()
```

## Why these choices honor the brief

- **Lightweight**: no heavy component library; copy-in UI, minimal deps, SQLite.
- **Free / self-configurable**: keyword categorizer + LibreTranslate + local Whisper defaults;
  every provider swappable by env, including bring-your-own OpenAI-compatible endpoints.
- **Extensible**: interface seams + job queue + service layer make new phases additive.

## Deferred deliberately

- Full pnpm monorepo split (`packages/worker`) — extracted in Phase 3 when the worker becomes a
  separate process. A single app keeps Phase 0/1 runnable and truly lightweight.
- Auth wiring (Auth.js) — a demo user is seeded now; real auth is a small Phase 0 follow-up.
