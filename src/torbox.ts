import { isSampleOrJunk, isVideoFile, matchEpisodeInFile } from "./parser";

const API_BASE = "https://api.torbox.app/v1/api";

export type TorBoxMediaType = "torrent" | "webdl" | "usenet";

export interface TorBoxFile {
  id: number;
  name: string;
  short_name?: string;
  size: number;
  mimetype?: string;
}

export interface TorBoxTorrent {
  id: number;
  name: string;
  hash?: string;
  size: number;
  tags?: string[];
  download_finished?: boolean;
  download_present?: boolean;
  mediaType: TorBoxMediaType;
  files?: TorBoxFile[];
}

interface MyListResponse {
  success: boolean;
  detail?: string;
  data?: any[];
}

interface UserMeResponse {
  success: boolean;
  detail?: string;
  data?: {
    id?: number;
    email?: string;
    plan?: number;
  };
}

const listCache = new Map<string, { at: number; data: TorBoxTorrent[] }>();
const inFlightRequests = new Map<string, Promise<TorBoxTorrent[]>>();
const CACHE_TTL_MS = 20_000; // 20s cache for burst protection and near-instant responsiveness
const MAX_CACHE_ENTRIES = 500;

function pruneCache() {
  if (listCache.size <= MAX_CACHE_ENTRIES) return;
  const now = Date.now();
  for (const [key, entry] of listCache.entries()) {
    if (now - entry.at > CACHE_TTL_MS) {
      listCache.delete(key);
    }
  }
}

/**
 * Retrieves the user's active TorBox torrents, web downloads, and usenet items
 * in parallel with an in-memory 20-second cache and concurrent in-flight request deduplication.
 */
