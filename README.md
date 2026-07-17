# ClipForge

Lightweight, extensible **YouTube-to-Shorts automation**. Import or upload videos, auto-caption
and translate them, add copyright-free background music, and browse a catalog that groups videos by
topic — all on **free, open-source, self-configurable AI**.

This repo is the **Phase 0 + Phase 1** foundation: the app scaffold, data model, pluggable AI
provider layer, ingestion (upload + YouTube import), and the topic-grouped catalog. Captions,
translation, music, clipping and auto-posting land in later phases (see `docs/ROADMAP.md`).

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + shadcn-style components (lightweight, copy-in)
- **Drizzle ORM** on **libSQL/SQLite** (local file in dev; Turso free tier in prod)
- Pluggable **AI provider layer** — swap providers per capability via env

## Quick start

```bash
cp .env.example .env      # defaults are zero-cost; no keys needed to boot
npm install
npm run db:push           # create tables in ./local.db
npm run db:seed           # demo user, topics, sample videos, CC0 music
npm run dev               # http://localhost:3000
```

Verify the categorization engine on its own:

```bash
npm run test:categorize
```

## What works now

- **Dashboard** mirroring the automation pipeline (Connect → Detect → AI Clip → Auto-Post → Earn).
- **Ingestion**: upload a file, or import a YouTube video/channel URL (free, key-less oEmbed + RSS).
- **Auto-categorization**: videos are grouped into topics derived from their titles/descriptions.
- **Catalog**: topic-grouped grid with confidence badges and a re-run button.
- **Settings**: shows the active provider for each capability and the feature flags.

## Pluggable AI (self-configurable)

Each capability is an interface in `src/lib/ai/types.ts` with swappable implementations chosen by
env vars (`TRANSCRIPTION_PROVIDER`, `TRANSLATION_PROVIDER`, `CATEGORIZATION_PROVIDER`,
`MUSIC_PROVIDER`, `VIRAL_PROVIDER`). Defaults are free/zero-cost. See `.env.example`.

| Capability        | Free default        | Also supported                          |
| ----------------- | ------------------- | --------------------------------------- |
| Transcription     | local worker / WASM | Groq (free tier), Hugging Face          |
| Translation       | LibreTranslate      | Hugging Face, none                      |
| Categorization    | keyword taxonomy    | any OpenAI-compatible LLM, embeddings   |
| Music             | bundled CC0         | Jamendo (CC), Pixabay                   |
| Viral scoring     | heuristic           | LLM                                     |

## Legal note

Importing and re-posting other creators' videos can violate YouTube's Terms and third-party
copyright; adding background music does **not** clear the source video's rights. Import and
auto-post ship **off by default** and are intended for content you own or are licensed to use.

See `docs/ARCHITECTURE.md` and `docs/ROADMAP.md` for the full design and phase plan.
