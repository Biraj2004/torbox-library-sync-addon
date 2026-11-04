# Security & Compliance Policy

## 1. Stateless Architecture & Privacy

`Torbox Library Sync Addon` is built with a **stateless, zero-persistence privacy architecture**:

1. **No Database or Persistent Storage:**
   The server has no database, file cache, session store, or cookie mechanism for user credentials.
2. **Client-Side Configuration Encoding:**
   API keys entered on the `/configure` page are encrypted or encoded directly into the unique manifest URL path (e.g. `/:config/manifest.json`). The server extracts the configuration only in-memory to execute the specific stream request and never saves it to persistent storage.
3. **Multi-Tenant Key Isolation:**
   When hosted publicly on Vercel (`https://torbox-library-sync-addon.vercel.app`), the host does not share or expose any API keys. Each user enters their own TorBox API key. Requests made by user A only ever access user A's TorBox account.
4. **Zero-Storage on Reload:**
   The configuration page explicitly uses `autocomplete="off"` and does not use `localStorage` or `sessionStorage`. Reloading the page in a browser instantly clears all form inputs.
5. **Direct Permalinks:**
   Streaming links are generated as direct 302 HTTP redirects using TorBox's official permalinks, ensuring media traffic flows directly between the user's client and TorBox's high-speed CDN.

---

## 2. License Enforcement, Mandatory Attribution & Copyleft Terms

This project is licensed under the **GNU Affero General Public License v3.0 (GNU AGPLv3)**.

### Strict Conditions for Use, Modification, and Distribution:

1. **Mandatory Author Attribution:**
   Any deployment, fork, redistribution, or derivative work based on or incorporating code from this project **MUST** conspicuously retain all copyright notices and credit the original author:
   - **Original Author:** **Biraj Sarkar** ([https://iambiraj.vercel.app](https://iambiraj.vercel.app))
   - **Repository:** [`https://github.com/Biraj2004/torbox-library-sync-addon`](https://github.com/Biraj2004/torbox-library-sync-addon)
   - Removing, obscuring, or replacing author attributions is a direct violation of Section 5 and Section 7 of the GNU AGPLv3.

2. **Strict Copyleft (No Closed Source Allowed):**
   - **Network Service Provision (AGPLv3 Section 13):** If you run a modified or unmodified version of this addon on a server (e.g., Vercel, Docker, Render, self-hosted VPS) accessible over a computer network, you **MUST** make the complete Corresponding Source Code publicly available to all users interacting with the service at no charge under the terms of the GNU AGPLv3.
   - **Prohibition of Proprietary Derivatives:** You **CANNOT** incorporate this code into proprietary, closed-source software, commercial closed addons, or paid closed services.
   - **Inherited Copyleft:** Any software that links, combines, or derives from this repository must itself be licensed entirely under the GNU AGPLv3 or compatible copyleft licenses.

3. **Reporting License Violations:**
   If you discover any closed-source forks, instances hosted without disclosing corresponding source code, or unauthorized removal of author credits, report them immediately to the author.

---

## 3. Supported Versions

| Version | Supported          | License      |
| ------- | ------------------ | ------------ |
| 2.0.x   | :white_check_mark: | GNU AGPLv3   |
| < 2.0.0 | :x:                | Deprecated   |

---

## 4. Reporting a Security Vulnerability

If you discover a security issue or vulnerability, please do not open a public issue. Instead, report it privately to:

**Biraj Sarkar**  
Website: [https://iambiraj.vercel.app](https://iambiraj.vercel.app)  
GitHub: [@Biraj2004](https://github.com/Biraj2004)  
Email: [birajsarkar67@gmail.com](mailto:birajsarkar67@gmail.com)

Please include:
- A detailed description of the vulnerability.
- Steps or proof-of-concept to reproduce the problem.
- Any suggested fixes or mitigations.

You will receive an acknowledgment within 48 hours.
