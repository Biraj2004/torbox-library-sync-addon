const TVDB_BASE = "https://api4.thetvdb.com/v4";

interface TVDBToken {
  token: string;
  expiresAt: number;
}

const tokenCache = new Map<string, TVDBToken>();

export async function testTVDBKey(
  apiKey: string,
): Promise<{ valid: boolean; error?: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, error: "Missing TVDB API key" };
  }
  try {
    const res = await fetch(`${TVDB_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apikey: apiKey.trim() }),
    });
    if (!res.ok) {
      return { valid: false, error: `Invalid key (HTTP ${res.status})` };
    }
    const data = (await res.json()) as any;
    if (!data.data?.token) {
      return { valid: false, error: "Authentication failed" };
    }
    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err.message || "Network error" };
  }
}

async function getTVDBToken(apiKey: string): Promise<string | null> {
  const cleanKey = apiKey.trim();
  const cached = tokenCache.get(cleanKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.token;
  }

  try {
    const res = await fetch(`${TVDB_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apikey: cleanKey }),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { data?: { token?: string } };
    const token = data.data?.token;
    if (!token) return null;

    // TVDB token is valid for ~28 days, cache for 24 hours
    tokenCache.set(cleanKey, {
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    return token;
  } catch (err) {
    console.error("TVDB login error:", err);
    return null;
  }
}

export async function searchTVDB(
  apiKey: string,
  query: string,
  year?: number,
): Promise<{ tvdbId?: string; name?: string; year?: number } | null> {
  if (!apiKey || !apiKey.trim()) return null;

  try {
    const token = await getTVDBToken(apiKey);
    if (!token) return null;

    let url = `${TVDB_BASE}/search?query=${encodeURIComponent(query)}&type=series`;
    if (year) url += `&year=${year}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      data?: Array<{ tvdb_id?: string; name?: string; year?: string }>;
    };
    const items = data.data ?? [];
    if (items.length === 0) return null;

    const pick = items[0];
    return {
      tvdbId: pick.tvdb_id,
      name: pick.name,
      year: pick.year ? parseInt(pick.year, 10) : undefined,
    };
  } catch (err) {
    console.error("TVDB search error:", err);
    return null;
  }
}
