<div align="center">
  <img src="public/logo.svg" alt="Torbox Library Sync Addon Logo" width="96" height="96" />
  <h1>Torbox Library Sync Addon</h1>
  <p><strong>Instant personal TorBox cloud streamer for Stremio and Nuvio with deterministic metadata matching</strong></p>

  <p>
    <a href="https://torbox-library-sync-addon.vercel.app"><img src="https://img.shields.io/badge/Vercel-Live%20Deployment-000000?style=for-the-badge&logo=vercel" alt="Vercel" /></a>
    <a href="https://stremio.com"><img src="https://img.shields.io/badge/Client-Stremio-7B5BF5?style=for-the-badge&logo=stremio&logoColor=white" alt="Stremio" /></a>
    <a href="https://nuvio.stream"><img src="https://img.shields.io/badge/Client-Nuvio-2563EB?style=for-the-badge" alt="Nuvio" /></a>
    <a href="https://github.com/Biraj2004/torbox-library-sync-addon"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge" alt="License: MIT" /></a>
  </p>

  <p>
    <a href="https://torbox-library-sync-addon.vercel.app"><strong>Launch Web App</strong></a> •
    <a href="#overview">Overview</a> •
    <a href="#key-features">Key Features</a> •
    <a href="#dual-operation-modes">Dual Operation Modes</a> •
    <a href="#how-optional-keys-are-handled">Optional Keys</a> •
    <a href="#environment-configuration">Environment Config</a> •
    <a href="#security--dynamic-cryptography">Security</a>
  </p>
</div>

---

## Overview