export async function getMyList(
  apiKey: string,
  forceFresh = false,
): Promise<TorBoxTorrent[]> {
  const cached = listCache.get(apiKey);
  if (!forceFresh && cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  // Deduplicate simultaneous in-flight network requests for the same API key
  const pending = inFlightRequests.get(apiKey);
  if (!forceFresh && pending) {
    return pending;
  }

  const fetchPromise = (async () => {
    try {
      const bypass = forceFresh ? "true" : "false";
      const headers = { Authorization: `Bearer ${apiKey}` };

      const [torrentsRes, webdlRes, usenetRes] = await Promise.allSettled([
        fetch(`${API_BASE}/torrents/mylist?bypass_cache=${bypass}`, { headers }),
        fetch(`${API_BASE}/webdl/mylist?bypass_cache=${bypass}`, { headers }),
        fetch(`${API_BASE}/usenet/mylist?bypass_cache=${bypass}`, { headers }),
      ]);

      const allItems: TorBoxTorrent[] = [];

      // 1. Process Torrents
      if (torrentsRes.status === "fulfilled" && torrentsRes.value.ok) {
        try {
          const json = (await torrentsRes.value.json()) as MyListResponse;
          for (const t of json.data ?? []) {
            allItems.push({
              ...t,
              mediaType: "torrent",
              files: t.files && t.files.length > 0 ? t.files : [{ id: 1, name: t.name, size: t.size }],
            });
          }
        } catch (e) {
          console.error("Failed to parse torrents list:", e);
        }
      }

      // 2. Process Web Downloads (DDL / WebDL)
      if (webdlRes.status === "fulfilled" && webdlRes.value.ok) {
        try {
          const json = (await webdlRes.value.json()) as MyListResponse;
          for (const w of json.data ?? []) {
            allItems.push({
              ...w,
              mediaType: "webdl",
              files: w.files && w.files.length > 0 ? w.files : [{ id: 1, name: w.name, size: w.size }],
            });
          }
        } catch (e) {
          console.error("Failed to parse webdl list:", e);
        }
      }

      // 3. Process Usenet Downloads
      if (usenetRes.status === "fulfilled" && usenetRes.value.ok) {
        try {
          const json = (await usenetRes.value.json()) as MyListResponse;
          for (const u of json.data ?? []) {
            allItems.push({
              ...u,
              mediaType: "usenet",
              files: u.files && u.files.length > 0 ? u.files : [{ id: 1, name: u.name, size: u.size }],
            });
          }
        } catch (e) {
          console.error("Failed to parse usenet list:", e);
        }
      }

      pruneCache();
      listCache.set(apiKey, { at: Date.now(), data: allItems });
      return allItems;
    } finally {
      inFlightRequests.delete(apiKey);
    }
  })();

  inFlightRequests.set(apiKey, fetchPromise);
  return fetchPromise;
}

/**
 * Tests whether a given TorBox API key is valid by querying /v1/api/user/me.
 */
export async function testTorboxKey(
  apiKey: string,
): Promise<{ valid: boolean; plan?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/user/me`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return { valid: false, error: `Invalid key (HTTP ${res.status})` };
    }

    const json = (await res.json()) as UserMeResponse;
    if (!json.success || !json.data) {
      return { valid: false, error: json.detail || "Authentication failed" };
    }

    const planNames: Record<number, string> = {
      0: "Free",
      1: "Essential",
      2: "Pro",
      3: "Standard",
    };
    const planStr = json.data.plan !== undefined ? planNames[json.data.plan] || `Plan ${json.data.plan}` : "Active";

    return {
      valid: true,
      plan: planStr,
    };
  } catch (err: any) {
    return { valid: false, error: err.message || "Network error" };
  }
}

export function expandTags(tags?: string[]): string[] {
  return (tags ?? []).flatMap((t) => t.split(",")).map((t) => t.trim());
}

export function hasTag(torrent: TorBoxTorrent, tag: string): boolean {
  return expandTags(torrent.tags).includes(tag);
}

const IMDB_RE = /^tt\d+$/;

export function imdbIdOf(torrent: TorBoxTorrent): string | undefined {
  return expandTags(torrent.tags).find((t) => IMDB_RE.test(t));
}

export function mergeTags(torrent: TorBoxTorrent, ...add: string[]): string[] {
  return Array.from(new Set([...expandTags(torrent.tags), ...add])).filter(
    Boolean,
  );
}

/**
 * Asynchronously updates tags on a TorBox torrent, web download, or usenet item.
 */
export async function editTorrentTags(
  apiKey: string,
  itemId: number,
  tags: string[],
  mediaType: TorBoxMediaType = "torrent",
): Promise<void> {
  try {
    const endpoint =
      mediaType === "webdl"
        ? `${API_BASE}/webdl/editwebdownload`
        : mediaType === "usenet"
          ? `${API_BASE}/usenet/editusenetdownload`
          : `${API_BASE}/torrents/edittorrent`;

    const bodyPayload =
      mediaType === "webdl"
        ? { web_id: itemId, webdownload_id: itemId, tags }
        : mediaType === "usenet"
          ? { usenet_id: itemId, tags }
          : { torrent_id: itemId, tags };

    await fetch(endpoint, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });
  } catch (err) {
    // Non-blocking: background tagging failure should never affect streaming
  }
}

/**
 * Selects the primary movie file from a torrent, automatically ignoring samples and extras.
 */
export function pickMainMovieFile(torrent: TorBoxTorrent): TorBoxFile | undefined {
  const files = torrent.files ?? [];
  if (files.length === 0) return undefined;

  // Filter video files and discard samples/extras
  const validVideos = files.filter(
    (f) => isVideoFile(f.name) && !isSampleOrJunk(f.name, f.size),
  );

  const pool = validVideos.length > 0 ? validVideos : files.filter((f) => isVideoFile(f.name));
  if (pool.length === 0) return files[0];

  // Pick largest video file (main movie)
  return pool.reduce((a, b) => (b.size > a.size ? b : a));
}

/**
 * Finds the specific video file inside a torrent that matches a target season and episode.
 */
export function matchTorboxFileForEpisode(
  torrent: TorBoxTorrent,
  season: number,
  episode: number,
): TorBoxFile | undefined {
  const files = torrent.files ?? [];
  if (files.length === 0) return undefined;

  const validVideos = files.filter(
    (f) => isVideoFile(f.name) && !isSampleOrJunk(f.name, f.size),
  );
  const candidates = validVideos.length > 0 ? validVideos : files;

  // 1. Direct match with matchEpisodeInFile
  const matched = candidates.find((f) => matchEpisodeInFile(f.name, season, episode));
  if (matched) return matched;

  // 2. Also check short_name if present
  const matchShort = candidates.find(
    (f) => f.short_name && matchEpisodeInFile(f.short_name, season, episode),
  );
  if (matchShort) return matchShort;

  return undefined;
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

/**
 * Builds the official TorBox permalink stream URL with redirect=true,
 * supporting torrents, web downloads, and usenet items.
 */
export function buildStreamUrl(
  apiKey: string,
  itemId: number,
  fileId: number,
  mediaType: TorBoxMediaType = "torrent",
): string {
  const encKey = encodeURIComponent(apiKey);
  if (mediaType === "webdl") {
    return `${API_BASE}/webdl/requestdl?token=${encKey}&web_id=${itemId}&webdl_id=${itemId}&file_id=${fileId}&redirect=true`;
  }
  if (mediaType === "usenet") {
    return `${API_BASE}/usenet/requestdl?token=${encKey}&usenet_id=${itemId}&file_id=${fileId}&redirect=true`;
  }
  return `${API_BASE}/torrents/requestdl?token=${encKey}&torrent_id=${itemId}&file_id=${fileId}&redirect=true`;
}
