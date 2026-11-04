import express, { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { Manifest, Stream } from "stremio-addon-sdk";
import {
  getMyList,
  pickMainMovieFile,
  matchTorboxFileForEpisode,
  buildStreamUrl,
  formatBytes,
  editTorrentTags,
  hasTag,
  mergeTags,
  testTorboxKey,
  TorBoxTorrent,
} from "./torbox";
import { parseRelease, titlesMatch } from "./parser";
import { getCinemetaMeta, CinemetaMeta } from "./cinemeta";
import { searchMDBList, testMDBListKey } from "./mdblist";
import { testTVDBKey } from "./tvdb";
import {
  AddonConfig,
  ADDON_NAME,
  decodeConfig,
  encryptConfig,
  getDefaultConfig,
} from "./config";
import { configurePage } from "./configure";
import { renderErrorPage } from "./errorPage";

function buildManifest(configured: boolean): Manifest {
  const manifest: Manifest = {
    id: "org.torbox.librarysync",
    version: "2.0.0",
    name: ADDON_NAME,
    description:
      "Instant personal TorBox cloud streamer for Stremio and Nuvio. Plays your cached movies and TV series with accurate metadata matching.",
    logo: "https://torbox-library-sync-addon.vercel.app/logo.svg",
    background: "https://torbox-library-sync-addon.vercel.app/logo.svg",
    catalogs: [],
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    behaviorHints: {
      configurable: true,
      configurationRequired: !configured,
    },
  };
  return manifest;
}

// In-flight tag persistence set to prevent duplicate API calls
const inFlightTagging = new Set<string>();

async function persistImdbTag(
  torboxApiKey: string,
  torrent: TorBoxTorrent,
  imdbId: string,
): Promise<void> {
  const key = `${torrent.id}:${imdbId}`;
  if (hasTag(torrent, imdbId) || inFlightTagging.has(key)) return;

  inFlightTagging.add(key);
  try {
    const updatedTags = mergeTags(torrent, imdbId);
    await editTorrentTags(torboxApiKey, torrent.id, updatedTags);
    torrent.tags = updatedTags;
  } catch (err) {
    console.error(`Failed to auto-tag torrent ${torrent.id}:`, err);
  } finally {
    inFlightTagging.delete(key);
  }
}

async function resolveMetadata(
  config: AddonConfig,
  type: "movie" | "series",
  imdbId: string,
): Promise<CinemetaMeta | null> {
  // 1. Cinemeta lookup (instant, free)
  const meta = await getCinemetaMeta(type, imdbId);
  if (meta) return meta;

  // 2. MDBList fallback if user provided API key or env key
  if (config.mdblistApiKey) {
    const mdb = await searchMDBList(config.mdblistApiKey, type, imdbId);
    if (mdb && mdb.title) {
      return {
        id: imdbId,
        name: mdb.title,
        year: mdb.year,
        type,
      };
    }
  }

  return null;
}

async function handleStream(
  config: AddonConfig,
  type: string,
  id: string,
): Promise<{ streams: Stream[]; cacheMaxAge?: number }> {
  if (type !== "movie" && type !== "series") {
    return { streams: [] };
  }

  // Parse ID: movies are "tt1234567", series are "tt1234567:season:episode"
  const parts = id.split(":");
  const imdbId = parts[0];
  const season = parts[1] ? parseInt(parts[1], 10) : undefined;
  const episode = parts[2] ? parseInt(parts[2], 10) : undefined;

  if (!imdbId.startsWith("tt")) {
    return { streams: [] };
  }

  // Fetch user's active TorBox torrents
  const torrents = await getMyList(config.torboxApiKey);
  if (torrents.length === 0) {
    return { streams: [], cacheMaxAge: 15 };
  }

  // 1. Direct tag matches (0ms ultra-fast path)
  const directlyTagged = torrents.filter((t) => hasTag(t, imdbId));

  // 2. If not all matched via tags, resolve metadata for title matching
  let targetMeta: CinemetaMeta | null = null;
  const matchedTorrents: TorBoxTorrent[] = [...directlyTagged];

  // Look through untagged torrents
  const untagged = torrents.filter((t) => !hasTag(t, imdbId));
  if (untagged.length > 0) {
    targetMeta = await resolveMetadata(config, type as "movie" | "series", imdbId);

    if (targetMeta) {
      for (const t of untagged) {
        const parsed = parseRelease(t.name);
        if (!parsed.cleanTitle) continue;

        const isTitleMatch = titlesMatch(parsed.cleanTitle, targetMeta.name);
        if (!isTitleMatch) continue;

        if (type === "movie") {
          // Check year proximity if both present
          if (
            parsed.year &&
            targetMeta.year &&
            Math.abs(parsed.year - targetMeta.year) > 1
          ) {
            continue;
          }
          matchedTorrents.push(t);
          // Auto-tag in TorBox for instantaneous next lookup
          persistImdbTag(config.torboxApiKey, t, imdbId);
        } else if (type === "series" && season !== undefined && episode !== undefined) {
          // For series: check if torrent is season pack or contains matching episode file
          const hasMatchingFile = matchTorboxFileForEpisode(t, season, episode);
          if (hasMatchingFile) {
            matchedTorrents.push(t);
            persistImdbTag(config.torboxApiKey, t, imdbId);
          }
        }
      }
    }
  }

  // Deduplicate matched torrents
  const uniqueTorrents = Array.from(new Set(matchedTorrents));

  // Build stream objects
  const streams: Stream[] = [];

  for (const torrent of uniqueTorrents) {
    if (type === "movie") {
      const file = pickMainMovieFile(torrent);
      if (!file) continue;

      const parsed = parseRelease(file.name || torrent.name);
      const resolution = parsed.resolution || "1080p";
      const qualityParts = [
        parsed.source || "WEB-DL",
        parsed.codec,
        parsed.audio,
      ].filter(Boolean);

      const titleLines = [
        `${targetMeta?.name || parsed.cleanTitle || torrent.name}${parsed.year ? ` (${parsed.year})` : ""}`,
        `${formatBytes(file.size)} | ${qualityParts.join(" ") || "Direct Stream"}`,
      ];

      streams.push({
        name: `TorBox [${resolution}]`,
        title: titleLines.join("\n"),
        url: buildStreamUrl(config.torboxApiKey, torrent.id, file.id),
        behaviorHints: {
          group: `torbox-${torrent.id}`,
        },
      });
    } else if (type === "series" && season !== undefined && episode !== undefined) {
      const file = matchTorboxFileForEpisode(torrent, season, episode);
      if (!file) continue;

      const parsed = parseRelease(file.name || torrent.name);
      const resolution = parsed.resolution || "1080p";
      const sNum = String(season).padStart(2, "0");
      const eNum = String(episode).padStart(2, "0");

      const qualityParts = [
        parsed.source || "WEB-DL",
        parsed.codec,
        parsed.audio,
      ].filter(Boolean);

      const titleLines = [
        `${targetMeta?.name || parsed.cleanTitle} S${sNum}E${eNum}`,
        `${formatBytes(file.size)} | ${qualityParts.join(" ") || "Direct Stream"}`,
      ];

      streams.push({
        name: `TorBox [${resolution}]`,
        title: titleLines.join("\n"),
        url: buildStreamUrl(config.torboxApiKey, torrent.id, file.id),
        behaviorHints: {
          group: `torbox-${torrent.id}-s${sNum}`,
        },
      });
    }
  }

  return {
    streams,
    cacheMaxAge: 20, // 20s cache so newly added TorBox media arrives almost immediately
  };
}

const app = express();

app.use(express.json());

// Robust public directory resolution supporting ts-node, compiled dist, and Vercel serverless
const candidatePublicDirs = [
  path.join(process.cwd(), "public"),
  path.resolve(__dirname, "../../public"),
  path.resolve(__dirname, "../public"),
  path.join(process.cwd(), "dist/public"),
];
const publicDir = candidatePublicDirs.find((dir) => fs.existsSync(dir)) || path.join(process.cwd(), "public");

app.use(express.static(publicDir, { index: false }));

// Explicit high-priority asset routes with correct MIME types
app.get("/favicon.svg", (_req, res) => {
  res.type("image/svg+xml").sendFile(path.join(publicDir, "favicon.svg"));
});

app.get("/favicon.ico", (_req, res) => {
  const icoPath = path.join(publicDir, "favicon.ico");
  if (fs.existsSync(icoPath)) {
    res.sendFile(icoPath);
  } else {
    res.type("image/svg+xml").sendFile(path.join(publicDir, "favicon.svg"));
  }
});

app.get("/logo.svg", (_req, res) => {
  res.type("image/svg+xml").sendFile(path.join(publicDir, "logo.svg"));
});

app.get("/site.webmanifest", (_req, res) => {
  res.type("application/manifest+json").sendFile(path.join(publicDir, "site.webmanifest"));
});

app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").sendFile(path.join(publicDir, "robots.txt"));
});