When using **Stremio** or **Nuvio**, community scraper addons frequently list items as **not cached**. When you grab the torrent or magnet link and add it to your [TorBox](https://torbox.app) account, it is cached immediately. However, refreshing Stremio often still does not display your newly cached media because external indexers have not updated or filenames are cluttered with release tags.

**Torbox Library Sync Addon** bridges this gap. It connects directly to your TorBox cloud library, normalizes raw filenames, maps them to official metadata (Cinemeta, IMDb, TVDB, MDBList), and generates direct stream links near-instantly.

---

## Target Applications

| Platform | Support | Installation Method |
| :--- | :--- | :--- |
| **Stremio** | Full (Desktop, Web, Android, Android TV) | One-click `stremio://` deep link or paste manifest URL into Search |
| **Nuvio** | Full (Desktop, Web, Mobile) | Direct Web Link or Settings &rarr; Plugins/Addons &rarr; Add Custom Addon |

---

## Dual Operation Modes

The addon is architected to support two distinct operating models:

### 1. Zero-Config Local / Self-Hosted Mode (`.env`)
- If you self-host or run the addon locally, you can paste your API keys directly into a `.env` file.
- The web UI automatically detects your environment keys and pre-populates them with an active "Environment Configuration Loaded" banner.
- The root manifest (`/manifest.json`) is immediately valid and installable without requiring any base64 URL tokens.
- **You never have to enter your key twice.**

### 2. Stateless Public Mode (Vercel / Multi-Tenant)
- When hosted publicly (e.g. on `torbox-library-sync-addon.vercel.app`), the server stores **zero user keys**.
- Each user inputs their own TorBox API key on the configuration page.
- The configuration is encoded client-side into their private URL token (`/:config/manifest.json`).
- Multi-tenant key isolation guarantees that no user can access or abuse another user's TorBox quota.

---

## How Optional Keys Are Handled

| Key | Status | Role | Failure Fallback |
| :--- | :--- | :--- | :--- |
| **TorBox API Key** | **Required** | Authenticates your personal TorBox cloud library | N/A (Cannot stream without a source) |
| **MDBList API Key** | **Optional** | Resolves foreign movie aliases, alternative release names, and international titles | **Cinemeta (Zero-Fail):** If left blank or invalid, falls back to Cinemeta automatically |
| **TVDB API Key** | **Optional** | Validates season packs, anime arcs, and complex multi-episode numbering | **Cinemeta (Zero-Fail):** If left blank or invalid, falls back to Cinemeta automatically |

> **Sanity & Edge Case Protection:** All inputs automatically strip accidental whitespace and surrounding quotes (`"..."` / `'...'`). Empty optional fields are strictly treated as `undefined` so they never pollute downstream requests. Each key can be live-tested directly in the UI before installing.

---

## Key Features

- **Sub-Millisecond Deterministic Parser (Zero AI):** Completely free and self-sustained. Strips release groups, codecs, and container noise in `< 1 ms` without paid OpenAI or cloud LLM costs.
- **Movies and Complete Series:** Full support for single movies, individual episodes (`S01E03`, `1x03`), multi-episodes (`S01E01-E02`), and complete season packs (`Show.S01.Complete`).
- **Smart Sample and Junk Filtering:** Detects and ignores sample clips (`sample.mkv`, files $< 80\text{ MB}$), featurettes, trailers, and text documents, ensuring only the primary media file is streamed.
- **TorBox Cloud Auto-Tagging:** When a torrent matches an IMDb title, the addon tags it directly in TorBox in the background. Subsequent lookups across any connected device are **instantaneous ($< 1\text{ ms}$)**.
- **Stateless Key Isolation and Privacy:** The server stores **no credentials** and has no database. Browser inputs reset on every page reload unless configured in `.env`.
- **Unslop Design:** Clean, modern, distraction-free UI with top-right GitHub repository integration, live key verification badges, and instant Stremio/Nuvio triggers.

---

## Architecture Workflow

```
Stremio / Nuvio
      │
      ▼ GET /:config/stream/[movie|series]/:id.json
┌────────────────────────────────────────────────────────┐
│             Torbox Library Sync Addon                  │
│                                                        │
│  1. Stateless Key Extraction:                          │
│     Extract user's TorBox key from token or .env       │
│                                                        │
│  2. Fast Cache & Cloud Tag Check:                      │
│     Has item already been tagged with this IMDb ID?    │
│     ├── Yes ──► Direct Stream Match (0ms latency!)     │
│     └── No  ──► Resolve Title & Match                  │
│                                                        │
│  3. Deterministic Release Parser:                      │
│     Clean title, season, episode, quality, audio       │
│                                                        │
│  4. Episode & Media Matcher:                           │
│     - Movies: filter out samples, pick primary video   │
│     - Series: match exact file for SxxExx              │
│                                                        │
│  5. Background Tagging:                                │
│     Write matched IMDb ID to TorBox tags               │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ TorBox Permalink (redirect=true)
                   Direct High-Speed Stream
```

---

## Environment Configuration

If you are self-hosting your own private instance:

### 1. Create `.env`
```bash
cp .env.example .env
```

### 2. Configure Keys
```env
# Port for local server (default: 7000)
PORT=7000

# TorBox API Key (Required for single-user zero-config self-hosting)
TORBOX_API_KEY=your_torbox_api_key_here

# MDBList API Key (Optional)
MDBLIST_API_KEY=your_mdblist_api_key_here

# TVDB API Key (Optional)
TVDB_API_KEY=your_tvdb_api_key_here
```

---

## Quick Start (Local Setup)

```bash
# 1. Clone repository
git clone https://github.com/Biraj2004/torbox-library-sync-addon.git
cd torbox-library-sync-addon

# 2. Install dependencies
npm install

# 3. Build TypeScript
npm run build

# 4. Start Server
npm start
```

Access the configuration page at:
```
http://127.0.0.1:7000/configure
```

---

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Biraj2004/torbox-library-sync-addon)

- Production URL: `https://torbox-library-sync-addon.vercel.app`

---

## Security & Dynamic Cryptography

- **AES-256-GCM Token Encryption:** User credentials are never exposed in plaintext in the manifest URL. They are masked and encrypted into an authenticated AES-256-GCM token with random IVs and verification tags.
- **Zero-Storage:** No credentials or user tokens are ever saved to disk, database, or server logs.
- **No Password Manager Interference:** Inputs are styled with CSS-based masking (`text-security: disc`) without triggering browser password generator popups.
- **Permalinks:** Streams are generated using TorBox's official `redirect=true` permalinks, streaming content directly from TorBox's CDN to your player.
- See [SECURITY.md](SECURITY.md) for vulnerability reporting and security specifications.

---

## License

This project is licensed under the [MIT License](LICENSE).

Authored & maintained by **[Biraj Sarkar](https://github.com/Biraj2004)**.
