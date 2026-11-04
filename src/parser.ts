/**
 * Interface representing structured metadata extracted from a raw release filename.
 */
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
  bitDepth?: number;
  hdrFormats?: string[];
  audioFormats?: string[];
  channels?: string[];
  languages?: string[];
  audio?: string;
  group?: string;
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

export interface FormatStreamDescriptionOptions {
  fileName: string;
  parsed: ParsedRelease;
  fileSize: number;
  folderSize?: number;
  source: string;
  seeders?: number;
  uploader?: string;
}

/**
 * Resolves a clean display filename from raw paths or repeated folder structures
 * (e.g. "Movie.mkv/Movie.mkv" -> "Movie.mkv" or "Season.Pack/Show.S01E03.mkv" -> "Show.S01E03.mkv").
 */
export function extractCleanFileName(rawName: string): string {
  if (!rawName) return "";
  const normalized = rawName.replace(/\\/g, "/").trim();
  const segments = normalized.split("/").map((s) => s.trim()).filter(Boolean);
  if (segments.length === 0) return normalized;
  if (segments.length === 1) return segments[0];

  const last = segments[segments.length - 1];
  const secondLast = segments[segments.length - 2];

  // Case 1: Exact or case-insensitive duplicate (e.g. "Name.mkv/Name.mkv")
  if (last.toLowerCase() === secondLast.toLowerCase()) {
    return last;
  }

  // Case 2: One has extension, one does not (e.g. "Movie.2024/Movie.2024.mkv" or "Movie.2024.mkv/Movie.2024")
  const stripExt = (s: string) => s.replace(/\.[a-z0-9]{2,4}$/i, "");
  if (stripExt(last).toLowerCase() === stripExt(secondLast).toLowerCase()) {
    return last.includes(".") ? last : secondLast;
  }

  // Case 3: If the last segment is a recognized video file and not a trivial generic name (e.g. "feature.mp4", "1.mkv")
  const isGeneric = /^(video|movie|film|feature|sample|cd\d|disc\d|\d+)\.[a-z0-9]{2,4}$/i.test(last);
  if (!isGeneric && /\.(mkv|mp4|avi|mov|webm|m4v|ts|flv|wmv)$/i.test(last)) {
    return last;
  }

  // Case 4: If the last segment is generic, combine with parent folder name for context
  if (isGeneric && secondLast) {
    return `${secondLast} (${last})`;
  }

  return last;
}

/**
 * Formats multi-line dynamic stream description according to user specification.
 */
export function formatStreamDescription(opts: FormatStreamDescriptionOptions): string {
  const { fileName, parsed, fileSize, folderSize, source, seeders, uploader } = opts;
  const lines: string[] = [];

  // Line 1: {stream.name} - Clean redundant folder path prefixes
  const cleanName = extractCleanFileName(fileName);
  lines.push(cleanName);

  // Line 2: {if stream.quality}🎥 {stream.quality} {/if}{if stream.codec}🎞️ {stream.codec} {/if}{if stream.bit_depth} • {stream.bit_depth}-bit {/if}
  const line2Parts: string[] = [];
  if (parsed.source) {
    line2Parts.push(`🎥 ${parsed.source}`);
  }
  if (parsed.codec) {
    line2Parts.push(`🎞️ ${parsed.codec}`);
  }
  if (parsed.bitDepth) {
    line2Parts.push(`• ${parsed.bitDepth}-bit`);
  }
  if (line2Parts.length > 0) {
    lines.push(line2Parts.join(" "));
  }

  // Line 3: {if stream.hdr_formats}🎨 {stream.hdr_formats|join(' ')} {/if}{if stream.audio_formats} 🎧 {stream.audio_formats|join(' ')} {/if}{if stream.channels} 🔊 {stream.channels|join(' ')} {/if}
  const line3Parts: string[] = [];
  if (parsed.hdrFormats && parsed.hdrFormats.length > 0) {
    line3Parts.push(`🎨 ${parsed.hdrFormats.join(" ")}`);
  }
  if (parsed.audioFormats && parsed.audioFormats.length > 0) {
    line3Parts.push(`🎧 ${parsed.audioFormats.join(" ")}`);
  }
  if (parsed.channels && parsed.channels.length > 0) {
    line3Parts.push(`🔊 ${parsed.channels.join(" ")}`);
  }
  if (line3Parts.length > 0) {
    lines.push(line3Parts.join(" "));
  }

  // Line 4: {if stream.size > 0}📦 {stream.size|bytes}{if stream.folderSize > stream.size} / {stream.folderSize|bytes}{/if} {/if}{if stream.seeders > 0} {/if}
  if (fileSize > 0) {
    let sizeStr = `📦 ${formatBytes(fileSize)}`;
    if (folderSize && folderSize > fileSize) {
      sizeStr += ` / ${formatBytes(folderSize)}`;
    }
    if (seeders && seeders > 0) {
      sizeStr += `  🌱 ${seeders} seeders`;
    }
    lines.push(sizeStr);
  }

  // Line 5: {if stream.languages}🌐 {stream.languages|join(' | ')}{/if}
  if (parsed.languages && parsed.languages.length > 0) {
    lines.push(`🌐 ${parsed.languages.join(" | ")}`);
  }

  // Line 6: 🔗 {stream.source}{if stream.release_group} | 🏷️ {stream.release_group}{/if}{if stream.uploader} {/if}
  let line6 = `🔗 ${source}`;
  if (parsed.group) {
    line6 += ` | 🏷️ ${parsed.group}`;
  }
  if (uploader) {
    line6 += ` | 👤 ${uploader}`;
  }
  lines.push(line6);

  return lines.join("\n");
}

