# Plan: jubilar WordPress (contenido en el repo, sin CMS)

**Estado actual:** el contenido vive en WordPress (`apuntesdispersos.com/graphql`) y se consume vía GraphQL en build (`src/lib/graphql-queries.ts`). En dev se usa un cache local `src/data/{en,es,sv}-content.json` (gitignoreado) controlado por `USE_LOCAL_DATA`. Las imágenes ya están en Cloudinary con URLs absolutas dentro del HTML del contenido.

**Meta:** el contenido vive versionado en el repo como archivos, Astro lo lee nativo, no hay CMS ni dependencia de WordPress. Editar = tocar un archivo y push (deploy automático en Vercel).

## Decisión: Content Collections con Markdown + HTML embebido

- **Una colección `pages`**, una carpeta por idioma:
  ```
  src/content/pages/
  ├── en/projects-atacama.md
  ├── en/bio.md
  ├── es/proyectos-atacama.md
  └── sv/...
  ```
- **Frontmatter** (schema con zod en `src/content.config.ts`):
  ```yaml
  ---
  title: "Atacama"
  uri: "/en/projects/atacama-2/"   # byte-idéntico al actual (SEO/hreflang)
  lang: "en"
  type: "project"                   # home | project | gallery | press | page
  isFrontPage: false
  order: 1
  translationKey: "atacama"         # une las 3 versiones de idioma
  ---
  ```
- **El body es el HTML de Gutenberg tal cual** (markdown acepta HTML crudo). Cero regresión visual: los componentes ya parsean ese HTML con `node-html-parser` y `wordpress-styles.css`. Limpiar páginas a markdown puro queda como mejora opcional, página por página, cuando se quiera.
- **Por qué no JSON:** el contenido es HTML rico; en `.md` se edita y diffea mejor. JSON queda como opción para datos estructurados puntuales si algún día hace falta (p. ej. lista de prensa).

## Fases

### Fase 0 — Snapshot (una vez)
Script `scripts/export-wp.mjs`: lee el GraphQL de WP (o el cache `src/data/*.json`) y genera los `.md` con frontmatter + body HTML. Se corre una vez y **el output se commitea** (a diferencia de `src/data`, que está gitignoreado).

### Fase 1 — Schema
`src/content.config.ts` con la colección `pages` y el schema de arriba. Astro 5 usa `glob()` loader sobre `src/content/pages`.

### Fase 2 — Swap de la capa de datos
Reimplementar `getPages(lang)` sobre `getCollection("pages")` **devolviendo exactamente la misma forma** (`{ title, uri, content, isFrontPage }`) para que `[lang]/[...uri].astro`, `HomePage`, `Navbar`, `GalleryPage`, `PressPage` no cambien ni una línea. Para el body usar `render()` o el raw body directo (es HTML). Eliminar `USE_LOCAL_DATA` y el fetch a WP.

### Fase 3 — Verificación
- `pnpm build` y comparar rutas generadas contra producción (63 páginas, 3 idiomas, mismas URIs, hreflang intacto).
- Los matcheos por título en el home ("Atacama", "Walter Benjamin") y por uri en gallery/press dependen de que títulos y slugs no cambien — verificar.
- QA visual de Diego en dev.

### Fase 4 — Limpieza
- Borrar el código GraphQL/WP de `src/lib`, la carpeta `plugins/` (parches de WP GraphQL Polylang) y las env vars de Vercel (`USE_LOCAL_DATA`, endpoint WP).
- Quitar el deploy-hook que dispara rebuilds desde WP.
- Dejar el WordPress vivo en read-only ~1 mes como respaldo; después decomisionar el hosting.

### Fase 5 (opcional, después) — Imágenes
Hoy las URLs de Cloudinary siguen funcionando igual (están dentro del HTML). Mejora futura: bajarlas al repo y servirlas con `astro:assets` para soltar también Cloudinary. No bloquea nada de lo anterior.

## Flujo de edición resultante

Editar el `.md` (local o desde la web de GitHub) → commit → push → Vercel buildea. Sin manager, sin plugins, sin GraphQL caído a mitad de deploy (ver historial: varios "Retry deploy: WordPress GraphQL returned 500").

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Cambio accidental de URIs (SEO) | El export usa las URIs actuales tal cual; diff de rutas en Fase 3 |
| Contenido WP editado después del snapshot | Congelar ediciones en WP al correr Fase 0, o re-correr el script |
| HTML de Gutenberg con dependencias de clases WP | Ya cubierto: `wordpress-styles.css` se mantiene |

**Estimación:** Fase 0–2 en una sesión (~2-3 h), Fase 3-4 otra corta.
