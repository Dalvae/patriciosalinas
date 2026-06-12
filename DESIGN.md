---
name: Patricio Salinas
description: Monochrome, typography-led portfolio for photographic visual essays
colors:
  ink-black: "#111111"
  page-white: "#ffffff"
  nav-charcoal: "#262626"
  caption-gray: "#4b5563"
  hairline-gray: "#e5e7eb"
  scrim-60: "#00000099"
  scrim-90: "#000000e6"
typography:
  display:
    fontFamily: "Playfair Display, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Playfair Display, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Playfair Display, serif"
    fontSize: "1rem"
    fontWeight: 400
    letterSpacing: "0.025em"
  caption:
    fontFamily: "Playfair Display, serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  none: "0px"
  sm: "4px"
  full: "9999px"
spacing:
  gallery-gap: "16px"
  page-x: "24px"
  page-x-wide: "48px"
components:
  nav-link:
    textColor: "{colors.nav-charcoal}"
    typography: "{typography.label}"
  nav-link-active:
    textColor: "{colors.ink-black}"
    typography: "{typography.label}"
  dropdown-panel:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.nav-charcoal}"
    rounded: "{rounded.none}"
  lightbox-control:
    backgroundColor: "{colors.scrim-60}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.full}"
    padding: "8px"
---

# Design System: Patricio Salinas

## 1. Overview

**Creative North Star: "The Printed Essay"**

The site is a finely-set book of photo-essays. Text and image are equals: a justified Playfair Display column sits beside the photographs the way an essay sits beside its plates. Every visual decision defers to black-and-white photography — the interface is monochrome ink on white paper so that the only tonality on any page comes from the work itself. The visitor should feel they are reading a publication, not browsing a website.

The system explicitly rejects what PRODUCT.md rejects: stock photographer templates (full-bleed slideshows, "book a session" energy), trendy agency portfolios (WebGL, cursor effects, scroll-jacking), commercial e-commerce feel, and cold tech minimalism. Restraint here is literary, not corporate: a serif everywhere, justified prose, uppercase letterspaced wayfinding — the conventions of fine book design, not of SaaS.

**Key Characteristics:**
- Monochrome ink-on-paper palette; photographs are the only source of tone
- One serif family (Playfair Display, roman + italic) carries the entire voice
- Refined and restrained components: typography does the signaling; chrome recedes
- Essay layout: text column and image sequence side by side as equals
- Three languages, one identical gravity

## 2. Colors

A strict monochrome ramp from ink to paper; there is no accent color in the live system.

