import { ADDON_NAME } from "./config";

export interface ErrorPageOptions {
  statusCode: number;
  title: string;
  message: string;
  path?: string;
  details?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderErrorPage(options: ErrorPageOptions): string {
  const { statusCode, title, message, path: reqPath } = options;
  const is404 = statusCode === 404;
  const is500 = statusCode >= 500;
  const badgeColor = is500 ? "var(--danger)" : is404 ? "var(--accent)" : "var(--warning)";
  const badgeBg = is500
    ? "rgba(239, 68, 68, 0.12)"
    : is404
    ? "rgba(37, 99, 235, 0.12)"
    : "rgba(245, 158, 11, 0.12)";
  const badgeBorder = is500
    ? "rgba(239, 68, 68, 0.3)"
    : is404
    ? "rgba(37, 99, 235, 0.3)"
    : "rgba(245, 158, 11, 0.3)";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${statusCode} - ${escapeHtml(title)} | ${ADDON_NAME}</title>
<meta name="robots" content="noindex, nofollow" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<style>
  :root {
    --bg-base: #090b0e;
    --bg-surface: #11141b;
    --bg-elevated: #171b24;
    --bg-input: #0b0e14;
    --border-subtle: #1e2430;
    --border-hover: #2b3344;
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --danger: #ef4444;
    --warning: #f59e0b;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    width: 100%;
    height: 100%;
    height: 100dvh;
    max-height: 100dvh;
    overflow: hidden;
    background: var(--bg-base);
    color: var(--text-primary);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    -webkit-text-size-adjust: 100%;
  }

  body {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .error-card {
    width: 100%;
    max-width: 480px;
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: 14px;
    padding: 28px 24px;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-subtle);
    margin-bottom: 20px;
  }

  .header-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .logo-img {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    display: block;
    flex-shrink: 0;
  }

  .addon-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .github-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 7px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    transition: all 0.15s ease;
    text-decoration: none;
    flex-shrink: 0;
  }

  .github-link:hover {
    color: var(--text-primary);
    background: #1c222e;
    border-color: var(--border-hover);
  }

  .github-link svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    align-self: flex-start;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${badgeColor};
    background: ${badgeBg};
    border: 1px solid ${badgeBorder};
    margin-bottom: 14px;
  }

  .error-heading {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--text-primary);
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .error-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .path-box {
    background: var(--bg-input);
    border: 1px solid var(--border-subtle);
    border-radius: 6px;
    padding: 8px 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    color: var(--text-muted);
    word-break: break-all;
    overflow-wrap: anywhere;
    margin-bottom: 22px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .path-box code {
    color: #e2e8f0;
    font-weight: 500;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 14px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 9px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    border: 1px solid transparent;
    transition: all 0.15s ease;
    text-align: center;
    min-height: 38px;
  }

  .btn-primary {
    background: var(--accent);
    color: #ffffff;
    grid-column: 1 / -1;
  }

  .btn-primary:hover {
    background: var(--accent-hover);
  }

  .btn-secondary {
    background: var(--bg-elevated);
    border-color: var(--border-subtle);
    color: var(--text-primary);
  }

  .btn-secondary:hover {
    background: #1c222e;
    border-color: var(--border-hover);
  }

  .btn svg {
    width: 14px;
    height: 14px;
    fill: currentColor;
    flex-shrink: 0;
  }

  .footer-text {
    font-size: 11px;
    color: var(--text-muted);
    text-align: center;
    border-top: 1px solid var(--border-subtle);
    padding-top: 14px;
    margin-top: 6px;
  }

  .footer-text a {
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .footer-text a:hover {
    color: var(--text-primary);
    text-decoration: underline;
  }

  @media (max-width: 440px) {
    body {
      padding: 12px;
    }
    .error-card {
      padding: 20px 16px;
    }
    .error-heading {
      font-size: 18px;
    }
    .actions-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (orientation: landscape) and (max-height: 540px) {
    body {
      padding: 8px;
    }
    .error-card {
      padding: 16px 20px;
    }
    .card-header {
      margin-bottom: 12px;
      padding-bottom: 10px;
    }
    .status-badge {
      margin-bottom: 8px;
    }
    .error-heading {
      font-size: 16px;
      margin-bottom: 4px;
    }
    .error-desc {
      font-size: 12px;
      margin-bottom: 10px;
    }
    .path-box {
      margin-bottom: 12px;
      padding: 6px 10px;
    }
    .actions-grid {
      margin-bottom: 10px;
    }
    .btn {
      min-height: 32px;
      padding: 6px 10px;
      font-size: 12px;
    }
    .footer-text {
      padding-top: 8px;
      margin-top: 4px;
    }
  }
</style>
</head>
<body>
<div class="error-card">
  <div class="card-header">
    <div class="header-brand">
      <img src="/logo.svg" alt="Torbox Logo" class="logo-img" />
      <span class="addon-title">${ADDON_NAME}</span>
    </div>
    <a href="https://github.com/Biraj2004/torbox-library-sync-addon" target="_blank" rel="noopener noreferrer" class="github-link" title="GitHub Repository" aria-label="GitHub Repository">
      <svg viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
    </a>
  </div>

  <div class="status-badge">${statusCode} • ${is404 ? "Not Found" : is500 ? "Server Error" : "Request Error"}</div>

  <h1 class="error-heading">${escapeHtml(title)}</h1>
  <p class="error-desc">${escapeHtml(message)}</p>

  ${reqPath ? `<div class="path-box"><span>Target:</span> <code>${escapeHtml(reqPath)}</code></div>` : ""}

  <div class="actions-grid">
    <a href="/configure" class="btn btn-primary">
      <svg viewBox="0 0 16 16"><path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/><path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319z"/></svg>
      Configure Addon
    </a>
    <a href="/manifest.json" class="btn btn-secondary">
      <svg viewBox="0 0 16 16"><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/></svg>
      Manifest
    </a>
    <button type="button" class="btn btn-secondary" onclick="if (history.length > 1) { history.back(); } else { window.location.href='/configure'; }">
      <svg viewBox="0 0 16 16"><path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>
      Go Back
    </button>
  </div>

  <div class="footer-text">
    <a href="https://github.com/Biraj2004/torbox-library-sync-addon" target="_blank" rel="noopener noreferrer">Torbox Library Sync Addon</a> • Open Source (MIT)
  </div>
</div>
</body>
</html>`;
}
