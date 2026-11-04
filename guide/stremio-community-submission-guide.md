# Stremio Community Catalog Addon Submission Guide

This document outlines the step-by-step procedure for deploying Torbox Library Sync Addon on Vercel, validating the public manifest, and submitting it to the official Stremio Community Addons Catalog.

---

## 1. Vercel Deployment Troubleshooting & Status

### Why Vercel Showed "No Live Deployments"
When importing a Node.js/Express serverless application into Vercel:
- If `vercel.json` defines an `outputDirectory` (such as `public`), Vercel treats the project as a static website and disables Serverless Functions.
- This prevents `api/index.ts` from being compiled as a serverless endpoint.

### Solution Applied
The `vercel.json` configuration was updated to remove `outputDirectory` and `buildCommand` overrides:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "redirects": [
    {
      "source": "/",
      "destination": "/configure",
      "permanent": false
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ],
  "functions": {
    "api/index.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

### Steps to Trigger / Confirm Live Deployment:
1. Go to your [Vercel Dashboard](https://vercel.com/biraj2004-projects/torbox-library-sync-addon).
2. Click **Deployments** in the left sidebar.
3. The latest commit on branch `main` automatically triggers a build.
4. If a build is not active, click **Create Deployment**, select branch `main`, and click **Deploy**.
5. Once complete (~20-30 seconds), your deployment status will change to **Ready**.
6. Verify live availability by opening:
   ```text
   https://torbox-library-sync-addon.vercel.app/configure
   ```

---

## 2. Stremio Addon Manifest Validation

Before submitting your addon to the community catalog, validate the live manifest using the community tool:

- **Validator Tool URL:**  
  `https://stremio-community.github.io/stremio-addon-manifest-validator/?url=https://torbox-library-sync-addon.vercel.app/manifest.json`

### What the Validator Confirms:
- **`id`:** `org.torbox.librarysync` (reverse-domain identifier)
- **`version`:** `2.0.0` (valid semantic version)
- **`name`:** `Torbox Library Sync`
- **`description`:** Summary text explaining functionality
- **`resources`:** `["stream"]`
- **`types`:** `["movie", "series"]`
- **`idPrefixes`:** `["tt"]` (IMDb title identifier prefix)
- **`behaviorHints`:**
  - `configurable`: `true`
  - `configurationRequired`: `true`

---

## 3. Stremio Addons Catalog Form Fields

Navigate to the Stremio Community Addon submission form:
`https://stremio-addons.netlify.app/submit` (or via Stremio Addons portal).

Fill out the fields as specified below:

### Field 1: Addon Type Toggles
- **I'm submitting an instance of an existing addon:** `OFF` (Grey / Disabled)
- **I'm submitting a fork of an existing addon:** `OFF` (Grey / Disabled)

### Field 2: Manifest URL
```text
https://torbox-library-sync-addon.vercel.app/manifest.json
```

### Field 3: Repository URL (Optional)
```text
https://github.com/Biraj2004/torbox-library-sync-addon
```

### Field 4: Slug
```text
torbox-library-sync
```

### Field 5: Content Type Tags
Select the tags below:
- **Content:**
  - [x] `movies`
  - [x] `tv shows`
- **Source:**
  - [x] `debrid support`
  - [x] `http streams`
- **Other:**
  - [x] `metadata`

### Field 6: Language (Optional)
- Select: `Multilingual (default)` (or `English`)

### Field 7: Documentation (Optional)
Copy and paste the exact markdown text below into the documentation box:

```markdown
### Torbox Library Sync Addon

High-performance, privacy-first Stremio and Nuvio addon that synchronizes your personal TorBox cloud storage to stream cached movies and TV series with sub-millisecond metadata matching.

#### Features
- **Deterministic Scene Parser:** Cleans release titles, audio codecs, and episode tags in under 1ms with zero external AI latency.
- **Movies & Season Packs:** Full support for single movies, individual episodes, and complete TV season packs.
- **Zero-Storage Privacy:** No user credentials or API tokens are ever stored on the server or in databases.
- **Client-Side AES-256-GCM Encryption:** Keys are masked and encrypted client-side via the browser Web Crypto API before generating installable manifest URLs.
- **Automatic Cloud Tagging:** Asynchronously tags matched torrents with IMDb IDs for instant subsequent lookups across all your devices.

#### How to Configure
1. Click **Configure** on the addon card or visit `https://torbox-library-sync-addon.vercel.app/configure`.
2. Paste your personal TorBox API key from `https://torbox.app/settings`.
3. (Optional) Provide MDBList or TVDB keys for alternative foreign titles and complex season matching.
4. Click **Install in Stremio** or copy your encrypted manifest URL.
```

---

## 4. Post-Submission Process

1. Click the **Submit** button at the bottom of the form.
2. The addon submission enters the review queue of the Stremio Community team.
3. Once approved, the addon will appear in the official Stremio Community Addons directory under the **Debrid** and **Stream** categories.
4. Users who discover the addon in Stremio can click **Configure**, which opens the hosted `/configure` page where they enter their personal API credentials.