const VIDEO_EXT = /\.(mkv|mp4|avi|mov|webm|m4v|ts|flv|wmv)$/i;

/**
 * Checks whether a filename represents a standard video container.
 */
export function isVideoFile(filename: string): boolean {
  return VIDEO_EXT.test(filename);
}

/**
 * Detects whether a file is a sample clip, trailer, featurette, subtitle, or junk file.
 */
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

/**
 * Normalizes a movie or TV show title for fuzzy comparison by removing punctuation,
 * converting Roman numerals to Arabic, and stripping non-alphanumeric noise.
 */
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

/**
 * Compares two titles for semantic equivalence using normalization and token set overlap.
 */
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

/**
 * Deterministically parses a raw torrent or file name into structured release metadata
 * without requiring any external LLM or cloud API call.
 */
export function parseRelease(rawName: string): ParsedRelease {
  // Extract clean file name without directory slashes or duplicate paths
  const cleanName = extractCleanFileName(rawName);

  // Strip release group brackets for title boundary cutting
  // Normalize underscores to spaces so word boundaries match reliably
  const fullNorm = cleanName
    .replace(/\.(mkv|mp4|avi|mov|webm|m4v|ts|flv|wmv)$/i, "")
    .replace(/[_\[\]]/g, " ");

  let norm = cleanName
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\.(mkv|mp4|avi|mov|webm|m4v|ts|flv|wmv)$/i, "")
    .replace(/_/g, " ");

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
  else if (/web[-_ ]?dl|webrip/i.test(norm)) source = "WEB-DL";
  else if (/hdtv/i.test(norm)) source = "HDTV";
  else if (/dvdrip/i.test(norm)) source = "DVDRip";
  else if (/cam|telesync|hdcam/i.test(norm)) source = "CAM";

  // Match Codec
  let codec: string | undefined;
  if (/x265|h265|hevc/i.test(norm)) codec = "x265";
  else if (/x264|h264|avc/i.test(norm)) codec = "x264";
  else if (/av1/i.test(norm)) codec = "AV1";
  else if (/xvid/i.test(norm)) codec = "XviD";

  // Match Bit Depth
  let bitDepth: number | undefined;
  if (/\b(10-?bits?|10b)\b/i.test(fullNorm)) bitDepth = 10;
  else if (/\b(12-?bits?|12b)\b/i.test(fullNorm)) bitDepth = 12;
  else if (/\b(8-?bits?|8b)\b/i.test(fullNorm)) bitDepth = 8;

  // Match HDR Formats
  const hdrFormats: string[] = [];
  if (/\b(dv|dovi|dolby\s*vision)\b/i.test(fullNorm)) hdrFormats.push("DV");
  if (/\b(hdr10\+|hdr10plus)\b/i.test(fullNorm)) hdrFormats.push("HDR10+");
  else if (/\bhdr10\b/i.test(fullNorm)) hdrFormats.push("HDR10");
  else if (/\bhdr\b/i.test(fullNorm)) hdrFormats.push("HDR");
  if (/\bhlg\b/i.test(fullNorm)) hdrFormats.push("HLG");

  // Match Audio Formats
  const audioFormats: string[] = [];
  if (/(?:^|\b)(atmos|dolby\s*atmos)\b/i.test(fullNorm)) audioFormats.push("Dolby Atmos");
  if (/(?:^|\b)truehd\b/i.test(fullNorm)) audioFormats.push("TrueHD");
  if (/(?:^|\b)(ddp|eac3|dd\+)/i.test(fullNorm)) audioFormats.push("DDP");
  else if (/(?:^|\b)(ac3|dd)(?:$|\b|\d)/i.test(fullNorm)) audioFormats.push("AC3");
  if (/(?:^|\b)(dts-?hd\s*ma)\b/i.test(fullNorm)) audioFormats.push("DTS-HD MA");
  else if (/(?:^|\b)dts-?hd\b/i.test(fullNorm)) audioFormats.push("DTS-HD");
  else if (/(?:^|\b)dts\b/i.test(fullNorm)) audioFormats.push("DTS");
  if (/(?:^|\b)aac\b/i.test(fullNorm)) audioFormats.push("AAC");
  if (/(?:^|\b)flac\b/i.test(fullNorm)) audioFormats.push("FLAC");
  if (/(?:^|\b)opus\b/i.test(fullNorm)) audioFormats.push("Opus");

  let audio: string | undefined;
  if (audioFormats.length > 0) audio = audioFormats.join(" ");

  // Match Audio Channels
  const channels: string[] = [];
  const chanMatch = fullNorm.match(/(?:ddp|ac3|dts|aac|dd\+)?\s*(7[ ._]1|5[ ._]1|2[ ._]0)\b/i);
  if (chanMatch) {
    channels.push(chanMatch[1].replace(/[ ._]/, "."));
  }

  // Match Languages
  const languages: string[] = [];
  if (/\b(bengali|bangla)\b/i.test(fullNorm)) languages.push("Bengali");
  if (/\bhindi\b/i.test(fullNorm)) languages.push("Hindi");
  if (/\benglish\b/i.test(fullNorm)) languages.push("English");
  if (/\btamil\b/i.test(fullNorm)) languages.push("Tamil");
  if (/\btelugu\b/i.test(fullNorm)) languages.push("Telugu");
  if (/\bmalayalam\b/i.test(fullNorm)) languages.push("Malayalam");
  if (/\bkannada\b/i.test(fullNorm)) languages.push("Kannada");
  if (/\b(dual\s*audio|dual)\b/i.test(fullNorm)) languages.push("Dual Audio");
  if (/\b(multi\s*audio|multi)\b/i.test(fullNorm)) languages.push("Multi Audio");
  if (/\bspanish|espanol\b/i.test(fullNorm)) languages.push("Spanish");
  if (/\bfrench|vff|vfi\b/i.test(fullNorm)) languages.push("French");
  if (/\bgerman\b/i.test(fullNorm)) languages.push("German");
  if (/\bitalian\b/i.test(fullNorm)) languages.push("Italian");
  if (/\bjapanese\b/i.test(fullNorm)) languages.push("Japanese");
  if (/\bkorean\b/i.test(fullNorm)) languages.push("Korean");

  // Release Group (e.g. -SkymoviesHD, -FLUX, -ION10, -SPARKS)
  const groupMatch = rawName.replace(/\.(mkv|mp4|avi|mov|webm|m4v|ts|flv|wmv)$/i, "").match(/[-_]([a-zA-Z0-9]+)$/);
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
    .replace(/[._\-()\[\]]+/g, " ")
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
    bitDepth,
    hdrFormats,
    audioFormats,
    channels,
    languages,
    audio,
    group,
  };
}

/**
 * Matches whether a specific file within a torrent or season pack corresponds to a target
 * season and episode number (supporting SxxExx, 1x03, multi-episode ranges, and season directories).
 */
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

