# Plan: jubilar WordPress — migración completa a contenido nativo Astro

**Estado actual:** el contenido vive en WordPress (`apuntesdispersos.com/graphql`) y se consume vía GraphQL en build (`src/lib/graphql-queries.ts`). En dev se usa un cache local `src/data/{en,es,sv}-content.json` (gitignoreado) controlado por `USE_LOCAL_DATA`. Las imágenes ya están en Cloudinary con URLs absolutas.

**Meta:** contenido versionado en el repo como **markdown puro + datos estructurados**, renderizado por componentes Astro propios. Sin HTML de Gutenberg, sin `node-html-parser` en runtime, sin `wordpress-styles.css`. Las imágenes siguen en Cloudinary, referenciadas como links. Editar = tocar un archivo y push.

> Decisión (Diego, jun 2026): **no** se acepta el plan anterior de "body = HTML crudo dentro de markdown". Migración completa de una vez, sin fase de limpieza opcional posterior.

## Censo del contenido real (lo que de verdad hay que modelar)

Análisis de los 56 nodos (EN 18, ES 21, SV 17) sobre `src/data/*.json`:

| Estructura | Instancias | Dónde |
|---|---|---|
| `figure.wp-block-image` (img + figcaption) | 626 | ensayos, galería |
| Párrafos / headings / listas / quote | ~320 | ensayos, bio |
| `wp-block-gallery` (grupos de imágenes, `columns-N`) | ~60 | ensayos, galería |
| Embed YouTube | 15 | videos (×3 idiomas) |
| `wp-block-media-text` (card con link) | 6 | prensa |
| Alineación `has-text-align-center/right` | 30 | créditos/firmas |
| `columns`/`group`/`spacer` (envoltorios sin semántica) | ~15 | se descartan al migrar |

Conclusión: **dos naturalezas de contenido**, y la arquitectura las separa:

1. **Prosa** (proyectos, publicaciones, bio, exposiciones): texto largo + imágenes + galerías → **markdown**.
2. **Datos** (galería de venta, prensa, videos): listas estructuradas → **YAML/JSON**.

## Modelo de contenido

### Colección `pages` (markdown puro) — prosa

```
src/content/pages/
├── en/atacama.md          ├── es/atacama.md          ├── sv/atacama.md
├── en/walter-benjamin.md  ├── es/bio.md (solo es)    └── ...
```

Frontmatter (schema zod en `src/content.config.ts`):

```yaml
---
title: "Atacama"
uri: "/en/projects/atacama-2/"   # byte-idéntico al actual (SEO/hreflang)
lang: en
type: project        # project | publication | page | hub
translationKey: atacama   # une las versiones de idioma; tolera faltantes
order: 1             # orden en nav / grilla del home
---
```

Body — **markdown puro, cero HTML**:

```markdown
In mid-November 1973, two months after the Chilean military coup…

![Chacabuco, Atacama](https://res.cloudinary.com/dwxc8s4mq/images/w_1024,h_512,c_scale/v…/Atacama-007.jpg "Chacabuco | Silver print | 1 of 10")

:::gallery{columns=3}
![…](https://res.cloudinary.com/…)
![…](https://res.cloudinary.com/…)
:::
```

Convenciones del body:
- **Imagen = link Cloudinary tal cual** (con su segmento de transformación `w_,h_,c_scale` — de ahí salen width/height/aspect-ratio; `HomePage.aspectOf()` ya depende de eso). Se descartan `srcset`/`data-*`: hoy `ReactProtectedImage` solo consume `src`, no hay pérdida.
- **Caption = title del link markdown**, con `|` como salto de línea (`"Barcelona | Silver Print Analog | 1 of 10 copies"`). El renderer lo convierte a líneas; el lightbox las muestra igual que hoy.
- **Galerías** con directiva `:::gallery{columns=N}` (remark-directive; sigue siendo texto legible/diffeable).
- **Alineación** (30 casos, créditos y firmas) con `:::center` / `:::right`.
- Los envoltorios `columns/group/spacer` de Gutenberg **no se migran** — no aportan semántica en este sitio.

Las páginas hub vacías (`/en/projects/`, `/es/publicaciones/`…) son `.md` con `type: hub` y body vacío: existen para la ruta y la nav.

### Colecciones de datos (YAML) — donde JSON/YAML gana

```
src/content/gallery/{en,es,sv}.yaml   # venta: [{src, alt, title, technique, edition}]
src/content/press/{en,es,sv}.yaml     # links: [{label, url}] + cards: [{src, text, url}] + images
src/content/videos/videos.yaml        # [{title, youtubeId}] — compartido, los títulos no se traducen
src/content/home/{en,es,sv}.yaml      # ver abajo
```

El contenido de galería/prensa difiere por idioma (ES tiene más prensa y otra galería), por eso archivo por idioma y no campos `{en,es,sv}` anidados. Videos es idéntico en los 3 → un solo archivo.

### Home: estructura explícita, no heurística

Hoy `HomePage.astro` parsea el HTML, parte el primer párrafo "en las dos primeras frases" con regex y matchea proyectos por título hardcodeado (`"Walter Benjamin"`, `"Atacama"`). Eso se reemplaza por datos explícitos:

```yaml
# src/content/home/en.yaml
statement: "My work is conceived as a visual essay… based on personal experiences."
reflection: "From these, my reflections arise…"
spreads:
  - project: walter-benjamin     # translationKey → título, link e imágenes salen de la colección pages
    paragraph: "In the visual essay about Walter Benjamin…"
  - project: atacama
    paragraph: "On the other hand, my work on Atacama…"
closing: "It is a visual work of fractured memory…"
```

