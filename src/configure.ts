import { AddonConfig, ADDON_NAME } from "./config";

function esc(v: string | undefined): string {
  return (v ?? "").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function configurePage(config: AddonConfig | null): string {
  const cfg = config ?? { torboxApiKey: "" };
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${ADDON_NAME} — Stream TorBox in Stremio &amp; Nuvio</title>
<meta name="description" content="Sync your TorBox cloud library to Stremio and Nuvio. Instantly stream cached movies and TV series with accurate metadata matching and zero AI latency." />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<link rel="canonical" href="https://torbox-library-sync-addon.vercel.app/configure" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://torbox-library-sync-addon.vercel.app/configure" />
<meta property="og:title" content="${ADDON_NAME} — Stream TorBox in Stremio &amp; Nuvio" />
<meta property="og:description" content="Instant personal TorBox cloud streamer for Stremio and Nuvio. Plays your cached movies and TV series with accurate metadata matching." />
<meta property="og:image" content="https://torbox-library-sync-addon.vercel.app/logo.svg" />

<!-- Twitter -->
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="${ADDON_NAME} — Stream TorBox in Stremio &amp; Nuvio" />
<meta name="twitter:description" content="Instant personal TorBox cloud streamer for Stremio and Nuvio. Plays your cached movies and TV series with accurate metadata matching." />
<meta name="twitter:image" content="https://torbox-library-sync-addon.vercel.app/logo.svg" />

<!-- Favicon & Manifest -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/logo.svg" />
<link rel="manifest" href="/site.webmanifest" />

<!-- JSON-LD Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "${ADDON_NAME}",
  "url": "https://torbox-library-sync-addon.vercel.app",
  "description": "Instant personal TorBox cloud streamer for Stremio and Nuvio. Plays your cached movies and TV series with accurate metadata matching.",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
</script>

<style>
  :root {
    --bg-base: #0a0c10;
    --bg-surface: #12151c;
    --bg-elevated: #181d26;
    --bg-input: #0e1117;
    --border-subtle: #202634;
    --border-focus: #3b82f6;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --success: #10b981;
    --danger: #ef4444;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    background: var(--bg-base);
    color: var(--text-primary);
    padding: 32px 16px;
  }
  .container {
    width: 100%;
    max-width: 540px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }
  .header {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border-subtle);
  }
  .title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
  }
  .logo-img {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: block;
  }
  h1 {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.01em;
    flex: 1;
  }
  .badge {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 4px;
    background: rgba(59, 130, 246, 0.12);
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.25);
  }
  .subtitle {
    color: var(--text-secondary);
    font-size: 13px;
    margin-top: 4px;
  }
  .privacy-banner {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 24px;
    font-size: 12px;
    color: var(--text-secondary);
  }
  .privacy-banner strong {
    color: var(--text-primary);
    display: block;
    margin-bottom: 2px;
  }
  .field-group {
    margin-bottom: 20px;
  }
  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;
  }
  label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
  }
  .label-desc {
    font-size: 12px;
    color: var(--text-muted);
  }
  .input-wrapper {
    position: relative;
    display: flex;
    gap: 8px;
  }
  input[type="text"], input[type="password"] {
    flex: 1;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    padding: 10px 12px;
    color: var(--text-primary);
    font-size: 13px;
    font-family: inherit;
    transition: border-color 0.15s ease;
  }
  input:focus {
    outline: none;
    border-color: var(--border-focus);
  }
  .btn-test {
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    padding: 0 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;
  }
  .btn-test:hover:not(:disabled) {
    background: #202734;
    color: var(--text-primary);
  }
  .btn-test:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .test-status {
    font-size: 12px;
    margin-top: 5px;
    min-height: 18px;
  }
  .test-status.success { color: var(--success); }
  .test-status.error { color: var(--danger); }
  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 24px;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 11px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    border: 1px solid transparent;
    transition: all 0.15s ease;
  }
  .btn-primary {
    background: var(--accent);
    color: #fff;
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--accent-hover);
  }
  .btn-secondary {
    background: var(--bg-elevated);
    border-color: var(--border-subtle);
    color: var(--text-primary);
  }
  .btn-secondary:hover:not(:disabled) {
    background: #202734;
  }
  .btn-full {
    grid-column: 1 / -1;
  }
  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .url-box {
    margin-top: 18px;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    padding: 10px 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 12px;
    color: var(--text-muted);
    word-break: break-all;
    user-select: all;
  }
  .url-box.active {
    color: #38bdf8;
    border-color: rgba(56, 189, 248, 0.3);
  }
  .instructions {
    margin-top: 24px;
    border-top: 1px solid var(--border-subtle);
    padding-top: 18px;
  }
  .instructions-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 12px;
  }
  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .tab-btn {
    background: transparent;
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
  }
  .tab-btn.active {
    background: var(--bg-elevated);
    color: var(--text-primary);
    border-color: #3b82f6;
  }
  .tab-content {
    display: none;
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.6;
    background: var(--bg-input);
    padding: 12px 14px;
    border-radius: 6px;
    border: 1px solid var(--border-subtle);
  }
  .tab-content.active { display: block; }
  .tab-content ol {
    padding-left: 18px;
  }
  .tab-content li {
    margin-bottom: 4px;
  }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div class="title-row">
      <img src="/logo.svg" alt="Torbox Logo" class="logo-img" />
      <h1>${ADDON_NAME}</h1>
      <span class="badge">v2.0 Stateless</span>
    </div>
    <p class="subtitle">Stream movies &amp; TV series directly from your personal TorBox cloud in Stremio and Nuvio.</p>
  </div>

  <div class="privacy-banner">
    <div>
      <strong>Privacy &amp; Key Isolation</strong>
      All keys are encoded directly into your personal manifest URL. Nothing is stored on the server or in database storage. Reloading this page resets all entered inputs.
    </div>
  </div>

  <form id="configForm" autocomplete="off" onsubmit="return false;">
    <div class="field-group">
      <div class="label-row">
        <label for="torbox">TorBox API Key <span style="color:var(--danger)">*</span></label>
        <span class="label-desc">Required</span>
      </div>
      <div class="input-wrapper">
        <input id="torbox" type="password" spellcheck="false" placeholder="Paste your TorBox API token" value="${esc(cfg.torboxApiKey)}" autocomplete="new-password" />
        <button type="button" class="btn-test" id="testTorboxBtn">Test Key</button>
      </div>
      <div class="test-status" id="torboxStatus"></div>
    </div>

    <div class="field-group">
      <div class="label-row">
        <label for="mdblist">MDBList API Key</label>
        <span class="label-desc">Optional (advanced title matching)</span>
      </div>
      <input id="mdblist" type="password" spellcheck="false" placeholder="Optional MDBList API key" value="${esc(cfg.mdblistApiKey)}" autocomplete="new-password" />
    </div>

    <div class="field-group">
      <div class="label-row">
        <label for="tvdb">TVDB API Key</label>
        <span class="label-desc">Optional (TV series metadata)</span>
      </div>
      <input id="tvdb" type="password" spellcheck="false" placeholder="Optional TVDB API key" value="${esc(cfg.tvdbApiKey)}" autocomplete="new-password" />
    </div>

    <div class="actions">
      <button type="button" class="btn btn-primary" id="installStremioBtn" disabled>Install in Stremio</button>
      <button type="button" class="btn btn-secondary" id="installNuvioBtn" disabled>Open in Nuvio</button>
      <button type="button" class="btn btn-secondary btn-full" id="copyUrlBtn" disabled>Copy Addon Manifest URL</button>
    </div>

    <div class="url-box" id="urlBox">Enter your TorBox API key to generate an installable link...</div>
  </form>

  <div class="instructions">
    <div class="instructions-title">Installation Guides</div>
    <div class="tabs">
      <button type="button" class="tab-btn active" data-tab="stremio-guide">Stremio</button>
      <button type="button" class="tab-btn" data-tab="nuvio-guide">Nuvio</button>
    </div>
    <div class="tab-content active" id="stremio-guide">
      <ol>
        <li>Enter your TorBox API key above.</li>
        <li>Click <strong>Install in Stremio</strong> to trigger the application directly.</li>
        <li>Alternatively, click <strong>Copy Addon Manifest URL</strong> and paste it into the search bar in Stremio's Addons section.</li>
      </ol>
    </div>
    <div class="tab-content" id="nuvio-guide">
      <ol>
        <li>Click <strong>Copy Addon Manifest URL</strong> above.</li>
        <li>Open <strong>Nuvio</strong> (Web, Desktop, or Mobile).</li>
        <li>Navigate to <strong>Settings</strong> &rarr; <strong>Plugins / Addons</strong> &rarr; <strong>Add Custom Addon</strong>.</li>
        <li>Paste your generated manifest link and confirm installation.</li>
      </ol>
    </div>
  </div>
