import { AddonConfig, ADDON_NAME } from "./config";

function esc(v: string | undefined): string {
  return (v ?? "").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function configurePage(config: AddonConfig | null): string {
  const cfg = config ?? { torboxApiKey: "" };
  const hasEnvKeys = Boolean(cfg.torboxApiKey);

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

<!-- Favicons & Manifest -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/logo.svg" />
<link rel="manifest" href="/site.webmanifest" />

<style>
  :root {
    --bg-base: #090b0e;
    --bg-surface: #11141b;
    --bg-elevated: #171b24;
    --bg-input: #0b0e14;
    --border-subtle: #1e2430;
    --border-hover: #2b3344;
    --border-focus: #3b82f6;
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --success: #10b981;
    --success-bg: rgba(16, 185, 129, 0.1);
    --danger: #ef4444;
    --warning: #f59e0b;
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
    border-radius: 14px;
    padding: 28px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
    position: relative;
  }
  .header {
    margin-bottom: 22px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--border-subtle);
  }
  .title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .title-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .logo-img {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: block;
  }
  h1 {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--text-primary);
  }
  .github-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    transition: all 0.15s ease;
    text-decoration: none;
  }
  .github-link:hover {
    color: var(--text-primary);
    border-color: var(--border-hover);
    background: #1c222e;
  }
  .github-link svg {
    width: 18px;
    height: 18px;
    fill: currentColor;
  }
  .subtitle {
    color: var(--text-secondary);
    font-size: 13px;
    margin-top: 6px;
  }
  .env-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--success-bg);
    border: 1px solid rgba(16, 185, 129, 0.25);
    color: #34d399;
    padding: 10px 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 12px;
  }
  .env-banner strong {
    font-weight: 600;
  }
  .privacy-banner {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    padding: 10px 12px;
    margin-bottom: 20px;
    font-size: 12px;
    color: var(--text-secondary);
  }
  .privacy-banner strong {
    color: var(--text-primary);
    display: block;
    margin-bottom: 2px;
  }
  .field-group {
    margin-bottom: 18px;
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
  .tag-required {
    font-size: 11px;
    font-weight: 600;
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.1);
    padding: 1px 6px;
    border-radius: 4px;
    border: 1px solid rgba(56, 189, 248, 0.2);
  }
  .tag-optional {
    font-size: 11px;
    color: var(--text-muted);
  }
  .field-desc {
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 6px;
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
    padding: 9px 12px;
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
    padding: 0 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;
  }
  .btn-test:hover:not(:disabled) {
    background: #1c222e;
    color: var(--text-primary);
  }
  .btn-test:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .test-status {
    font-size: 11px;
    margin-top: 4px;
    min-height: 16px;
  }
  .test-status.success { color: var(--success); }
  .test-status.error { color: var(--danger); }
  .actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 22px;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 14px;
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
    background: #1c222e;
  }
  .btn-full {
    grid-column: 1 / -1;
  }
  .btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .url-box {
    margin-top: 16px;
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
    margin-top: 22px;
    border-top: 1px solid var(--border-subtle);
    padding-top: 16px;
  }
  .instructions-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 10px;
  }
  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
  }
  .tab-btn {
    background: transparent;
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    padding: 5px 11px;
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
      <div class="title-left">
        <img src="/logo.svg" alt="Torbox Logo" class="logo-img" />
        <h1>${ADDON_NAME}</h1>
      </div>
      <a href="https://github.com/Biraj2004/torbox-library-sync-addon" target="_blank" rel="noopener noreferrer" class="github-link" title="GitHub Repository" aria-label="GitHub Repository">
        <svg viewBox="0 0 16 16">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
      </a>
    </div>
    <p class="subtitle">Stream cached movies &amp; TV series directly from your personal TorBox cloud in Stremio and Nuvio.</p>
  </div>

  ${
    hasEnvKeys
      ? `<div class="env-banner">
          <span>●</span>
          <div><strong>Environment Configuration Loaded:</strong> Keys detected from your server. Install directly or generate portable links below.</div>
        </div>`
      : `<div class="privacy-banner">
          <div>
            <strong>Stateless &amp; Private:</strong> All keys are encoded into your personal manifest URL. Nothing is saved on the server or in database storage.
          </div>
        </div>`
  }

  <form id="configForm" autocomplete="off" onsubmit="return false;">
    <!-- TorBox API Key (Required) -->
    <div class="field-group">
      <div class="label-row">
        <label for="torbox">TorBox API Key</label>
        <span class="tag-required">Required</span>
      </div>
      <div class="field-desc">Your personal token from torbox.app/settings</div>
      <div class="input-wrapper">
        <input id="torbox" type="password" spellcheck="false" placeholder="Paste your TorBox API token" value="${esc(cfg.torboxApiKey)}" autocomplete="new-password" />
        <button type="button" class="btn-test" id="testTorboxBtn">Test Key</button>
      </div>
      <div class="test-status" id="torboxStatus"></div>
    </div>

    <!-- MDBList API Key (Optional) -->
    <div class="field-group">
      <div class="label-row">
        <label for="mdblist">MDBList API Key</label>
        <span class="tag-optional">Optional</span>
      </div>
      <div class="field-desc">Used for alternative titles, international releases, and fuzzy searches</div>
      <div class="input-wrapper">
        <input id="mdblist" type="password" spellcheck="false" placeholder="Optional MDBList API key" value="${esc(cfg.mdblistApiKey)}" autocomplete="new-password" />
        <button type="button" class="btn-test" id="testMdblistBtn">Test Key</button>
      </div>
      <div class="test-status" id="mdblistStatus"></div>
    </div>

    <!-- TVDB API Key (Optional) -->
    <div class="field-group">
      <div class="label-row">
        <label for="tvdb">TVDB API Key</label>
        <span class="tag-optional">Optional</span>
      </div>
      <div class="field-desc">Used for TV series season packs &amp; complex episode mapping</div>
      <div class="input-wrapper">
        <input id="tvdb" type="password" spellcheck="false" placeholder="Optional TVDB API key" value="${esc(cfg.tvdbApiKey)}" autocomplete="new-password" />
        <button type="button" class="btn-test" id="testTvdbBtn">Test Key</button>
      </div>
      <div class="test-status" id="tvdbStatus"></div>
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
        <li>Ensure your TorBox API key is entered and verified above.</li>
        <li>Click <strong>Install in Stremio</strong> to launch the app directly.</li>
        <li>Or click <strong>Copy Addon Manifest URL</strong> and paste it into the search bar in Stremio's Community Addons page.</li>
      </ol>
    </div>
    <div class="tab-content" id="nuvio-guide">
      <ol>
        <li>Click <strong>Copy Addon Manifest URL</strong> above.</li>
        <li>Open <strong>Nuvio</strong> (Web, Desktop, or Mobile).</li>
        <li>Navigate to <strong>Settings</strong> &rarr; <strong>Plugins / Addons</strong> &rarr; <strong>Add Custom Addon</strong>.</li>
        <li>Paste your generated manifest URL and confirm.</li>
      </ol>
    </div>
  </div>
</div>

<script>
  function cleanInput(val) {
    if (!val) return "";
    return val.trim().replace(/^["']|["']$/g, "").trim();
  }

  function toB64Url(str) {
    var b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
  }

  function getCleanConfig() {
    var torbox = cleanInput(document.getElementById('torbox').value);
    if (!torbox) return null;

    var mdblist = cleanInput(document.getElementById('mdblist').value);
    var tvdb = cleanInput(document.getElementById('tvdb').value);

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

  // Generic Key Tester Helper
  async function testServiceKey(serviceName, inputId, statusId, btnId) {
    var key = cleanInput(document.getElementById(inputId).value);
    var statusEl = document.getElementById(statusId);
    var btn = document.getElementById(btnId);

    if (!key) {
      statusEl.textContent = 'Please enter an API key first.';
      statusEl.className = 'test-status error';
      return;
    }

    btn.disabled = true;
    statusEl.textContent = 'Verifying key...';
    statusEl.className = 'test-status';

    try {
      var res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key, service: serviceName })
      });
      var data = await res.json();
      if (data.valid) {
        var msg = '✓ Verified';
        if (data.email) msg += ': ' + data.email + ' (' + data.plan + ')';
        else if (data.plan) msg += ': ' + data.plan;
        statusEl.textContent = msg;
        statusEl.className = 'test-status success';
      } else {
        statusEl.textContent = '✗ ' + (data.error || 'Invalid API key');
        statusEl.className = 'test-status error';
      }
    } catch (e) {
      statusEl.textContent = '✗ Network error: ' + e.message;
      statusEl.className = 'test-status error';
    } finally {
      btn.disabled = false;
    }
  }

  // Bind Tester Buttons
  document.getElementById('testTorboxBtn').addEventListener('click', function() {
    testServiceKey('torbox', 'torbox', 'torboxStatus', 'testTorboxBtn');
  });
  document.getElementById('testMdblistBtn').addEventListener('click', function() {
    testServiceKey('mdblist', 'mdblist', 'mdblistStatus', 'testMdblistBtn');
  });
  document.getElementById('testTvdbBtn').addEventListener('click', function() {
    testServiceKey('tvdb', 'tvdb', 'tvdbStatus', 'testTvdbBtn');
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

  // Initial check on page load
  refresh();
</script>
</body>
</html>`;
}
