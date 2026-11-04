const MDBLIST_BASE = "https://mdblist.com/api";

export interface MDBListHit {
  id?: number;
  title: string;
  year?: number;
  imdbid?: string;
  tmdbid?: number;
  tvdbid?: number;
  type?: string;
}

const mdblistCache = new Map<string, { hit: MDBListHit | null; at: number }>();
const TTL_MS = 60 * 60 * 1000;

export async function searchMDBList(
  apiKey: string,
  type: "movie" | "series",
  title: string,
  year?: number,
): Promise<MDBListHit | null> {
  if (!apiKey) return null;

  const mType = type === "series" ? "show" : "movie";
  const cacheKey = `${mType}:${title}:${year ?? ""}`;
  const cached = mdblistCache.get(cacheKey);
  if (cached && Date.now() - cached.at < TTL_MS) {
    return cached.hit;
  }

  try {
    let url = `${MDBLIST_BASE}/?apikey=${encodeURIComponent(apiKey)}&s=${encodeURIComponent(title)}&m=${mType}`;
    if (year) {
      url += `&y=${year}`;
    }

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = (await res.json()) as {
      search?: Array<{
        title: string;
        year?: number;
        imdbid?: string;
        tmdbid?: number;
        tvdbid?: number;
        type?: string;
      }>;
    };

    const items = data.search ?? [];
    if (items.length === 0) {
      mdblistCache.set(cacheKey, { hit: null, at: Date.now() });
      return null;
    }

    let pick = items[0];
    if (year) {
      const byYear = items.find((i) => i.year === year || (i.year && Math.abs(i.year - year) <= 1));
      if (byYear) pick = byYear;
    }

    const hit: MDBListHit = {
      title: pick.title,
      year: pick.year,
      imdbid: pick.imdbid,
      tmdbid: pick.tmdbid,
      tvdbid: pick.tvdbid,
      type: pick.type,
    };

    mdblistCache.set(cacheKey, { hit, at: Date.now() });
    return hit;
  } catch (err) {
    console.error("MDBList error:", err);
    return null;
  }
}

