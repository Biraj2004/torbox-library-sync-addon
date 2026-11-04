# Universal Logo Design & Asset Engineering Guide

> **Methodology Standard**: [kaankiziltug/logo-design-skill](https://github.com/kaankiziltug/logo-design-skill)  
> **Application Scope**: Universal framework for any web application, SaaS platform, open-source repository, mobile application, or developer tool.  
> **Purpose**: A comprehensive, step-by-step technical standard for discovering project identity, creating mathematically sound SVG marks, validating legibility across sizes, generating production asset suites, and seamlessly integrating logos into codebases.

---

## 1. The Core Philosophy of an Identifier

A logo is an **identifier, not an explanation**. It is not an illustration, an infographic, a narrative poster, or a catalog of product features. Its primary function is to deliver an instant, distinctive, and unshakeable visual signpost that operates reliably at extreme scales: from a $16\times 16\text{ px}$ browser favicon tab to a multi-meter billboard, and across all mediums from high-density Retina displays to single-color laser engraving.

### 1.1 The Twelve Cardinal Tenets of Logo Design

1. **Who, What, Why First**: Let the specific problem domain, user psychology, and market positioning dictate the visual form. Never begin with abstract aesthetic whims or current design fads.
2. **Identify, Don't Explain**: A logo is a flag, not a blueprint. A restaurant logo does not need a fork; a car brand does not draw a wheel; a database tool does not need a cylinder.
3. **Simple, but Never Plain**: Eliminate decorative clutter until only the indispensable idea remains, then infuse one ownable, memorable geometric or conceptual nuance.
4. **Relevant Without Literalism**: Evoke the attitude, rigor, and ethos of the project. Do not depict the physical output or literal mechanisms of the software.
5. **Distinct**: Thoroughly audit the competitive landscape specifically to depart from the conventions that cause products to blend together.
6. **Memorable**: Silhouette, bold contrast, and pure geometry are the primary memory anchors. If a shape is too complex to register in a fraction of a second, recall fails.
7. **One Clear Idea**: If the visual premise cannot be articulated in a single sentence, it is too complicated to be perceived at a glance. A light puzzle is engaging; a riddle is ignored.
8. **Extreme Scalability ($16\text{ px}$ to $16\text{ m}$)**: If the mark dissolves into an unrecognizable blur at $16\times 16\text{ px}$, it is fundamentally flawed. Small-scale endurance is non-negotiable.
9. **One-Colour Purity**: A true logo works in solid flat black on white, and solid flat white on black, before any color palette, tint, or gradient is introduced.
10. **Zero Crutches**: Never rely on drop shadows, inner glows, 3D skeuomorphism, or chromatic gradients to rescue weak underlying geometry.
11. **Obsessive Geometric Craft**: Every coordinate must sit on an exact integer grid. Curves must have minimal anchor points. Angles must be intentional ($0^\circ, 45^\circ, 90^\circ$). Lines must meet with clean junctions.
12. **Foundation for an Identity System**: The mark must effortlessly seed the product's favicon, app store icons, social share banners, loading states, UI badges, and brand typography.

---

## 2. Choosing Your Workflow Mode

Before initiating design work, identify which track matches the project's exact state:

| Project Situation | Workflow Mode | Primary Focus |
| :--- | :--- | :--- |
| **New Project / Green-field Repo** | **Design Mode** | Full discovery, category cliché audit, concept generation, and end-to-end asset production. |
| **Existing Repo with Outdated Logo** | **Redesign Mode** | Equity & flaw audit, retaining recognizable heritage while stripping clutter and fixing scalability. |
| **Reviewing an Existing / Proposed Logo** | **Critique Mode** | The 7-gate testing evaluation, technical SVG audit, and actionable geometry scorecards. |
| **Approved Mark Lacks Deployment Files** | **Asset Generation Mode** | Script-driven production of multi-size PNGs, `.ico`, touch icons, Open Graph banners, and webmanifest. |
| **Inconsistent Assets Across Codebase** | **Integration Mode** | Replacing old files in `/public`, updating HTML metadata, refactoring UI container components. |

---

## 3. Phase 1: Deep Project Discovery & Domain Understanding

Never start by sketching or coding SVG. Great identity design is an analytical process of extraction and reduction.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PHASE 1: DISCOVERY FLOW                         │
│                                                                        │
│  [Codebase / Domain Audit] ──> [Brand Adjectives] ──> [Cliché Matrix]  │
│              │                                              │          │
│              ▼                                              ▼          │
│     [Audience & Constraints]                    [Legacy Flaw Audit]    │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 The Five Discovery Pillars

Audit the repository's `README.md`, documentation, and architecture to extract the following:

1. **Exact Brand Nomenclature**:
   - What is the exact brand name, letter casing, spacing, and legal abbreviation? (e.g., `AcmeFlow` vs. `Acme Flow` vs. `AF`).
   - Does it require a standalone symbol, a wordmark, or a lockup combining both?

2. **Core Problem & Value Proposition**:
   - What is the single most valuable outcome this project delivers to its users?
   - What friction, pain point, or inefficiency does it eliminate?

3. **Target Audience Psychology**:
   - Who uses this software? (e.g., enterprise security officers, systems programmers, hobbyist creators, financial analysts).
   - What visual cues communicate trust, speed, precision, and quality to this specific audience?

4. **Brand Adjectives (Visual Directives)**:
   - Select **3 to 5 core adjectives** that define the product's demeanor.
   - *Examples*: Sharp, robust, algorithmic, weightless, crystalline, kinetic, understated, industrial.
   - *Rule*: Every design decision (corner radius, stroke thickness, color choice) must be justified by these adjectives.

5. **Technical Display Constraints**:
   - Where will this mark live?
   - What are the minimum and maximum dimensions? (e.g., $16\text{ px}$ browser favicon, $24\text{ px}$ sticky navigation header, $180\text{ px}$ iOS touch icon, $1200\times 630\text{ px}$ social banner).
   - Does the app have a default dark mode, light mode, or both?

### 3.2 Category Cliché Identification Matrix

Every software vertical has saturated, predictable visual clichés. Identify them explicitly to guarantee your project stands out:

| Software Domain | Predictable Clichés (Must Avoid or Radically Reinvent) | Fresh Conceptual Alternatives |
| :--- | :--- | :--- |
| **Developer Tools & Code** | Literal angle brackets `< >`, curly braces `{ }`, terminal carrots `$_`, binary `0101` streams. | Algorithmic state shifts, precision alignment pins, compiler tokens, execution checkpoints. |
| **Cloud & Infrastructure** | Generic fluffy cumulus clouds, server rack stacks, interconnected globe wireframes. | Gateway conduits, low-latency bridges, distributed coordinate anchors, immutable blocks. |
| **Data & Analytics** | Bar charts with upward arrows, pie wedges, magnifying glasses over spreadsheets. | Metric tension vectors, signal-to-noise filters, dimensional projection facets. |
| **Security & Privacy** | Heavy padlocks, medieval shields, vaults, keys, biohazard hazard polygons. | Cryptographic hashes, boundary envelopes, parity checkpoints, optical prism refraction. |
| **AI & Machine Learning** | Sparkle stars (✨), neural node webs, human silhouette brains, glowing circuitry. | Latent space manifolds, convergence vertices, high-dimensional projections, token ribbons. |
| **Fintech & Commerce** | Flying paper airplanes, upward diagonal arrows, gold coins, generic credit card shapes. | Ledger equilibrium, velocity vectors, split-second reconciliation nodes. |

### 3.3 The Flaw Audit for Existing Logos (Redesign Mode)

If modernizing an existing logo, dissect why it fails before replacing it:

```markdown
- [ ] Color Overload: Does it use > 3 colors or non-functional gradients?
- [ ] Hairline Fragility: Are there thin lines (< 1/32 of canvas width) that disappear when scaled down?
- [ ] Complex Multi-Node Structures: Are there floating dots or intricate network webs that blur into visual noise?
- [ ] Inconsistent Geometry: Are there haphazard angles (e.g. 37.4°, 56.1°, 112°)?
- [ ] Live Font Dependence: Does the logo rely on system fonts instead of outlined vector letterforms?
- [ ] Container Clutter: Is the mark trapped in an unnecessary decorative badge, shield, or double border?
```

---

## 4. Phase 2: Strategic Concept Generation

### 4.1 Word Mapping & Conceptual Cross-Pollination

Brainstorm semantic intersections between the project's primary attributes:

```
[Column A: Core Function]       [Column B: Method / Ethos]       [Column C: Desired Milestone]
• Syntax / Parsing         ×    • Parallel Execution        ×    • Deterministic Output
• Compilation / Build           • Cryptographic Precision        • Verified State
• Data Routing                  • Zero Overhead                  • Seamless Sync
```

Connect terms across columns to form unexpected visual metaphors.

### 4.2 Mark Type Taxonomy

Select candidate mark types to explore (aim for at least 2 distinct types during concepting):

1. **Monoline Ribbon / Path**: An unbroken stroke of uniform weight that flows between two complementary states (e.g., input to output, question to resolution).
2. **Abstract Geometric Symbol**: A self-contained geometric mark that conveys balance, motion, or stability through pure form.
3. **Monogram / Letterform**: A single initial or two-letter monogram drawn with custom geometry that embeds a domain-specific insight.
4. **Negative Space Interaction**: A primary silhouette that carves out a secondary symbol using `fill-rule="evenodd"`.
5. **Integrated Combination Mark**: A standalone geometric symbol paired with a custom-kerning, outlined typographic wordmark.

### 4.3 Formulating One-Sentence Concepts

Draft 8 to 12 one-sentence concepts. Each sentence must express a complete idea:

- *Bad Concept*: "A modern icon for data tracking." (Vague, generic, unownable).
- *Good Concept*: "A continuous 45-degree monoline ribbon that transitions from an input bracket into an ascending verification checkmark." (Specific, geometric, verifiable).

### 4.4 The Concept Checkpoint (Strict Protocol)

**Never build full asset kits, mockups, or PNG renders before user validation.**

1. Select the top 2–3 radically different concepts.
2. Render them in **pure greyscale / monochrome** (black on white). Why? Introducing color early triggers subjective personal taste debates rather than objective evaluation of geometric clarity.
3. Present the concepts with:
   - The one-sentence idea.
   - Why it matches the project's brand adjectives.
   - The 16 px small-scale proof.
4. Gather explicit stakeholder/user steering. Only proceed to asset building once a single direction is approved.

---

## 5. Phase 3: Mathematical & Geometric SVG Construction

All master vector logos must be handcrafted directly in SVG code using clean coordinate geometry.

### 5.1 The Standard Coordinate Canvas

```
        0                        128                       256
      0 ┌─────────────────────────┬─────────────────────────┐
        │                                                   │
        │                                                   │
        │                   CANVAS: 256 x 256               │
        │                                                   │
        │                     Safe Margin                   │
        │             ┌───────────────────────┐             │
        │             │                       │             │
    128 ├─────────────│       (128, 128)      │─────────────┤
        │             │        Center         │             │
        │             │                       │             │
        │             └───────────────────────┘             │
        │                                                   │
        │                                                   │
        │                                                   │
    256 └─────────────────────────┴─────────────────────────┘
```

- **ViewBox**: Always set `viewBox="0 0 256 256"` for square symbols and app icons. For horizontal lockups, standardize on height `256` (e.g., `viewBox="0 0 768 256"`).
- **Coordinate Hygiene**: Every coordinate, stroke width, and corner radius must be an exact integer. Never use arbitrary floating decimals generated by graphics software (e.g., replace `x="42.1974"` with `x="42"`).
- **Angle Constraints**: Restrict all line trajectories to **$0^\circ$, $45^\circ$, and $90^\circ$** (or consistent isometric $30^\circ/60^\circ$). Never allow near-miss angles (such as $43.8^\circ$ or $88.5^\circ$), which cause anti-aliasing fuzziness and visual tension.

### 5.2 Stroke Weight Ratios for Extreme Scalability

To guarantee that an SVG symbol remains legible when shrunk to a $16\times 16\text{ px}$ favicon, use the stroke-to-canvas ratio formula:

$$\text{Stroke Ratio} = \frac{\text{Stroke Width}}{\text{Canvas Width}}$$

- **Optimal Ratio Range**: $10\% \text{ to } 12\%$ of total canvas width.
- On a $256\text{ px}$ canvas:
  $$\text{Recommended Stroke Width} = 256 \times 0.11 \approx 28\text{ px}$$
- When rendered down to a $16\text{ px}$ browser tab:
  $$\text{Rendered Stroke Thickness} = 28 \times \left(\frac{16}{256}\right) = 1.75\text{ device pixels}$$
  *Result*: $1.75\text{ px}$ activates clean, anti-aliased subpixels on 1x displays and $3.5\text{ px}$ on 2x Retina displays. Hairline lines ($1\text{ to } 2\text{ px}$ on canvas) drop below $0.1\text{ px}$ at favicon size and vanish entirely.

### 5.3 Optical vs. Mathematical Balancing

Geometric shapes do not always appear visually balanced when centered purely by mathematical bounding box coordinates:

```
[Mathematical Center vs. Optical Center]
• Pointed / Asymmetrical Shapes: Visual weight pools in dense masses. 
  A triangle or checkmark mathematically centered looks like it is falling or sliding.
• Vertical Optical Correction: Elevate the center of mass slightly (1% to 3% above y=128) 
  to counteract human optical sagging.
• Overshoot Principle: Curved and pointed vertices must extend 1% to 2% beyond flat baseline boundaries 
  to appear equal in size to flat-edged rectangles.
```

### 5.4 The Squircle App Tile Recipe

For applications requiring app icons, desktop shortcuts, or standalone tiles, house the mark in a squircle container (superellipse):

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-labelledby="app-tile-title">
  <title id="app-tile-title">Project Name - App Tile</title>
  
  <!-- Outer Squircle Container (Padding: 16px, Corner Radius: 56px) -->
  <rect x="16" y="16" width="224" height="224" rx="56" fill="#0b0f19" stroke="#1e293b" stroke-width="4" />
  
  <!-- Centered Scalable Symbol (Example 28px Monoline Geometry) -->
  <line x1="148" y1="64" x2="68" y2="144" stroke="#6366f1" stroke-width="28" stroke-linecap="round" />
  <line x1="68" y1="144" x2="108" y2="184" stroke="#10b981" stroke-width="28" stroke-linecap="round" />
  <line x1="108" y1="184" x2="188" y2="104" stroke="#10b981" stroke-width="28" stroke-linecap="round" />
  <circle cx="68" cy="144" r="14" fill="#10b981" />
</svg>
```

### 5.5 SVG Technical Hygiene Rules

1. **Convert All Text to Path Outlines**: Never include `<text>` elements in production SVGs. If the user's operating system lacks the font family, the logo will degrade to generic system serif/sans. Convert all letterforms to explicit `<path d="...">` outlines.
2. **Eliminate Embedded Bitmaps**: Never embed base64-encoded PNGs or JPEGs inside `<image>` tags within an SVG.
3. **Ban CSS Glows & Filters**: Do not use `<filter>` tags with Gaussian blurs or complex drop shadows. They render inconsistently across browsers, crash headless rasterizers, and fail in PDF export.
4. **Use `fill-rule="evenodd"` for Negative Space**: When cutting out holes inside solid shapes, use standard SVG compound paths rather than layering white shapes over black elements.

---

## 6. Phase 4: The 7 Rigorous Testing Gates

Subject every candidate mark to the seven verification gates before approving it for production:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THE 7 TESTING GATES                             │
│                                                                        │
│  [1. Technical Audit]  ──> Automated script check (score ≥ 95)         │
│  [2. 16px Scalability] ──> True 16x16 pixel favicon clarity            │
│  [3. One-Colour Proof] ──> Solid black & solid white silhouette        │
│  [4. Surface Inversion]──> Dark mode, light mode, transparent surfaces │
│  [5. Squint / Silhouette]─> Recognizable shape when heavily blurred    │
│  [6. Rotational Read]  ──> Inversion & mirror test (no false symbols)  │
│  [7. Competitor Shelf] ──> Stands out in industry icon grid            │
└────────────────────────────────────────────────────────────────────────┘
```

### Gate 1: Automated Technical Audit (`svg_audit.py`)
Run an automated technical inspection:
```bash
python scripts/svg_audit.py symbol.svg tile.svg
```
- **Verification Points**:
  - Live `<text>` tags: `0`
  - Embedded raster images: `0`
  - CSS filters / blurs: `0`
  - Max color count: $\le 3$
  - Near-miss angles: `0`
  - Target score: $\ge 95 / 100$.

### Gate 2: The $16\text{ px}$ Favicon Scalability Test
Render the mark at true $16\times 16\text{ px}$ and $32\times 32\text{ px}$:
```bash
python scripts/render_png.py symbol.svg --size 16 --out-dir renders/
```
- Open the resulting $16\text{ px}$ PNG.
- *Pass Condition*: The silhouette remains distinctly identifiable. Negative space gaps do not fill in. Strokes do not dissolve into faint anti-aliasing halos.

### Gate 3: The One-Colour & Greyscale Test
Create two monochrome masters:
- `symbol-black.svg`: Flat `#000000` on transparent.
- `symbol-white.svg`: Flat `#ffffff` on transparent.
- *Pass Condition*: If the logo relies on color distinction to separate adjacent elements, add a deliberate negative space knockout gap ($12\text{ to } 16\text{ px}$) between intersecting forms so the mark retains full legibility without color.

### Gate 4: Surface Inversion & Contrast
Verify contrast across all target user surfaces:
- Deep Night / Slate background (`#0b0f19` or `#090d16`).
- Pure White / Paper background (`#ffffff` or `#f8fafc`).
- Mid-tone grays and brand accent surfaces.
- *Pass Condition*: Complies with WCAG AA graphical contrast requirements ($\ge 3:1$ luminance ratio against adjacent surfaces).

### Gate 5: The Squint / Blur Test
Simulate distant or peripheral vision by applying a heavy Gaussian blur ($8\text{ to } 10\text{ px}$) or squinting from 2 meters away:
- *Pass Condition*: The global shape mass distribution remains recognizable and does not look like a generic circle or square blob.

### Gate 6: The Rotational & Mirroring Test
Rotate the mark by $180^\circ$ and flip it horizontally:
- *Pass Condition*: Ensure the inverted mark does not inadvertently resemble vulgar symbols, unintended religious iconography, competitor marks, or negative cultural gestures.

### Gate 7: Competitor Shelf Test
Place the new mark inside a grid alongside the 10 most popular tools or libraries in your domain:
- *Pass Condition*: Does it pop immediately? Does it look like it belongs to the same professional tier without mimicking any competitor's geometry?

---

## 7. Phase 5: Production Asset Kit Architecture

Once the master vectors pass all 7 gates, compile the comprehensive asset suite.

### 7.1 Vector Masters Directory (`docs/brand/svg/`)

Maintain clean, unminified, human-readable vector masters in your documentation directory:

```
docs/brand/svg/
├── <project>-symbol.svg              ← Transparent master glyph (primary brand colors)
├── <project>-symbol-tile.svg         ← Master glyph on signature squircle container
├── <project>-symbol-black.svg        ← Solid one-colour black master (#000000)
├── <project>-symbol-white.svg        ← Solid one-colour white master (#ffffff)
├── <project>-symbol-mono-primary.svg ← Monochrome primary brand accent
├── <project>-symbol-mono-accent.svg  ← Monochrome secondary brand accent
├── <project>-horizontal-dark.svg     ← Horizontal lockup for dark surfaces (white wordmark)
└── <project>-horizontal-light.svg    ← Horizontal lockup for light surfaces (slate wordmark)
```

### 7.2 Web, Mobile & Platform Deliverables (`public/`)

Use automated scripts (`export_variants.py` or headless Chromium) to generate production-ready raster files:

| File Target | Pixel Dimensions | Target Platform / Purpose |
| :--- | :--- | :--- |
| `public/favicon.svg` | Scalable Vector | Modern desktop & mobile browser tabs (high DPI, dark/light aware). |
| `public/favicon.ico` | Multi-res (16, 32, 48) | Legacy browser fallback, desktop shortcuts, Windows taskbar. |
| `public/favicon-16x16.png` | $16 \times 16\text{ px}$ | Standard-density browser tabs. |
| `public/favicon-32x32.png` | $32 \times 32\text{ px}$ | Retina / High-DPI browser tabs. |
| `public/apple-touch-icon.png` | $180 \times 180\text{ px}$ | iOS Home Screen icon (iPhone / iPad). |
| `public/android-chrome-192x192.png` | $192 \times 192\text{ px}$ | Android PWA launcher tile (`any maskable`). |
| `public/android-chrome-512x512.png` | $512 \times 512\text{ px}$ | Android splash screen & app install prompt. |
| `public/og-image.png` | $512 \times 512\text{ px}$ (or $1:1$) | Open Graph square card (Discord, WhatsApp, Slack, Telegram). |
| `public/long-thumbnail.png` | $1200 \times 630\text{ px}$ ($1.91:1$) | Twitter / X Cards, LinkedIn, GitHub repository preview card. |

---

## 8. Phase 6: Codebase Integration & Legacy Asset Replacement

Integrating a new brand identity requires updating metadata, web manifests, UI containers, and repository documentation.

### 8.1 HTML Head Metadata (`index.html`)

Update all icon links, apple touch references, and Open Graph / Twitter card tags:

```html
<!-- Browser Favicons & App Icons -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />

<!-- Open Graph Social Metadata (1:1 Square) -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Project Name" />
<meta property="og:title" content="Project Title — Core Value Proposition" />
<meta property="og:description" content="Precise, one-sentence product summary." />
<meta property="og:image" content="https://your-domain.com/og-image.png" />
<meta property="og:image:width" content="512" />
<meta property="og:image:height" content="512" />
<meta property="og:image:alt" content="Project Name official geometric logo mark." />

<!-- Twitter / X Cards (1200x630 Large Summary) -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Project Title — Core Value Proposition" />
<meta name="twitter:description" content="Precise, one-sentence product summary." />
<meta name="twitter:image" content="https://your-domain.com/long-thumbnail.png" />
```

### 8.2 Progressive Web App Manifest (`public/site.webmanifest`)

Ensure the webmanifest declares both `any` and `maskable` icon targets:

```json
{
  "name": "Full Application Name",
  "short_name": "ShortName",
  "description": "Crisp description of application functionality.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0b0f19",
  "theme_color": "#0b0f19",
  "icons": [
    { "src": "/favicon-16x16.png", "sizes": "16x16", "type": "image/png" },
    { "src": "/favicon-32x32.png", "sizes": "32x32", "type": "image/png" },
    { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" },
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" },
    { "src": "/favicon.svg", "sizes": "512x512", "type": "image/svg+xml", "purpose": "any" }
  ]
}
```

### 8.3 UI Component Integration: Eliminating Double Borders

A common frontend mistake is placing an SVG tile (which already features an integrated background and border) inside a parent container with its own background, border, and padding.

#### ❌ The Double-Border Anti-Pattern:
```tsx
// Anti-pattern: Clumsy nested borders and redundant background styling
<div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 p-1.5 flex items-center justify-center">
  <img src="/favicon.svg" alt="Logo" className="w-full h-full" />
</div>
```

#### ✅ Modern Clean Squircle Container:
```tsx
// Clean pattern: Let the squircle fill the container cleanly with a subtle single ring accent
<div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-slate-800/80 hover:ring-indigo-500/60 transition-all shadow-sm shrink-0">
  <img src="/favicon.svg" alt="Project Logo" className="w-full h-full object-contain" />
</div>
```

Apply this standard across all navigation bars, mobile overlays, modals, and footers.

### 8.4 Documentation & Repository Housekeeping

1. **`README.md`**: Update the top project banner:
   ```html
   <p align="center">
     <img src="public/favicon.svg" alt="Project Logo" width="80" height="80" />
   </p>
   ```
2. **`AGENTS.md`**: Document the brand assets directory (`docs/brand/`) in the repository architecture map.
3. **Decisions Log (`docs/decisions.md`)**: Record the redesign date, rationale, audit scores, and asset manifest.
4. **Cleanup Intermediate Files**: Delete temporary presentation generators, scratch scripts, unapproved concept files, and duplicate directories. Keep only permanent vector masters, brand guidelines, and production deliverables.

---

## 9. Reusable Master Execution Checklist

Copy this checklist into your planning documents or issue tracker for any branding or logo design task:

```markdown
### Phase 1: Project Discovery & Understanding
- [ ] Audit repository: name, exact casing, purpose, and audience.
- [ ] Establish 3–5 core brand adjectives as visual evaluation criteria.
- [ ] Research category competitors and identify visual clichés to avoid.
- [ ] Perform flaw audit on legacy mark (if redesigning).

### Phase 2: Strategic Concept Exploration
- [ ] Conduct word mapping across function, ethos, and outcome.
- [ ] Draft 8–12 one-sentence concept statements.
- [ ] Select 2–3 distinct directions across different mark types.
- [ ] Render concept overview in pure greyscale/monochrome.
- [ ] Present checkpoint to user/stakeholders; lock approved direction before building kit.

### Phase 3: Geometric SVG Construction
- [ ] Build on standard 256×256 integer canvas grid.
- [ ] Restrict line trajectories to exact 0°, 45°, and 90° angles.
- [ ] Set stroke thickness to ~10–12% of canvas width (26–28 px).
- [ ] Convert all typography and wordmarks to outlined vector paths.
- [ ] Eliminate all embedded rasters, live fonts, gradients, and CSS filters.

### Phase 4: The 7 Verification Gates
- [ ] Gate 1: Run automated audit (svg_audit.py score ≥ 95).
- [ ] Gate 2: Verify 16×16 px true favicon legibility.
- [ ] Gate 3: Verify solid black (#000) and solid white (#fff) silhouettes.
- [ ] Gate 4: Test contrast on dark, light, and transparent surfaces.
- [ ] Gate 5: Perform squint/blur test (8–10 px blur).
- [ ] Gate 6: Check 180° rotation and horizontal mirroring.
- [ ] Gate 7: Benchmark mark in competitor shelf grid.

### Phase 5: Asset Kit Production
- [ ] Export vector masters to docs/brand/svg/ (symbol, tile, monochrome, lockups).
- [ ] Render raster favicons (16x16, 32x32, multi-res .ico).
- [ ] Render mobile PWA app icons (180x180, 192x192, 512x512).
- [ ] Render social share cards (og-image 512x512, long-thumbnail 1200x630).

### Phase 6: Codebase Integration
- [ ] Deploy generated files to /public directory.
- [ ] Update index.html link, meta, and Open Graph tags.
- [ ] Update site.webmanifest icon definitions.
- [ ] Refactor UI components (Header, MobileNotice) to eliminate double-border nesting.
- [ ] Update README.md header banner and AGENTS.md file map.
- [ ] Remove temporary scratch scripts and intermediate presentation files.
- [ ] Run test suite (npx tsc, vitest, npm run build) to confirm zero regressions.
```

---

*Universal Standard for Identity Engineering & SVG Craftsmanship.*  
*Maintained under the [kaankiziltug/logo-design-skill](https://github.com/kaankiziltug/logo-design-skill) open framework.*
