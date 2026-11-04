const CINEMETA_BASE = "https://v3-cinemeta.strem.io";

export interface CinemetaMeta {
  id: string;
  name: string;
  year?: number;
  releaseInfo?: string;
  type?: string;
}

const metaCache = new Map<string, { meta: CinemetaMeta; at: number }>();
const searchCache = new Map<string, { hit: CinemetaMeta | null; at: number }>();
const TTL_MS = 60 * 60 * 1000; // 1 hour memory cache

export async function getCinemetaMeta(
  type: "movie" | "series",
  imdbId: string,
): Promise<CinemetaMeta | null> {
  const cacheKey = `${type}:${imdbId}`;
  const cached = metaCache.get(cacheKey);
  if (cached && Date.now() - cached.at < TTL_MS) {
    return cached.meta;
  }

  try {
    const res = await fetch(`${CINEMETA_BASE}/meta/${type}/${imdbId}.json`);
    if (!res.ok) return null;

    const data = (await res.json()) as { meta?: { id: string; name: string; year?: string; releaseInfo?: string } };
    if (!data.meta) return null;

    const rawYear = data.meta.releaseInfo || data.meta.year;
    const yearMatch = rawYear?.match(/\b(19\d{2}|20\d{2})\b/);
    const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : undefined;

    const meta: CinemetaMeta = {
      id: data.meta.id,
      name: data.meta.name,
      year: parsedYear,
      releaseInfo: data.meta.releaseInfo,
      type,
    };

    metaCache.set(cacheKey, { meta, at: Date.now() });
    return meta;
  } catch (err) {
    console.error(`Cinemeta error for ${type} ${imdbId}:`, err);
    return null;
  }
}

export async function searchCinemeta(
  type: "movie" | "series",
  title: string,
  year?: number,
): Promise<CinemetaMeta | null> {
  const cacheKey = `${type}:${title}:${year ?? ""}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.at < TTL_MS) {
    return cached.hit;
  }

  try {
    const url = `${CINEMETA_BASE}/catalog/${type}/top/search=${encodeURIComponent(title)}.json`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = (await res.json()) as {
      metas?: Array<{ id: string; name: string; year?: string; releaseInfo?: string }>;
    };
    const metas = data.metas ?? [];
    if (metas.length === 0) {
      searchCache.set(cacheKey, { hit: null, at: Date.now() });
      return null;
    }

    let pick = metas[0];
    if (year) {
      const match = metas.find((m) => {
        const yStr = m.releaseInfo || m.year || "";
        return yStr.includes(String(year));
      });
      if (match) pick = match;
    }

    const rawYear = pick.releaseInfo || pick.year;
    const yearMatch = rawYear?.match(/\b(19\d{2}|20\d{2})\b/);
    const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : undefined;

    const hit: CinemetaMeta = {
      id: pick.id,
      name: pick.name,
      year: parsedYear,
      releaseInfo: pick.releaseInfo,
      type,
    };

    searchCache.set(cacheKey, { hit, at: Date.now() });
    return hit;
  } catch (err) {
    console.error(`Cinemeta search error for ${title}:`, err);
    return null;
  }
}
