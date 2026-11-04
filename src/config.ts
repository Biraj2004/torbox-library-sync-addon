import crypto from "crypto";

export const ADDON_NAME = "Torbox Library Sync";

export interface AddonConfig {
  torboxApiKey: string;
  mdblistApiKey?: string;
  tvdbApiKey?: string;
}

const MASTER_SALT = "torbox-library-sync-addon-v2-master-secret-salt-2026";
const ENCRYPTION_SECRET = process.env.ENCRYPTION_KEY?.trim() || MASTER_SALT;
const CIPHER_KEY = crypto.createHash("sha256").update(ENCRYPTION_SECRET).digest();

export function getDefaultConfig(): AddonConfig | null {
  const torbox = process.env.TORBOX_API_KEY?.trim();
  if (!torbox) return null;
  return {
    torboxApiKey: torbox,
    mdblistApiKey: process.env.MDBLIST_API_KEY?.trim() || undefined,
    tvdbApiKey: process.env.TVDB_API_KEY?.trim() || undefined,
  };
}

/**
 * Encrypts user credentials into a tamper-proof AES-256-GCM token with random IV.
 * Raw API keys are never exposed in plaintext URLs.
 */
export function encryptConfig(config: AddonConfig): string {
  const cleanConfig = {
    torboxApiKey: config.torboxApiKey.trim(),
    mdblistApiKey: config.mdblistApiKey?.trim() || undefined,
    tvdbApiKey: config.tvdbApiKey?.trim() || undefined,
  };
  const text = JSON.stringify(cleanConfig);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", CIPHER_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: [1 byte version][12 bytes IV][16 bytes auth tag][ciphertext]
  const packed = Buffer.concat([Buffer.from([1]), iv, tag, encrypted]);
  return "enc_" + packed.toString("base64url");
}

/**
 * Decrypts an AES-256-GCM token back into structured AddonConfig.
 */
export function decryptConfig(token: string): AddonConfig | null {
  if (!token.startsWith("enc_")) return null;
  try {
    const raw = Buffer.from(token.slice(4), "base64url");
    if (raw.length < 1 + 12 + 16 + 1) return null;
    const version = raw[0];
    if (version !== 1) return null;

    const iv = raw.subarray(1, 13);
    const tag = raw.subarray(13, 29);
    const ciphertext = raw.subarray(29);

    const decipher = crypto.createDecipheriv("aes-256-gcm", CIPHER_KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const parsed = JSON.parse(decrypted.toString("utf8")) as Partial<AddonConfig>;

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

/**
 * Universal decoder supporting both encrypted AES-256-GCM tokens and legacy tokens.
 */
export function decodeConfig(encoded: string): AddonConfig | null {
  if (!encoded) return null;
  if (encoded.startsWith("enc_")) {
    return decryptConfig(encoded);
  }
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
