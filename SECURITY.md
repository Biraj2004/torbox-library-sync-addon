# Security Policy

## Stateless Architecture & Privacy

`Torbox Library Sync Addon` is built with a **stateless, zero-persistence privacy architecture**:

1. **No Database or Persistent Storage:**
   The server has no database, file cache, session store, or cookie mechanism for user credentials.
2. **Client-Side Configuration Encoding:**
   API keys entered on the `/configure` page are encoded directly into the unique manifest URL path (e.g. `/:config/manifest.json`). The server extracts the configuration only in-memory to execute the specific stream request and never saves it.
3. **Multi-Tenant Key Isolation:**
   When hosted publicly on Vercel (`https://torbox-library-sync-addon.vercel.app`), the host does not share or expose any API keys. Each user enters their own TorBox API key. Requests made by user A only ever access user A's TorBox account.
4. **Zero-Storage on Reload:**
   The configuration page explicitly uses `autocomplete="off"` and does not use `localStorage` or `sessionStorage`. Reloading the page in a browser instantly clears all form inputs.
5. **Direct Permalinks:**
   Streaming links are generated as direct 302 HTTP redirects using TorBox's official permalinks, ensuring media traffic flows directly between the user's client and TorBox's high-speed CDN.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0.0 | :x:                |

## Reporting a Vulnerability

If you discover any security issue or vulnerability, please do not open a public issue. Instead, report it privately to:

**Biraj Sarkar**  
Email: [birajsarkar67@gmail.com](mailto:birajsarkar67@gmail.com)

Please include:
- A detailed description of the issue.
- Steps or proof-of-concept to reproduce the problem.
- Any suggested fixes or mitigations.

You will receive an acknowledgment within 48 hours.