app.get("/sitemap.xml", (_req, res) => {
  res.type("application/xml").sendFile(path.join(publicDir, "sitemap.xml"));
});

// Forward subpath icon requests
app.get("/:config/favicon.ico", (_req, res) => res.redirect("/favicon.ico"));
app.get("/:config/favicon.svg", (_req, res) => res.redirect("/favicon.svg"));
app.get("/:config/logo.svg", (_req, res) => res.redirect("/logo.svg"));

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

app.get("/", (_req, res) => res.redirect(307, "/configure"));

app.get("/configure", (_req, res) => {
  const defaultCfg = getDefaultConfig();
  res.type("html").send(configurePage(defaultCfg));
});

// Endpoint to live-test API keys (TorBox, MDBList, TVDB) using encrypted token or raw key
app.post("/api/test-key", async (req, res) => {
  const { apiKey, token, service = "torbox" } = req.body || {};
  let targetKey = "";

  if (typeof token === "string" && token.trim()) {
    const decoded = decodeConfig(token.trim());
    if (decoded) {
      if (service === "torbox") targetKey = decoded.torboxApiKey;
      else if (service === "mdblist") targetKey = decoded.mdblistApiKey || "";
      else if (service === "tvdb") targetKey = decoded.tvdbApiKey || "";
    }
  } else if (typeof apiKey === "string" && apiKey.trim()) {
    targetKey = apiKey.trim();
  }

  if (!targetKey) {
    res.status(400).json({ valid: false, error: "Missing or invalid API key" });
    return;
  }

  const cleanKey = targetKey.trim();

  if (service === "torbox") {
    const result = await testTorboxKey(cleanKey);
    res.json({ valid: result.valid, plan: result.plan, error: result.error });
  } else if (service === "mdblist") {
    const result = await testMDBListKey(cleanKey);
    res.json({ valid: result.valid, error: result.error });
  } else if (service === "tvdb") {
    const result = await testTVDBKey(cleanKey);
    res.json({ valid: result.valid, error: result.error });
  } else {
    res.status(400).json({ valid: false, error: "Unknown service provider" });
  }
});

