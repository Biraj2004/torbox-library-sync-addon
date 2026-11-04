import { isSampleOrJunk, isVideoFile, matchEpisodeInFile } from "./parser";

const API_BASE = "https://api.torbox.app/v1/api";

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
  hash: string;
  size: number;
  tags?: string[];
  download_finished?: boolean;
  download_present?: boolean;
  files?: TorBoxFile[];
}

interface MyListResponse {
  success: boolean;
  detail?: string;
  data?: TorBoxTorrent[];
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
const CACHE_TTL_MS = 15_000; // 15s cache for near-instant responsiveness

export async function getMyList(
  apiKey: string,
  forceFresh = false,
): Promise<TorBoxTorrent[]> {
  const cached = listCache.get(apiKey);
  if (!forceFresh && cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.data;
  }

  const res = await fetch(`${API_BASE}/torrents/mylist?bypass_cache=${forceFresh ? "true" : "false"}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    throw new Error(`TorBox mylist HTTP ${res.status}`);
  }

  const json = (await res.json()) as MyListResponse;
  const data = json.data ?? [];
  listCache.set(apiKey, { at: Date.now(), data });
  return data;
}

export async function testTorboxKey(
  apiKey: string,
): Promise<{ valid: boolean; email?: string; plan?: string; error?: string }> {
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
      email: json.data.email,
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

export async function editTorrentTags(
  apiKey: string,
  torrentId: number,
  tags: string[],
): Promise<void> {
  try {
    await fetch(`${API_BASE}/torrents/edittorrent`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ torrent_id: torrentId, tags }),
    });
  } catch (err) {
    console.error(`Failed to update tags for torrent ${torrentId}:`, err);
  }
}

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

export function buildStreamUrl(
  apiKey: string,
  torrentId: number,
  fileId: number,
): string {
  return `${API_BASE}/torrents/requestdl?token=${apiKey}&torrent_id=${torrentId}&file_id=${fileId}&redirect=true`;
}
