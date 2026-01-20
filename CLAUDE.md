# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio website for Patricio Salinas, a professional photographer. The site features his visual essays exploring existential themes, memory, and identity through photography. Content is managed via WordPress (headless CMS) and served through GraphQL.

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
- **WordPress + GraphQL** - Headless CMS at `apuntesdispersos.com/graphql`

## Architecture

### Data Flow

```
WordPress (CMS) → GraphQL → src/lib/graphql-queries.ts → Astro pages
                              ↓
                    src/data/*.json (local cache)
```

**Environment control:** `USE_LOCAL_DATA` env var determines data source:
- Local dev: uses JSON files in `src/data/` (default)
- Production (Vercel): `USE_LOCAL_DATA=false` fetches from WordPress GraphQL

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
| `HomePage.astro` | Homepage with project grid |
| `GalleryPage.astro` | Full gallery layout |
| `PressPage.astro` | Press coverage with media-text blocks |
| `PageContent.astro` | Generic WordPress content renderer |

### Content Processing

WordPress content (HTML with Gutenberg blocks) is parsed and transformed:
1. `node-html-parser` extracts images and text
2. Images wrapped in `ReactProtectedImage` for protection
3. `wordpress-styles.css` handles block styling

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
