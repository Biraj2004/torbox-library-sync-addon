<div align="center">
  <img src="public/logo.svg" alt="Torbox Library Sync Addon Logo" width="96" height="96" />
  <h1>Torbox Library Sync Addon</h1>
  <p><strong>High-performance, privacy-first personal TorBox cloud streamer for Stremio and Nuvio with sub-millisecond deterministic metadata matching</strong></p>

  <p>
    <a href="https://torbox-library-sync-addon.vercel.app"><img src="https://img.shields.io/badge/Vercel-Live%20Deployment-000000?style=for-the-badge&logo=vercel" alt="Vercel" /></a>
    <a href="https://iambiraj.vercel.app"><img src="https://img.shields.io/badge/Author-Biraj%20Sarkar-000000?style=for-the-badge&logo=vercel" alt="Biraj Sarkar Portfolio" /></a>
    <a href="https://stremio.com"><img src="https://img.shields.io/badge/Client-Stremio-7B5BF5?style=for-the-badge&logo=stremio&logoColor=white" alt="Stremio" /></a>
    <a href="https://nuvio.stream"><img src="https://img.shields.io/badge/Client-Nuvio-2563EB?style=for-the-badge" alt="Nuvio" /></a>
    <a href="https://github.com/Biraj2004/torbox-library-sync-addon"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-success?style=for-the-badge" alt="License: MIT" /></a>
  </p>

  <p>
    <a href="https://torbox-library-sync-addon.vercel.app"><strong>Launch Web App</strong></a> •
    <a href="https://iambiraj.vercel.app"><strong>Developer Portfolio</strong></a> •
    <a href="#overview">Overview</a> •
    <a href="#supported-torbox-media-types">Supported Media</a> •
    <a href="#dynamic-stream-labeling">Stream Labels</a> •
    <a href="#architecture--metadata-waterfall">Architecture</a> •
    <a href="#dual-operation-modes">Dual Modes</a> •
    <a href="#security--client-side-cryptography">Security</a>
  </p>
</div>

---

## Overview

