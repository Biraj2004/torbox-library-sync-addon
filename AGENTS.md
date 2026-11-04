# AGENTS.md — Torbox Library Sync Addon

> **Mission**: High-performance, privacy-first, zero-AI Stremio and Nuvio addon that synchronizes your personal TorBox cloud storage to stream cached movies and TV series with sub-millisecond metadata matching.

---

## 1. Project Overview & Identity

- **Project Name:** Torbox Library Sync Addon
- **Repository:** [`https://github.com/Biraj2004/torbox-library-sync-addon`](https://github.com/Biraj2004/torbox-library-sync-addon)
- **Live Production URL:** [`https://torbox-library-sync-addon.vercel.app`](https://torbox-library-sync-addon.vercel.app)
- **Author & Maintainer:** Biraj Sarkar ([https://iambiraj.vercel.app](https://iambiraj.vercel.app), `birajsarkar67@gmail.com`)
- **License:** MIT
- **Target Applications:** [Stremio](https://stremio.com) (Desktop, Android, Web, Android TV) and [Nuvio](https://nuvio.stream) (Web, Desktop, Mobile)

---

## 2. Problem Statement & Root Cause

### The Problem
When using debrid-based Stremio/Nuvio setups, community scrapers (Torrentio, MediaFusion, Comet) often indicate that a requested torrent is **not cached**. When the user manually grabs the magnet link and adds it to their personal TorBox account, TorBox caches it immediately. 

However, upon refreshing Stremio, the media **still does not appear** because:
1. Public scrapers have stale cache TTLs or search public indexer hashes that differ from the user's uploaded torrent.
2. There was no direct connection between Stremio and the user's TorBox account.
3. Raw torrent filenames are cluttered with release groups, audio tags, and codec noise (e.g., `Severance.S01E03.In.Perpetuity.1080p.ATVP.WEB-DL.DDP5.1.Atmos.H.264-FLUX.mkv`), preventing naive string matches.

### Why the Legacy Codebase Failed
An earlier iteration attempted to solve this but suffered from major design flaws:
1. **Movies Only:** The manifest and stream handlers hardcoded `types: ["movie"]` and `if (type !== "movie") return { streams: [] }`, ignoring all TV series.
2. **The "Blind Tag" Trap:** It searched strictly with `hasTag(torrent, imdbId)`, meaning an untagged torrent was invisible unless manually tagged with `tt...` inside TorBox.
3. **Expensive, Slow AI Dependency:** It relied on paid OpenAI completions (`gpt-5-nano`) to parse filenames, introducing 2–5 second latencies, request timeouts, and paid API costs.
4. **Single-File Bias:** It selected the largest file in the torrent (`pool.reduce((a, b) => b.size > a.size ? b : a)`), making it impossible to stream individual episodes from season packs.

---

## 3. The New Architecture & Solution

```
Stremio / Nuvio Client
       │
       ▼ GET /:config/stream/[movie|series]/:id.json
┌────────────────────────────────────────────────────────┐
│             Torbox Library Sync Addon                  │
│                                                        │
│  1. Config Unpacking:                                  │
│     Extract TorBox key (from URL token or .env)        │
│                                                        │
│  2. Concurrent Cloud Fetch:                            │
│     Promise.allSettled([ Torrents, WebDL, Usenet ])    │
│                                                        │
│  3. Direct Cloud Tag Match (0ms Fast Path):            │
│     Does any item carry tag == imdbId?                 │
│     ├── Yes ──► Direct Stream Match                    │
│     └── No  ──► Query Metadata Waterfall & Match       │
│                                                        │
│  4. 2-Tier Metadata Waterfall:                         │
│     ├── Tier 1: Cinemeta (Free, Built-in, 0 key)       │
│     └── Tier 2: MDBList API (Optional key fallback)    │
│                                                        │
│  5. Deterministic Scene Parser (< 1ms, Zero AI):       │
│     Extract clean title, season, episode, quality,     │
│     source, codec, bit-depth, HDR, audio, channels     │
│                                                        │
│  6. Dynamic Stream Labeling & Permalinks:              │
│     Format multi-line stream description and route     │
│     directly to respective provider permalink:         │
│     - WebDL:   /webdl/requestdl?web_id=...             │
│     - Torrent: /torrents/requestdl?torrent_id=...      │
│     - Usenet:  /usenet/requestdl?usenet_id=...         │
│                                                        │
│  7. Background Cloud Tagging:                          │
│     Asynchronously add "tt..." tag to TorBox           │
│     (Subsequent requests match in < 1ms)               │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ TorBox Permalink (redirect=true)
                 Direct High-Speed CDN Stream
```

### Core Architectural Pillars:
1. **Multi-Namespace Cloud Synchronization (`src/torbox.ts`):**
   - Automatically synchronizes **Torrents** (`/torrents/mylist`), **Web Downloads / DDL** (`/webdl/mylist`), and **Usenet** (`/usenet/mylist`) in parallel via `Promise.allSettled`.
   - Single-file web downloads are automatically synthesized into a virtual files array for universal handling.
2. **Deterministic Scene Parser (`src/parser.ts`):**
   - High-performance regex parser that extracts:
     - `cleanTitle`: Title stripped of scene noise, brackets, and extensions.
     - `season` & `episode`: Extracts `S01E03`, `1x03`, multi-episodes (`S01E01-E02`), and season packs (`S01`, `Season 1`).
     - `resolution`: `4K`, `1080p`, `720p`, `480p`.
     - `source` & `codec`: `WEB-DL`, `BluRay`, `HEVC`/`x265`, `x264`, `AV1`.
     - `bitDepth`: `10-bit`, `12-bit`, `8-bit`.
     - `hdrFormats`: `DV`, `HDR10+`, `HDR10`, `HDR`, `HLG`.
     - `audioFormats`: `Dolby Atmos`, `TrueHD`, `DDP`, `AC3`, `DTS-HD MA`, `DTS`, `AAC`, `FLAC`.
     - `channels`: `7.1`, `5.1`, `2.0`.
     - `languages`: Bengali, Hindi, English, Tamil, Telugu, Malayalam, Kannada, Dual/Multi Audio, etc.
   - `titlesMatch()`: Normalizes punctuation, strips articles (`the`), converts Roman numerals (`Part II` -> `Part 2`), and computes token-set overlap.
   - `isSampleOrJunk()`: Filters out `sample.mkv`, trailers, featurettes, `.nfo`, and files $< 80\text{ MB}$.
3. **Dynamic Stream Labeling & Permalinks:**
   - Multi-line description template rendering full release metadata.
   - Direct streaming via `${API_BASE}/[torrents|webdl|usenet]/requestdl?...&redirect=true` routing directly to TorBox's high-speed CDN.

---

## 4. Key Isolation & Dual-Operating Modes

### Dual Operating Modes
1. **Local / Single-User Zero-Config Mode (`.env`):**
   - When `TORBOX_API_KEY` is defined in `.env`, the server operates in single-user mode.
   - The web UI detects environment keys, displays an "Environment Configuration Loaded" banner, and pre-populates fields.
   - The root `/manifest.json` becomes an immediately installable manifest with `configurationRequired: false`.
   - The user never enters their key twice.
2. **Public / Multi-Tenant Stateless Token Mode (`/:config/manifest.json`):**
   - On public deployments (Vercel), the server stores **zero user credentials**.
   - Keys are encoded into a base64url token in the URL path.
   - Stream requests unpack the configuration strictly in memory for that single request.
   - Page reload clears all inputs (`autocomplete="off"`, no `localStorage`).

### Optional Key Handling Strategy
- In `src/config.ts`, `decodeConfig()` ensures that missing or blank optional keys resolve to `undefined` (never empty strings or broken objects).
- If `mdblistApiKey` is `undefined`, the addon bypasses MDBList network calls entirely.
- If an invalid key is supplied, network errors are caught and logged, returning `null` so streaming never breaks.

### Anti-Inspection & DevTools Hardening
- **Zero-Keystroke Network Traffic:** Manifest tokens are generated 100% client-side in browser memory using Web Crypto AES-256-GCM. No HTTP requests are fired while typing.
- **Encrypted Key Testing:** When clicking "Test Key", the client transmits an encrypted token (`enc_...`), never the plaintext API key.
- **Sanitized Responses:** The `/api/test-key` endpoint strips user email addresses and internal account IDs, returning only clean boolean verification status.
- **Console & Scope Shielding:** All client scripts run inside an isolated IIFE with no variables exposed on `window`. All `console` logging methods are suppressed.
- **Strict Anti-Caching Headers:** Every response is served with `Cache-Control: no-store, no-cache, must-revalidate`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: no-referrer`.

---

## 5. File Manifest & Codebase Map

| Path | Purpose |
| :--- | :--- |
| [`src/app.ts`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/src/app.ts) | Express server, manifest endpoints, Stremio stream routing (`movie` & `series`), key tester API, static asset serving. |
| [`src/parser.ts`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/src/parser.ts) | Deterministic release title parser, season/episode matcher, sample detector, and title fuzzy comparison. |
| [`src/torbox.ts`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/src/torbox.ts) | TorBox API client (`mylist`, `edittorrent`, `user/me`), episode file matching, movie primary file selection, permalink generator. |
| [`src/cinemeta.ts`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/src/cinemeta.ts) | Primary metadata client with in-memory caching for `/meta/movie`, `/meta/series`, and catalog search. |
| [`src/mdblist.ts`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/src/mdblist.ts) | Optional MDBList search client with in-memory caching and key validation helper (`testMDBListKey`). |
| [`src/tvdb.ts`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/src/tvdb.ts) | Optional TVDB v4 search client with JWT token caching and key validation helper (`testTVDBKey`). |
| [`src/config.ts`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/src/config.ts) | Configuration schema, base64url serialization, environment variable fallbacks, and validation. |
| [`src/configure.ts`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/src/configure.ts) | Unslop-designed configuration page with GitHub repo link, `.env` detection banner, live key testers, Stremio/Nuvio guides. |
| [`src/errorPage.ts`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/src/errorPage.ts) | Responsive, no-scrolling 404, 400, and 500 error pages styled with Unslop aesthetic and quick navigation actions. |
| [`src/index.ts`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/src/index.ts) | Node HTTP server bootstrap with English startup logging. |
| [`api/index.ts`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/api/index.ts) | Vercel Serverless Function entry point exporting the Express app. |
| [`public/logo.svg`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/public/logo.svg) | Master isometric vector mark with rounded container (85% canvas fill). |
| [`public/favicon.svg`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/public/favicon.svg) | High-contrast 32x32 favicon filling 93% of the viewBox edge-to-edge for tab readability. |
| [`public/robots.txt`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/public/robots.txt) | Search crawler and AI bot permissions (`GPTBot`, `ClaudeBot`, `PerplexityBot`). |
| [`public/sitemap.xml`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/public/sitemap.xml) | Canonical XML sitemap for SEO discovery. |
| [`public/site.webmanifest`](file:///e:/01.%20GitHub%20Repo%20Projects/torbox-librarian-addon/public/site.webmanifest) | Web application manifest. |

---

## 6. Developer & AI Agent Working Guidelines

When modifying or extending this codebase, adhere to these rules:

1. **Documentation Integrity:** Preserve existing JSDoc comments and typing signatures.
2. **Deterministic-First:** Never reintroduce external LLM dependencies for basic parsing tasks. The regex parser in `src/parser.ts` handles titles, years, episodes, and codecs deterministically in `< 1 ms`.
3. **Defensive API Calls:** External APIs (MDBList, TVDB, TorBox) must always be wrapped in `try/catch` and return `null` on failure. Never let an API outage crash the stream response.
4. **Clean Optional Propagation:** When adding optional configuration keys, ensure they default to `undefined` if empty and provide fallback to Cinemeta.
5. **No Secrets in Git:** Never commit `.env` or personal tokens. Always verify git status before committing.
6. **Verify Before Asserting:** Run `npm run build` and sanity tests to confirm that TypeScript compiles cleanly before asserting task completion.

