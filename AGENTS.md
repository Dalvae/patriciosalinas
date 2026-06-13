# AGENTS.md

## Project

Portfolio site for photographer Patricio Salinas. Astro 5 static site (no SSR), tri-lingual (en/es/sv), deployed via Vercel.

**Design context is normative.** Read these before any visual/UI work:
- `PRODUCT.md` — brand, audiences, anti-references, design principles
- `DESIGN.md` — the visual system (colors, typography, component specs, do's/don'ts)
- `CLAUDE.md` — technical architecture overview

## Commands

```bash
pnpm dev          # Dev server at localhost:4321
pnpm build        # astro check + astro build
pnpm preview      # Preview production build
```

Use **pnpm**, not npm or yarn.

## Architecture

### Routing

One dynamic route handles everything: `src/pages/[lang]/[...uri].astro`. Root `/` → 301 to `/en/`. All routes are locale-prefixed (`/en/`, `/es/`, `/sv/`).

### Content Collections

| Collection | Source | Format | Purpose |
|---|---|---|---|
| `pages` | `src/content/pages/{en,es,sv}/**/*.md` | MD frontmatter | Page metadata, routing, type dispatch |
| `home` | `src/content/home/{en,es,sv}.yaml` | YAML | Homepage data: statement, spreads, closing |
| `gallery` | `src/content/gallery.yaml` | YAML | Gallery images with i18n alt/titles |
| `press` | `src/content/press/{en,es,sv}.yaml` | YAML | Press links and cards |
| `videos` | `src/content/videos/videos.yaml` | YAML | Video IDs and titles |

Page `type` field dispatches to the correct component in `[...uri].astro`:
- `home` → `HomePage.astro`, `gallery` → `GalleryPage.astro`, `press` → `PressPage.astro`, `videos` → `VideosPage.astro`
- Everything else → `ProseContent.astro` (generic Astro `render()`)

### i18n

Three languages (`en`, `es`, `sv`). Translations in `src/i18n/ui.ts`. Utilities in `src/i18n/utils.ts`. Page slugs differ per language; use `src/lib/project-utils.ts` helpers. **When adding content, you must add entries for all three languages** — the build will fail otherwise.

### Components

- **React 18** — only used for `ReactProtectedImage.tsx` (right-click protection + lightbox gallery). Everything else is `.astro`.
- `Navbar.astro` — full-width, typographic nav with language switcher
- `Footer.astro` — minimal footer with social icons
- `Layout.astro` — SEO meta, hreflang tags, structured data, shared chrome

### WordPress Legacy

Content was migrated once from WordPress into static Markdown/YAML. WordPress snapshots in `src/data/` are not read at build time. Do not import or render Gutenberg HTML. All current content lives under `src/content/`.

### Tailwind 4

Config is in `src/styles/app.css`, not a JS config file. Uses `@tailwindcss/vite` plugin.

### Path Aliases (tsconfig.json)

`@components/*`, `@layouts/*`, `@lib/*`, `@i18n/*`, `@types/*`

## Design Constraints

**The Monochrome Rule:** Interface is ink (#111111), paper (#ffffff), and the gray ramp. Photography provides the only tone on any page. No UI accent colors.

**The One Family Rule:** Playfair Display (roman + italic) is the only type family. No sans-serif. Contrast comes from weight, case, tracking, and italics — never color.

**The One Plane Rule:** Surfaces are flat at rest. Shadows only for elements that genuinely float (dropdowns, lightbox).

**The Dead Token Rule:** `--color-gold: #d4af37` and Abril Fatface are defined in `app.css` but used nowhere. They are not part of the identity. Do not use them.

**Image protection:** Images served via Cloudinary with right-click and drag disabled on `ReactProtectedImage`.

## When Adding/Changing Content

1. Add the MD page to `src/content/pages/{lang}/` for each language with matching `translationKey`
2. If the page type needs YAML data, add files to the corresponding content collection for all three languages
3. Run `pnpm build` to catch schema validation errors from `content.config.ts`
4. The server auto-reloads on content changes — no restart needed

## Fallow

- Use `fallow audit --format json --quiet` before committing AI-generated changes.
- Use `fallow dead-code --format json --quiet`, `fallow dupes --format json --quiet`, and `fallow health --format json --quiet` for targeted checks.
- Use `fallow list --entry-points --format json --quiet` and `fallow list --boundaries --format json --quiet` to inspect project shape.

<!-- generated:task-matrix:start -->
| When the agent is about to... | Run |
|---|---|
| delete an "unused" export or file | `fallow dead-code --trace <file>:<export>` |
| delete an "unused" dependency | `fallow dead-code --trace-dependency <name>` |
| commit or open a PR | `fallow audit --base <ref>` |
| prioritize refactoring | `fallow health --hotspots --targets` |
| ask who owns code | `fallow health --ownership` |
| check untested-but-reachable code | `fallow health --coverage-gaps` |
| consolidate duplication | `fallow dupes --trace dup:<fingerprint>` |
| find feature flags | `fallow flags` |
| surface security candidates | `fallow security` |
| understand a finding | `fallow explain <issue-type>` |
| scope a monorepo | `--workspace <glob> / --changed-workspaces <ref>` (global flags, prefix any command) |
<!-- generated:task-matrix:end -->

## Agent Rules

- Do not edit `.claude/`, `.agents/`, `.omc/`, `.fallow/` unless the user asks
- Do not remove `@fontsource/fira-sans` — it's a dependency even though Playfair Display is the design font (Fira Sans may be used for non-design areas or fallback)
- Always read `DESIGN.md` before making visual changes
- New content pages require entries in all three languages