### Primary
- **Ink Black** (#111111): The system's ink. Page titles, the wordmark, active navigation states. Defined as `--color-primary-600` in `app.css`.

### Neutral
- **Page White** (#ffffff): The paper. Body background, content columns, dropdown panels. The white must stay pure — no warm or cool tinting that would contaminate the photographs' grays.
- **Nav Charcoal** (#262626): Resting state of navigation links (`neutral-800`); darkens toward Ink Black on hover (`neutral-950`).
- **Caption Gray** (#4b5563): Secondary text — the nav subtitle, captions, metadata (`gray-600`). Passes 4.5:1 on white; do not go lighter.
- **Hairline Gray** (#e5e7eb): The only border color — dropdown panel edges (`gray-200`), 1px always.
- **Scrim 60 / Scrim 90** (#00000099 / #000000e6): Functional blacks. Scrim 60 backs image hover overlays and lightbox controls; Scrim 90 is the lightbox backdrop — the one "dark room" in the system, where photographs are viewed against near-black.

### Named Rules
**The Monochrome Rule.** The interface is ink, paper, and gray. Photography is the only source of tone on any page. Introducing a UI accent color is prohibited without an explicit identity decision.

**The Dead Token Rule.** `--color-gold: #d4af37` and the Abril Fatface font are defined in `app.css` but used nowhere; the site owner has never seen them render. They are not part of this system. Never reach for them as "the brand accent"; remove them when convenient.

## 3. Typography

**Display Font:** Playfair Display (variable, 100–900; with serif fallback)
**Body Font:** Playfair Display (same family)
**Italic:** Playfair Display Italic (variable; used for the language switcher and editorial emphasis)

**Character:** One literary serif carries everything — wayfinding, titles, prose, captions. The voice is bookish and confident: justified paragraphs, uppercase letterspaced navigation, italics as a quiet cue. No sans-serif appears anywhere.

### Hierarchy
- **Wordmark** (700, 1.25rem, `tracking-widest` 0.1em, uppercase): "PATRICIO SALINAS A" — the widest tracking in the system, reserved for the name alone.
- **Display** (600, 1.5rem, `tracking-tight` −0.025em): Project and page titles.
- **Body** (400, 1rem; 0.875rem on medium screens, justified): Essay prose. WordPress "large" text maps to 1.5rem/2rem.
- **Label** (400, 1rem, uppercase): Navigation links. Case and underline signal state, not color or weight changes.
- **Caption** (400, 0.875rem): Subtitles, image captions, metadata in Caption Gray. Footer fine print drops to 0.75rem; WordPress "small" maps to 0.7rem.

### Named Rules
**The One Family Rule.** Playfair Display (roman + italic) is the entire typographic voice. Adding a second family is prohibited without an identity decision; contrast comes from weight, case, tracking, and italics.

**The Typographic Signal Rule.** Interactive states are typographic: active pages are underlined (`text-underline-offset: 4px`), hover darkens charcoal to near-black, the current language is italic. No pills, badges, or color flips.

## 4. Elevation

The system is print-flat at rest, with subtle depth permitted where function demands it. Surfaces sit on one plane; layering appears only when something genuinely floats: the navigation dropdown casts a soft `shadow-lg` over the page, and the lightbox lifts photographs into a near-black room (Scrim 90) above everything. Gentle ambient shadows on hover states are allowed when they aid affordance, but depth must never decorate — a card or panel at rest stays flat.

### Shadow Vocabulary
- **Floating panel** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): Dropdown menus only — anything that overlays content while the page stays interactive.
- **Title lift** (`drop-shadow: 0 4px 3px rgb(0 0 0 / 0.07)`): Currently on homepage project titles; tolerated legacy, not a pattern to extend.

### Named Rules
**The One Plane Rule.** Surfaces are flat at rest. Shadow is a response to floating (dropdowns, lightbox), never a default card treatment.

## 5. Components

The component philosophy is **refined and restrained**: quietly crafted details — hairline borders, precise spacing, typographic state changes — noticeable on inspection, silent otherwise. The site has no marketing buttons or CTAs; navigation, images, and the lightbox are the interface.

### Navigation
- **Style:** Full-width bar, white ground, no border or shadow. Wordmark left with Caption Gray subtitle beneath; uppercase Playfair links right with 12px gaps.
- **States:** Resting Nav Charcoal → near-black on hover; active page underlined at 4px offset. Dropdowns open white panels with Hairline Gray 1px borders and the floating-panel shadow, square corners, 192px wide.
- **Language switcher:** The system's one eccentric detail — an italic label in a 1px *dashed* charcoal border, 4px radius. A hand-drawn aside in the book's margin; keep it singular.
- **Mobile:** Collapses to a menu icon; items stack vertically, full width.

### Protected Image (signature component)
- **Container:** `overflow: hidden`, square corners, `cursor: pointer`; right-click and drag suppressed.
- **Overlay:** Scrim 60 with white expand icon and caption, fading in on hover (150ms); on mobile it appears when the image is mostly out of view. Opens the lightbox on click.

### Lightbox
- **Backdrop:** Scrim 90 full-viewport portal — the dark viewing room. Image constrained to `max-h: 80vh`, `object-contain`, max-width 1024px.
- **Controls:** White icons on Scrim 60 circles (`rounded-full`, 8px padding); close top-right, prev/next at the sides. Click zones on the image's outer thirds also navigate. Escape closes.
- **Caption:** White, 1.125rem, right of the image on wide screens, beneath it otherwise.

### Image Loopers & Galleries
- **InfiniteLooper:** Homepage marquee strips of project images, alternating direction per project, ~35vh tall. Needs a `prefers-reduced-motion` pause (currently missing).
- **WordPress galleries:** 3 columns desktop / 2 tablet / 1 mobile, 16px gap (`--gallery-gap`); cropped variants use fixed 300px rows with `object-cover`.

### Footer
- Minimal strip: outlined social icons (Instagram, mail, X) left, 0.75rem copyright right. Icons darken to Caption Gray on hover.

## 6. Do's and Don'ts

### Do:
- **Do** keep the interface strictly monochrome (#111111 ink, #ffffff paper, the gray ramp); let photographs provide all tone.
- **Do** use Playfair Display for everything, with case, weight (400/600/700), tracking, and italics as the only contrast tools.
- **Do** signal interaction typographically: underline at 4px offset for active, charcoal-to-black on hover, italic for language.
- **Do** keep borders at 1px Hairline Gray and corners square (the language pill's 4px dash and the lightbox's circular controls are the only exceptions).
- **Do** maintain Caption Gray (#4b5563) as the floor for text contrast on white; never lighter.
- **Do** give every animation a `prefers-reduced-motion` alternative — the homepage loopers must pause to static strips.

### Don't:
- **Don't** use the dead tokens: no `--color-gold` (#d4af37) accents, no Abril Fatface. They are unused legacy and not part of the identity.
- **Don't** drift toward "stock photographer templates" — full-bleed hero slideshows, script logos, booking CTAs (PRODUCT.md anti-reference).
- **Don't** add "trendy agency portfolio" effects — WebGL, cursor followers, scroll-jacking; nothing may upstage the photographs (PRODUCT.md anti-reference).
- **Don't** introduce "commercial/e-commerce feel" — prices, carts, promotional badges anywhere near the work (PRODUCT.md anti-reference).
- **Don't** slip into "cold tech minimalism" — no sans-serif UI voice, no corporate gray-on-gray sterility; the restraint must stay literary (PRODUCT.md anti-reference).
- **Don't** decorate with shadows, cards, or panels; depth only for things that genuinely float (dropdowns, lightbox).
- **Don't** place text over photographs except inside the established scrim overlays.