`HomePage.astro` deja de adivinar: lee spreads en orden, saca imágenes de cada proyecto vía su entrada en `pages` (las imágenes se extraen del markdown del proyecto, igual que hoy se extraen del HTML).

## i18n

- **Prosa**: carpeta por idioma dentro de `pages`, unida por `translationKey`. Asimetría permitida (bio/observaciones/encuentros/libros solo existen en ES). El language switcher y hreflang se resuelven por `translationKey`; si falta traducción, cae al hub del idioma destino (comportamiento actual).
- **Datos**: archivo YAML por idioma (galería, prensa, home); compartido cuando el contenido es idéntico (videos).
- **Strings de UI**: siguen en `src/i18n/ui.ts` — no se mueven.
- **URIs**: se preservan byte-idénticas por idioma desde el frontmatter (`/en/projects/atacama-2/` ≠ `/es/proyectos/atacama/`). Nota: el home SV tiene `uri: "/"` en WP (quirk de idioma default de Polylang); en el repo se normaliza a `/sv/` que es lo que la ruta genera hoy.

## Renderizado (por qué no MDX ni `render()` a secas)

El lightbox (`ReactProtectedImage`) es una isla React que necesita `allImages` (todas las imágenes de la página, para prev/next). Ni el `render()` de markdown ni un plugin rehype pueden emitir islas hidratadas con props de página. La solución es la misma arquitectura de hoy con input limpio:

- **`ProseContent.astro`** (reemplaza `PageContent.astro`): parsea el body markdown a AST (`remark` + `remark-directive`), recolecta `allImages`, y mapea nodos → párrafos/headings (HTML del propio remark) e imágenes/galerías → `<ProtectedImage client:load>`. Tipografía con clases propias del design system (DESIGN.md), no `prose` + `wordpress-styles.css`.
- **`GalleryPage.astro`** / **`PressPage.astro`**: dejan de parsear HTML; iteran su YAML directo.
- **`VideosPage.astro`** (nuevo, hoy videos pasa por PageContent): itera `videos.yaml` con un embed propio.
- **`HomePage.astro`**: consume `home/{lang}.yaml` + colección pages; se borran `splitStatement`, el matcheo por título y el parseo HTML.
- **Ruta `[lang]/[...uri].astro`**: `getStaticPaths` sobre `getCollection`; el `type` del frontmatter decide el componente (hoy se decide por slug hardcodeado `"gallery" | "galeria" | "galleri"`…).

## Fases

### Fase 0 — Export (script, se corre una vez, output commiteado)
`scripts/export-wp.mjs`: lee `src/data/*.json` (snapshot ya existente; opcionalmente refresca de GraphQL antes), convierte HTML → modelo:
- Gutenberg→markdown a mano sobre `node-html-parser` (el vocabulario son ~8 bloques, ver censo; turndown no entiende galerías/captions). Unwrap de columns/group/spacer.
- Galería/prensa/videos/home → YAML.
- **Validación integrada**: por cada página compara (texto plano normalizado, secuencia de URLs de imagen, secuencia de captions) entre el HTML original y el markdown re-renderizado. Si difiere, el script falla señalando página y nodo. Esto es lo que garantiza "migrar bien" sin diff visual manual.

### Fase 1 — Schemas
`src/content.config.ts`: colección `pages` (glob md) + `gallery`/`press`/`videos`/`home` (file yaml), todas con zod estricto (URLs Cloudinary validadas con regex, `translationKey` requerido, `uri` único).

### Fase 2 — Renderers nuevos
`ProseContent.astro`, swap de Gallery/Press/Videos/Home a datos, ruta sobre `getCollection`. Borrar `graphql-queries.ts`, `USE_LOCAL_DATA`, `getLocalData`.

### Fase 3 — Verificación
- `pnpm build`: el set de rutas generadas debe ser **idéntico** al actual (script de diff contra `dist/` pre-migración).
- Re-correr la validación de Fase 0 contra el render final.
- hreflang/language switcher con las asimetrías de idioma.
- QA visual de Diego en dev (las páginas de prosa tendrán tipografía del design system, no la de WP — es el único cambio visual *esperado*).

### Fase 4 — Limpieza
- Borrar `wordpress-styles.css`, `plugins/` (parches WP GraphQL Polylang), `src/data/*` y su gitignore, env vars de Vercel (`USE_LOCAL_DATA`, endpoint), deploy-hook de WP, `HomePage2.astro` si sigue muerto.
- `node-html-parser` queda solo como devDependency del script de export.
- WordPress en read-only ~1 mes como respaldo; después decomisionar hosting.

## Flujo de edición resultante

Texto: editar el `.md` (local o GitHub web). Imagen nueva: subir a Cloudinary, pegar el link en el `.md`. Video nuevo: una línea en `videos.yaml`. Commit → push → Vercel buildea.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Pérdida de contenido en la conversión HTML→md | Validación automática de Fase 0 (texto + imágenes + captions, página por página) |
| Cambio accidental de URIs (SEO) | `uri` en frontmatter copiado tal cual; diff de rutas en Fase 3 |
| Tipografía distinta al soltar `wordpress-styles.css` | Cambio esperado y deseado: se alinea a DESIGN.md; QA de Diego |
| Caption con `|` literal en el texto | El export escapa `\|`; el renderer lo respeta |
| WP editado después del snapshot | Congelar ediciones en WP al correr Fase 0, o re-correr el script |

**Estimación:** Fase 0–1 una sesión (el export con validación es el grueso), Fase 2–3 otra, Fase 4 corta.