When using debrid-based media players like **Stremio** and **Nuvio**, community scrapers (such as Torrentio, MediaFusion, or Comet) often report that a requested torrent is **not cached**. When you add the magnet link or web download directly to your personal [TorBox](https://torbox.app) account, it is cached immediately.

However, upon refreshing Stremio, the media often **still does not appear** because:
1. Public scrapers rely on public indexer hashes that differ from your uploaded files.
2. Scrapers have stale cache time-to-live (TTL) limits.
3. No direct connection existed between Stremio and your personal TorBox cloud storage.

**Torbox Library Sync Addon** bridges this gap. Created by [Biraj Sarkar](https://iambiraj.vercel.app), it connects directly to your personal TorBox account, indexes your **Torrents**, **Web Downloads (DDL)**, and **Usenet** files in parallel, resolves media metadata deterministically in under 1 millisecond, and generates direct, high-speed CDN streams.

---

## Supported TorBox Media Types

The addon synchronizes all three storage namespaces provided by TorBox simultaneously:

| Namespace | TorBox API Endpoint | Description |
| :--- | :--- | :--- |
| **Torrents** | `/v1/api/torrents/mylist` | Cached torrent magnets, multi-file releases, and season packs. |
| **Web Downloads (DDL)** | `/v1/api/webdl/mylist` | Direct internet links, cyberlocker files (e.g. SkymoviesHD, Mega, Rapidgator), and single video files. |
| **Usenet** | `/v1/api/usenet/mylist` | Usenet NZB downloads and cached binaries. |

All three categories are queried concurrently using `Promise.allSettled`, unified into an in-memory index, and routed to their respective permalink streaming handlers.

---

## Dynamic Stream Labeling

Stream responses are formatted dynamically following modern community standards with rich release metadata:

### Title Badge (Top Line in Stremio)
- **Web Downloads:** `TorBox WebDL [4K]`, `TorBox WebDL [1080p]`
- **Torrents:** `TorBox [4K]`, `TorBox [1080p]`
- **Usenet:** `TorBox Usenet [4K]`, `TorBox Usenet [1080p]`

### Multi-Line Description Template
```text
{stream.name}
{if stream.quality}🎥 {stream.quality} {/if}{if stream.codec}🎞️ {stream.codec} {/if}{if stream.bit_depth} • {stream.bit_depth}-bit {/if}
{if stream.hdr_formats}🎨 {stream.hdr_formats|join(' ')} {/if}{if stream.audio_formats} 🎧 {stream.audio_formats|join(' ')} {/if}{if stream.channels} 🔊 {stream.channels|join(' ')} {/if}
{if stream.size > 0}📦 {stream.size|bytes}{if stream.folderSize > stream.size} / {stream.folderSize|bytes}{/if} {/if}{if stream.seeders > 0} 🌱 {stream.seeders} seeders{/if}
{if stream.languages}🌐 {stream.languages|join(' | ')}{/if}
🔗 {stream.source}{if stream.release_group} | 🏷️ {stream.release_group}{/if}{if stream.uploader} | 👤 {stream.uploader}{/if}
```

### Live Example Renderings
```text
TorBox WebDL [4K]
Keu.Bole.Biplobi.Keu.Bole.Dakat.2026.2160p.HEVC.DS4K.WeB-DL.Bengali.AC3.5.1.x265-SkymoviesHD.mkv
🎥 WEB-DL 🎞️ x265
🎧 AC3 🔊 5.1
📦 5.22 GB
🌐 Bengali
🔗 TorBox WebDL | 🏷️ SkymoviesHD
```

```text
TorBox [1080p]
Severance.S01E03.In.Perpetuity.1080p.ATVP.WEB-DL.DDP5.1.Atmos.H.264-FLUX.mkv
🎥 WEB-DL 🎞️ x264
🎧 Dolby Atmos DDP 🔊 5.1
📦 2.24 GB / 23.28 GB  🌱 18 seeders
🌐 English
🔗 TorBox Torrent | 🏷️ FLUX
```

---

## Target Applications

| Platform | Supported Clients | Setup Method |
| :--- | :--- | :--- |
| **Stremio** | Windows, macOS, Linux, Android, Android TV, Web | Click **Install in Stremio** or copy manifest URL into the search bar |
| **Nuvio** | Web, Desktop, Mobile | Click **Open in Nuvio** or paste manifest URL in Add Custom Addon |

---

## Architecture & Metadata Waterfall

```
Stremio / Nuvio Client
       │
       ▼ GET /:config/stream/[movie|series]/:id.json
┌────────────────────────────────────────────────────────┐
│             Torbox Library Sync Addon                  │
│                                                        │
│  1. Config Unpacking:                                  │
│     Extract TorBox key from AES-256-GCM URL or .env    │
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
│     Normalizes underscores, brackets, codecs, audio,   │
│     languages, channels, and HDR formats               │
│                                                        │
│  6. Background Auto-Tagging:                           │
│     Asynchronously writes "tt..." tag to TorBox        │
│     (Subsequent requests match in < 1ms)               │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼ TorBox Permalink (redirect=true)
                 Direct High-Speed CDN Stream
```

---

## Dual Operation Modes

### 1. Stateless Public Multi-Tenant Mode (Vercel)
- Hosted at `https://torbox-library-sync-addon.vercel.app`.
- **Zero Server Storage:** The server maintains no database and records no user API keys.
- **Client-Side AES-256-GCM Encryption:** Keys are masked and encrypted inside browser memory using the Web Crypto API. The server only unpacks configuration in memory for the single active stream request.

### 2. Local / Single-User Zero-Config Mode (`.env`)
- When self-hosting or developing locally, set `TORBOX_API_KEY` in `.env`.
- The configuration page detects server environment variables automatically and presents an "Environment Configuration Loaded" status.
- The root `/manifest.json` is immediately installable without requiring configuration tokens.

---

## Environment Variables

For local hosting or dedicated instances:

```env
# Server port (default: 7000)
PORT=7000

# TorBox API Key (from https://torbox.app/settings)
TORBOX_API_KEY=your_torbox_api_key_here

# Optional: MDBList Key (alternative titles & foreign aliases)
MDBLIST_API_KEY=your_mdblist_api_key_here

# Optional: TVDB Key (complex season mapping)
TVDB_API_KEY=your_tvdb_api_key_here
```

---

## Local Development & Build

```bash
# Clone the repository
git clone https://github.com/Biraj2004/torbox-library-sync-addon.git
cd torbox-library-sync-addon

# Install dependencies
npm install

# Build TypeScript to dist/
npm run build

# Start local server
npm start
```

Open `http://127.0.0.1:7000/configure` to access the setup page.

---

## Security & Privacy Highlights

- **Stateless Isolation:** No user tokens, passwords, or personal account identifiers are stored on disk or in persistent caches.
- **Web Crypto AES-256-GCM:** Manifest URLs use authenticated encryption with unique 12-byte initialization vectors (IVs).
- **Direct CDN Streaming:** Streams utilize TorBox's official `redirect=true` permalinks (`/torrents/requestdl`, `/webdl/requestdl`, `/usenet/requestdl`), routing traffic directly between TorBox and your media player.
- See [SECURITY.md](SECURITY.md) for vulnerability reporting guidelines.

---

## Author & Attribution

- **Developer:** [Biraj Sarkar](https://iambiraj.vercel.app)
- **Portfolio:** [https://iambiraj.vercel.app](https://iambiraj.vercel.app)
- **GitHub:** [@Biraj2004](https://github.com/Biraj2004)
- **Project Repository:** [Biraj2004/torbox-library-sync-addon](https://github.com/Biraj2004/torbox-library-sync-addon)
- **License:** [MIT License](LICENSE)
