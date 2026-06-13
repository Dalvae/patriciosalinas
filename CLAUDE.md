# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio website for Patricio Salinas, a professional photographer. The site features his visual essays exploring existential themes, memory, and identity through photography. Content is versioned locally as Astro content collections.

**Design principles:** Minimalist, intellectual aesthetic. Typography-focused with Playfair Display. Black and white photography. Clean layouts that let the work speak.

## Commands

```bash
pnpm dev      # Start dev server (localhost:4321)
pnpm build    # Type check + build for production
pnpm preview  # Preview production build locally
```

## Tech Stack

- **Astro 5** - Static site generator (100% static, no SSR)
- **Tailwind 4** - Configured via `@tailwindcss/vite` plugin, theme in `src/styles/app.css`
- **React 18** - For interactive components (image gallery modal)
- **Vercel** - Deployment adapter
- **WordPress** — legacy source only. Current build uses exported Markdown/YAML under `src/content/`.

## Architecture

### Data Flow

```
src/content/pages/**/*.md → Astro render()
src/content/{gallery,press,home,videos}/*.yaml → Astro components
```

WordPress is legacy source only. The current build uses Markdown/YAML under `src/content/` and does not read WordPress snapshots.

### Internationalization

Three languages: English (`en`), Spanish (`es`), Swedish (`sv`)

- All routes prefixed: `/en/`, `/es/`, `/sv/`
- Root `/` redirects to `/en/` (301)
- Translations in `src/i18n/ui.ts`
- Language utils in `src/i18n/utils.ts`
- Page slugs vary by language (see `src/lib/project-utils.ts`)

### Key Components

| Component | Purpose |
|-----------|---------|
| `ReactProtectedImage.tsx` | Main image component with right-click protection and lightbox gallery |
| `HomePage.astro` | Homepage rendered from `src/content/home/*.yaml` plus project data |
| `GalleryPage.astro` | Full gallery layout rendered from `src/content/gallery/*.yaml` |
| `PressPage.astro` | Press coverage rendered from `src/content/press/*.yaml` |
| `VideosPage.astro` | Videos rendered from `src/content/videos/videos.yaml` |
| `ProseContent.astro` | Generic Markdown renderer using Astro `render(entry)` |

### Content Processing

WordPress HTML was migrated once into clean Markdown/YAML. Do not import or render Gutenberg HTML. Markdown pages are rendered with Astro's content collections `render()` API; structured pages use YAML collections and dedicated Astro components.

### Image Protection

The site implements image protection to discourage unauthorized downloads:
- Right-click disabled on images
- Drag disabled
- Images served via Cloudinary (`res.cloudinary.com`)

## Tailwind 4 Configuration

Config is in CSS, not JS. See `src/styles/app.css`:
```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --font-playfair: "Playfair Display", serif;
  --color-gold: #d4af37;
}
```

## Path Aliases

Defined in `tsconfig.json`:
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@lib/*` → `src/lib/*`
- `@i18n/*` → `src/i18n/*`
- `@types/*` → `src/types/*`

## Design Context

- **PRODUCT.md** (project root) — strategic design context: register (brand), audiences, brand personality, anti-references, design principles. Read it before any design work.
- **DESIGN.md** (project root) — the visual system: monochrome ink-on-paper palette, Playfair Display-only typography, named rules (e.g. The Monochrome Rule, The One Family Rule), component specs. Tokens in its YAML frontmatter are normative.
- Note: `--color-gold` and Abril Fatface in `app.css` are dead tokens — defined but unused; not part of the identity.