</div>

<script>
  function toB64Url(str) {
    var b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
  }

  function getCleanConfig() {
    var torbox = document.getElementById('torbox').value.trim();
    if (!torbox) return null;

    var mdblist = document.getElementById('mdblist').value.trim();
    var tvdb = document.getElementById('tvdb').value.trim();

    var obj = { torboxApiKey: torbox };
    if (mdblist) obj.mdblistApiKey = mdblist;
    if (tvdb) obj.tvdbApiKey = tvdb;

    return toB64Url(JSON.stringify(obj));
  }

  function manifestUrl(enc) {
    return window.location.origin + '/' + enc + '/manifest.json';
  }

  function refresh() {
    var enc = getCleanConfig();
    var urlBox = document.getElementById('urlBox');
    var installStremio = document.getElementById('installStremioBtn');
    var installNuvio = document.getElementById('installNuvioBtn');
    var copyBtn = document.getElementById('copyUrlBtn');

    if (!enc) {
      urlBox.textContent = 'Enter your TorBox API key to generate an installable link...';
      urlBox.className = 'url-box';
      installStremio.disabled = true;
      installNuvio.disabled = true;
      copyBtn.disabled = true;
      return;
    }

    var fullUrl = manifestUrl(enc);
    urlBox.textContent = fullUrl;
    urlBox.className = 'url-box active';
    installStremio.disabled = false;
    installNuvio.disabled = false;
    copyBtn.disabled = false;
  }

  ['torbox', 'mdblist', 'tvdb'].forEach(function(id) {
    var el = document.getElementById(id);
    el.addEventListener('input', refresh);
    el.addEventListener('change', refresh);
  });

  // Test TorBox Key Button
  var testBtn = document.getElementById('testTorboxBtn');
  var statusEl = document.getElementById('torboxStatus');

  testBtn.addEventListener('click', async function() {
    var key = document.getElementById('torbox').value.trim();
    if (!key) {
      statusEl.textContent = 'Please enter a TorBox key first.';
      statusEl.className = 'test-status error';
      return;
    }

    testBtn.disabled = true;
    statusEl.textContent = 'Verifying key with TorBox...';
    statusEl.className = 'test-status';

    try {
      var res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key })
      });
      var data = await res.json();
      if (data.valid) {
        statusEl.textContent = '✓ Verified: ' + (data.email ? data.email + ' (' + data.plan + ')' : data.plan);
        statusEl.className = 'test-status success';
      } else {
        statusEl.textContent = '✗ ' + (data.error || 'Invalid API key');
        statusEl.className = 'test-status error';
      }
    } catch (e) {
      statusEl.textContent = '✗ Connection error: ' + e.message;
      statusEl.className = 'test-status error';
    } finally {
      testBtn.disabled = false;
    }
  });

  // Stremio Install
  document.getElementById('installStremioBtn').addEventListener('click', function() {
    var enc = getCleanConfig();
    if (!enc) return;
    window.location.href = manifestUrl(enc).replace(/^https?:/, 'stremio:');
  });

  // Nuvio Open
  document.getElementById('installNuvioBtn').addEventListener('click', function() {
    var enc = getCleanConfig();
    if (!enc) return;
    var target = 'https://app.nuvio.stream/?addon=' + encodeURIComponent(manifestUrl(enc));
    window.open(target, '_blank');
  });

  // Copy Addon Link
  document.getElementById('copyUrlBtn').addEventListener('click', function() {
    var enc = getCleanConfig();
    if (!enc) return;
    var url = manifestUrl(enc);
    navigator.clipboard.writeText(url);
    var btn = document.getElementById('copyUrlBtn');
    var orig = btn.textContent;
    btn.textContent = 'Copied to clipboard ✔';
    setTimeout(function() { btn.textContent = orig; }, 1800);
  });

  // Tab switcher
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
      btn.classList.add('active');
      var targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Zero-persistence on reload
  window.addEventListener('pageshow', function() {
    refresh();
  });
</script>
</body>
</html>`;
}
