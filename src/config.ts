export const ADDON_NAME = "Torbox Library Sync";

export interface AddonConfig {
  torboxApiKey: string;
  mdblistApiKey?: string;
  tvdbApiKey?: string;
}

export function getDefaultConfig(): AddonConfig | null {
  const torbox = process.env.TORBOX_API_KEY?.trim();
  if (!torbox) return null;
  return {
    torboxApiKey: torbox,
    mdblistApiKey: process.env.MDBLIST_API_KEY?.trim() || undefined,
    tvdbApiKey: process.env.TVDB_API_KEY?.trim() || undefined,
  };
}

export function encodeConfig(config: AddonConfig): string {
  const json = JSON.stringify(config);
  return Buffer.from(json, "utf8").toString("base64url");
}

export function decodeConfig(encoded: string): AddonConfig | null {
  try {
    const json = Buffer.from(encoded, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as Partial<AddonConfig>;
    if (!parsed || typeof parsed.torboxApiKey !== "string" || !parsed.torboxApiKey.trim()) {
      return null;
    }
    return {
      torboxApiKey: parsed.torboxApiKey.trim(),
      mdblistApiKey:
        parsed.mdblistApiKey?.trim() || process.env.MDBLIST_API_KEY?.trim() || undefined,
      tvdbApiKey:
        parsed.tvdbApiKey?.trim() || process.env.TVDB_API_KEY?.trim() || undefined,
    };
  } catch {
    return null;
  }
}