// Endpoint to dynamically encrypt user configuration into an opaque AES-256-GCM token
app.post("/api/encrypt-config", (req, res) => {
  const { torboxApiKey, mdblistApiKey, tvdbApiKey } = req.body || {};
  if (!torboxApiKey || typeof torboxApiKey !== "string" || !torboxApiKey.trim()) {
    res.status(400).json({ error: "Missing TorBox API key" });
    return;
  }
  const token = encryptConfig({
    torboxApiKey: torboxApiKey.trim(),
    mdblistApiKey: typeof mdblistApiKey === "string" ? mdblistApiKey.trim() || undefined : undefined,
    tvdbApiKey: typeof tvdbApiKey === "string" ? tvdbApiKey.trim() || undefined : undefined,
  });
  res.json({ token });
});

// Root manifest endpoint
app.get("/manifest.json", (_req, res) => {
  const defaultCfg = getDefaultConfig();
  res.json(buildManifest(!!defaultCfg));
});

// Root stream endpoint for self-hosted instances using .env
app.get("/stream/:type/:id.json", async (req, res) => {
  const defaultCfg = getDefaultConfig();
  if (!defaultCfg) {
    res.json({ streams: [] });
    return;
  }
  try {
    const result = await handleStream(defaultCfg, req.params.type, req.params.id);
    res.json(result);
  } catch (err) {
    console.error("Default stream handler error:", err);
    res.json({ streams: [] });
  }
});

// Config-scoped middleware for multi-tenant deployments
function withConfig(req: Request, res: Response, next: NextFunction): void {
  const config = decodeConfig(req.params.config);
  if (!config) {
    const isJson =
      req.xhr ||
      req.path.endsWith(".json") ||
      (req.headers.accept && req.headers.accept.includes("application/json"));
    if (isJson) {
      res.status(400).json({ error: "Invalid or missing addon configuration." });
      return;
    }
    res.status(400).type("html").send(
      renderErrorPage({
        statusCode: 400,
        title: "Invalid Configuration",
        message: "The addon configuration token in your URL is invalid or malformed. Return to the configuration page to generate a fresh link.",
        path: req.originalUrl || req.path,
      })
    );
    return;
  }
  res.locals.config = config as AddonConfig;
  next();
}

app.get("/:config/configure", (req, res) => {
  res.type("html").send(configurePage(decodeConfig(req.params.config)));
});

app.get("/:config/manifest.json", withConfig, (_req, res) => {
  res.json(buildManifest(true));
});

app.get("/:config/stream/:type/:id.json", withConfig, async (req, res) => {
  const config = res.locals.config as AddonConfig;
  try {
    const result = await handleStream(config, req.params.type, req.params.id);
    res.json(result);
  } catch (err) {
    console.error("Stream handler error:", err);
    res.json({ streams: [] });
  }
});

// 404 Handler for all unknown routes
app.use((req: Request, res: Response) => {
  const isJson =
    req.xhr ||
    req.path.endsWith(".json") ||
    req.path.startsWith("/api/") ||
    (req.headers.accept && req.headers.accept.includes("application/json"));

  if (isJson) {
    res.status(404).json({ error: "Not Found", path: req.path });
    return;
  }

  res.status(404).type("html").send(
    renderErrorPage({
      statusCode: 404,
      title: "Page Not Found",
      message: "The requested route does not exist on this server. Check your link or return to the configuration page below.",
      path: req.originalUrl || req.path,
    })
  );
});

// Global 500 error handler
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled server error:", err);
  const isJson =
    req.xhr ||
    req.path.endsWith(".json") ||
    req.path.startsWith("/api/") ||
    (req.headers.accept && req.headers.accept.includes("application/json"));

  if (isJson) {
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }

  res.status(500).type("html").send(
    renderErrorPage({
      statusCode: 500,
      title: "Internal Server Error",
      message: "An unexpected error occurred while processing your request. Please try again or return to the configuration page.",
      path: req.originalUrl || req.path,
    })
  );
});

export default app;
