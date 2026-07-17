# Roadmap

Each phase ships as its own PR with a preview.

- [x] **Phase 0 — Scaffold & contracts**
  - Next.js + Tailwind + shadcn-style UI, Drizzle schema, AI provider interfaces + registry,
    settings surface, env config, docs.
- [x] **Phase 1 — Ingestion & topic catalog**
  - Upload + YouTube (video/channel) import via free oEmbed/RSS; zero-cost keyword categorization;
    topic-grouped catalog with re-categorize.
- [ ] **Phase 2 — Captions & translation**
  - Whisper transcription (worker/WASM/Groq) → captions; LibreTranslate multi-language; caption
    review UI; SRT/VTT export.
- [ ] **Phase 3 — Music & Shorts export**
  - Copyright-free music library + audio mixing; caption burn-in; vertical 9:16 export via the
    self-hostable ffmpeg worker; extract `packages/worker`.
- [ ] **Phase 4 — Watch, detect & auto-clip**
  - Channel watcher (RSS polling), handle→channelId resolver, viral-moment scoring, automatic
    clip cutting from long videos.
- [ ] **Phase 5 — Auto-posting**
  - YouTube / TikTok / Instagram adapters behind `FEATURE_AUTOPOST`, pending each platform's API
    approval; scheduling + per-platform post records.
- [ ] **Phase 6 — Monetization**
  - Auth, plans/credits, billing hooks, usage metering; turn on the "Earn" step.

## Known dependencies / risks

- **Legal/ToS**: importing & re-posting third-party videos; music does not clear source rights.
- **Platform API approvals**: YouTube upload scope, TikTok Content Posting API, Instagram Graph —
  multi-week reviews.
- **Zero-cost processing limits**: self-host worker removes cost but needs a host to run on.
