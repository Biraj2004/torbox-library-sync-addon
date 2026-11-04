# Project Architecture & Asset Engineering Guide

> Implementation specification for **Torbox Library Sync Addon** connecting TorBox to Stremio and Nuvio.

---

## 1. Favicon & Logo Scaling Engineering

### Why Favicons Look Small (And How It Is Solved)
In browser tabs, favicons are rendered in a tiny $16\times 16\text{ px}$ or $32\times 32\text{ px}$ square.
A common mistake is placing an icon inside a large dark rounded container with excessive margin padding (e.g. 6px margin on each side of a 32px canvas).
- **The Defect:** When a 32px canvas has 6px padding on all sides, the actual colored glyph only occupies $20\text{ px}$ (62.5% optical width). In a 16px browser tab, the glyph shrinks to $\approx 10\text{ px}$, looking tiny, blurred, and unreadable.
- **The Standard Solution:**
  1. In [`public/favicon.svg`](../public/favicon.svg), eliminate wasteful container margins and allow the colored isometric cube facets to bleed to **$93\%$ of the viewBox** (`x: 1.5` to `30.5`, `y: 1.5` to `30.5`).
  2. The central white synchronization flow pulse uses high contrast with intentional integer and half-integer grid alignments so lines remain crisp and bold at 16px.
  3. A subtle drop-shadow filter ensures visibility on both light and dark browser tab backgrounds.

---

## 2. Multi-Tier Metadata & Fallback Architecture

### Handling Optional Configuration Keys
1. **Tier 1 (Cinemeta - Default & Free):**
   - Free, open, and maintained by Stremio.
   - Requires zero API keys and has zero rate limits.
   - Always checked first. Covers >99% of titles.
2. **Tier 2 (MDBList - Optional):**
   - Only queried if the user provided an `mdblistApiKey` AND Cinemeta did not find the title.
   - If omitted or invalid, it gracefully returns `null` and falls back to Cinemeta.
3. **Tier 3 (TVDB - Optional):**
   - Optional helper for anime arcs and non-standard season numbering.
   - Authenticates via JWT token caching.

---

## 3. Cloud Auto-Tagging & Cache Hierarchy

- **Local Memory Cache:** `getMyList` uses an adaptive 15-second cache to prevent spamming TorBox while ensuring newly added torrents appear almost immediately upon refresh.
- **TorBox Cloud Tags:** Once matched to an IMDb ID, the addon calls TorBox's `/torrents/edittorrent` API to append the IMDb tag (e.g. `tt11280740`) to the torrent in the background.
- **0ms Fast Path:** Subsequent queries across any device (Stremio Android, Desktop, Nuvio Web) match the torrent tag directly without requiring any metadata lookup.

