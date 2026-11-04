export interface ParsedRelease {
  cleanTitle: string;
  year?: number;
  season?: number;
  episode?: number;
  episodeEnd?: number;
  isSeasonPack: boolean;
  resolution?: string;
  source?: string;
  codec?: string;
  audio?: string;
  group?: string;
}

const VIDEO_EXT = /\.(mkv|mp4|avi|mov|webm|m4v|ts|flv|wmv)$/i;

export function isVideoFile(filename: string): boolean {
  return VIDEO_EXT.test(filename);
}

export function isSampleOrJunk(filename: string, sizeBytes?: number): boolean {
  const lower = filename.toLowerCase();
  if (
    lower.includes("sample") ||
    lower.includes("trailer") ||
    lower.includes("featurette") ||
    lower.includes("bonus") ||
    lower.includes("promo") ||
    lower.endsWith(".nfo") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".srt") ||
    lower.endsWith(".sub")
  ) {
    return true;
  }
  // Video files under 80 MB are almost always samples/intros
  if (sizeBytes !== undefined && sizeBytes > 0 && sizeBytes < 80 * 1024 * 1024) {
    return true;
  }
  return false;
}

export function normalizeTitle(title: string): string {
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/&(?:amp;)?/g, "and")
    .replace(/\bviii\b/gi, "8")
    .replace(/\bvii\b/gi, "7")
    .replace(/\bvi\b/gi, "6")
    .replace(/\biv\b/gi, "4")
    .replace(/\biii\b/gi, "3")
    .replace(/\bii\b/gi, "2")
    .replace(/\bv\b/gi, "5")
    .replace(/\bix\b/gi, "9")
    .replace(/\bx\b/gi, "10")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function titlesMatch(a: string, b: string): boolean {
  const normA = normalizeTitle(a);
  const normB = normalizeTitle(b);
  if (!normA || !normB) return false;
  if (normA === normB) return true;

  const stripA = normA.replace(/^the\s+/, "");
  const stripB = normB.replace(/^the\s+/, "");
  if (stripA === stripB) return true;

  // Substring check for titles with sub-names
  if (stripA.length > 5 && stripB.length > 5) {
    if (stripA.startsWith(stripB) || stripB.startsWith(stripA)) return true;
  }

  // Token set overlap
  const wordsA = new Set(stripA.split(" ").filter((w) => w.length > 1));
  const wordsB = new Set(stripB.split(" ").filter((w) => w.length > 1));
  if (wordsA.size === 0 || wordsB.size === 0) return false;

  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  const ratioA = overlap / wordsA.size;
  const ratioB = overlap / wordsB.size;
  return (ratioA >= 0.8 && ratioB >= 0.8) || (wordsA.size >= 2 && wordsB.size >= 2 && overlap >= Math.min(wordsA.size, wordsB.size));
}

export function parseRelease(rawName: string): ParsedRelease {
  // Strip release group brackets like [rarbg], [YTS.MX], [TorrentGalaxy]
  let norm = rawName
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\.(mkv|mp4|avi|mov|webm|m4v|ts|flv|wmv)$/i, "");

  // Match Season and Episode: e.g. S01E03, S1E3, S01E01-E03, 1x03
  const seMatch =
    norm.match(/s(\d{1,2})e(\d{1,3})(?:[-_~eE]+(\d{1,3}))?/i) ||
    norm.match(/(\d{1,2})x(\d{1,3})(?:[-_~xX]+(\d{1,3}))?/i);

  let season = seMatch ? parseInt(seMatch[1], 10) : undefined;
  let episode = seMatch ? parseInt(seMatch[2], 10) : undefined;
  let episodeEnd = seMatch && seMatch[3] ? parseInt(seMatch[3], 10) : undefined;

  // Check Season Pack if not an individual episode
  const sPackMatch = !seMatch ? norm.match(/(?:season|s)\s*(\d{1,2})\b/i) : null;
  const isSeasonPack = !!sPackMatch && !episode;
  if (isSeasonPack && sPackMatch) {
    season = parseInt(sPackMatch[1], 10);
  }

  // Match Year
  const yearMatch = norm.match(/\b(19\d{2}|20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : undefined;

  // Match Resolution
  const resMatch = norm.match(/\b(2160p|4k|uhd|1080p|1080i|720p|480p|576p)\b/i);
  let resolution: string | undefined;
  if (resMatch) {
    const rawRes = resMatch[1].toLowerCase();
    if (rawRes.includes("2160") || rawRes === "4k" || rawRes === "uhd") {
      resolution = "4K";
    } else {
      resolution = resMatch[1].toUpperCase();
    }
  }

  // Match Source
  let source: string | undefined;
  if (/remux/i.test(norm)) source = "REMUX";
  else if (/bluray|bdrip|brrip/i.test(norm)) source = "BluRay";
  else if (/web-?dl|webrip/i.test(norm)) source = "WEB-DL";
  else if (/hdtv/i.test(norm)) source = "HDTV";
  else if (/dvdrip/i.test(norm)) source = "DVDRip";
  else if (/cam|telesync|hdcam/i.test(norm)) source = "CAM";

  // Match Codec
  let codec: string | undefined;
  if (/x265|h265|hevc/i.test(norm)) codec = "HEVC";
  else if (/x264|h264|avc/i.test(norm)) codec = "x264";
  else if (/av1/i.test(norm)) codec = "AV1";
  else if (/xvid/i.test(norm)) codec = "XviD";

  // Match Audio
  let audio: string | undefined;
  if (/atmos/i.test(norm)) audio = "Atmos";
  else if (/truehd/i.test(norm)) audio = "TrueHD";
  else if (/ddp5\.?1|eac3|dd\+5\.?1/i.test(norm)) audio = "DDP 5.1";
  else if (/dts-?hd/i.test(norm)) audio = "DTS-HD";
  else if (/dts/i.test(norm)) audio = "DTS";
  else if (/7\.1/i.test(norm)) audio = "7.1";
  else if (/5\.1|ac3/i.test(norm)) audio = "5.1";
  else if (/aac/i.test(norm)) audio = "AAC";

  // Release Group (e.g. -FLUX, -ION10, -SPARKS)
  const groupMatch = norm.match(/-([a-zA-Z0-9]+)$/);
  const group = groupMatch ? groupMatch[1] : undefined;

  // Title: everything before the earliest delimiter (year, season, resolution, source)
  const cutTokens = [
    yearMatch ? yearMatch[0] : null,
    seMatch ? seMatch[0] : null,
    sPackMatch ? sPackMatch[0] : null,
    resMatch ? resMatch[0] : null,
  ].filter(Boolean) as string[];

  let firstCutIndex = norm.length;
  for (const t of cutTokens) {
    const idx = norm.indexOf(t);
    if (idx !== -1 && idx < firstCutIndex) {
      firstCutIndex = idx;
    }
  }

  let titlePart = norm.substring(0, firstCutIndex);
  const cleanTitle = titlePart
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    cleanTitle,
    year,
    season,
    episode,
    episodeEnd,
    isSeasonPack,
    resolution,
    source,
    codec,
    audio,
    group,
  };
}

export function matchEpisodeInFile(
  filePath: string,
  targetSeason: number,
  targetEpisode: number,
): boolean {
  const norm = filePath.replace(/\\/g, "/");

  // 1. SxxExx pattern
  const seMatches = [...norm.matchAll(/s(\d{1,2})e(\d{1,3})(?:[-_~eE]+(\d{1,3}))?/gi)];
  for (const m of seMatches) {
    const s = parseInt(m[1], 10);
    const eStart = parseInt(m[2], 10);
    const eEnd = m[3] ? parseInt(m[3], 10) : eStart;
    if (s === targetSeason && targetEpisode >= eStart && targetEpisode <= eEnd) {
      return true;
    }
  }

  // 2. 1x03 pattern
  const xMatches = [...norm.matchAll(/(\d{1,2})x(\d{1,3})(?:[-_~xX]+(\d{1,3}))?/gi)];
  for (const m of xMatches) {
    const s = parseInt(m[1], 10);
    const eStart = parseInt(m[2], 10);
    const eEnd = m[3] ? parseInt(m[3], 10) : eStart;
    if (s === targetSeason && targetEpisode >= eStart && targetEpisode <= eEnd) {
      return true;
    }
  }

  // 3. Season in directory path + episode in filename
  const hasSeasonInPath = new RegExp(
    `(?:season|s)[._\\/ -]*0?${targetSeason}(?![0-9])`,
    "i",
  ).test(norm);

  if (hasSeasonInPath) {
    const baseName = norm.split("/").pop() || norm;
    const epMatches = [
      ...baseName.matchAll(/(?:^|[._ -]|ep|episode)0?(\d{1,3})(?=[._ -]|\.[a-z0-9]+$)/gi),
    ];
    for (const m of epMatches) {
      if (parseInt(m[1], 10) === targetEpisode) {
        return true;
      }
    }
  }

  return false;
}

