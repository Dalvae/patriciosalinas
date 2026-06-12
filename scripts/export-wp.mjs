import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parse, HTMLElement, NodeType } from "node-html-parser";
import { stringify } from "yaml";
import { toString } from "mdast-util-to-string";
import { remark } from "remark";
import directive from "remark-directive";

const LANGS = ["en", "es", "sv"];
const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const DATA_ROOT = join(SRC, "data");
const CONTENT_ROOT = join(SRC, "content");
const PAGES_ROOT = join(CONTENT_ROOT, "pages");
const GALLERY_ROOT = join(CONTENT_ROOT, "gallery");
const PRESS_ROOT = join(CONTENT_ROOT, "press");
const VIDEOS_ROOT = join(CONTENT_ROOT, "videos");
const HOME_ROOT = join(CONTENT_ROOT, "home");

const GALLERY_SLUGS = {
  en: "gallery",
  es: "galeria",
  sv: "galleri",
};

const PRESS_SLUGS = {
  en: "press",
  es: "prensa",
  sv: "pressbevakning",
};

const VIDEO_SLUGS = {
  en: "videos-2",
  es: "videos",
  sv: "videor",
};

const PROJECT_PREFIXES = [
  "/en/projects/",
  "/es/proyectos/",
  "/sv/projekt/",
];

const PUBLICATION_PREFIXES = [
  "/en/publications/",
  "/es/publicaciones/",
  "/sv/publikationer/",
];

const ORDER_MAP = {
  es: [
    "proyectos",
    "galeria",
    "exposiciones",
    "publicaciones",
    "videos",
    "prensa",
    "bio",
  ],
  en: [
    "projects",
    "gallery",
    "exhibitions",
    "publications",
    "videos-2",
    "press",
    "bio-2",
  ],
  sv: [
    "projekt",
    "galleri",
    "utstallningar",
    "publikationer",
    "videor",
    "pressbevakning",
    "bio-3",
  ],
};

const TRANSLATION_KEYS = new Map([
  ["/en/projects/the-night/", "the-night"],
  ["/es/proyectos/la-noche/", "the-night"],
  ["/sv/projekt/natten/", "the-night"],
  ["/en/projects/latin-america/", "latin-america"],
  ["/es/proyectos/latinoamerica/", "latin-america"],
  ["/sv/projekt/latinamerika/", "latin-america"],
  ["/en/gallery/", "gallery"],
  ["/es/galeria/", "gallery"],
  ["/sv/galleri/", "gallery"],
  ["/en/exhibitions/", "exhibitions"],
  ["/es/exposiciones/", "exhibitions"],
  ["/sv/utstallningar/", "exhibitions"],
  ["/en/videos-2/", "videos"],
  ["/es/videos/", "videos"],
  ["/sv/videor/", "videos"],
  ["/en/publications/", "publications"],
  ["/es/publicaciones/", "publications"],
  ["/sv/publikationer/", "publications"],
  ["/en/press/", "press"],
  ["/es/prensa/", "press"],
  ["/sv/pressbevakning/", "press"],
  ["/en/projects/", "projects"],
  ["/es/proyectos/", "projects"],
  ["/sv/projekt/", "projects"],
  ["/en/projects/walter-benjamin/", "walter-benjamin"],
  ["/es/proyectos/walter-benjamin/", "walter-benjamin"],
  ["/sv/projekt/walter-benjamin/", "walter-benjamin"],
  ["/en/projects/atacama-2/", "atacama"],
  ["/es/proyectos/atacama/", "atacama"],
  ["/sv/projekt/atacama/", "atacama"],
  ["/en/projects/barcelona/", "barcelona"],
  ["/es/proyectos/barcelona/", "barcelona"],
  ["/sv/projekt/barcelona/", "barcelona"],
  ["/en/projects/the-others/", "the-others"],
  ["/es/proyectos/los-otros/", "the-others"],
  ["/sv/projekt/de-andra/", "the-others"],
  ["/en/projects/portraits/", "portraits"],
  ["/sv/projekt/forfattare/", "portraits"],
  ["/en/publications/sergio-larrain-visual-poetry-of-a-drifter/", "sergio-larrain"],
  ["/es/publicaciones/sergio-larrain/", "sergio-larrain"],
  ["/en/publications/anders-petersen-2/", "anders-petersen"],
  ["/es/publicaciones/anders-petersen/", "anders-petersen"],
  ["/sv/publikationer/anders-petersen-3/", "anders-petersen"],
  ["/en/publications/the-last-dance/", "the-last-dance"],
  ["/es/publicaciones/el-ultimo-baile/", "the-last-dance"],
  ["/sv/publikationer/den-sista-dansen/", "the-last-dance"],
  ["/en/publications/the-kiss-at-bar-la-concha/", "the-kiss-at-bar-la-concha"],
  ["/es/publicaciones/beso-en-el-bar-la-concha/", "the-kiss-at-bar-la-concha"],
  ["/sv/publikationer/kyssen-pa-bar-la-concha/", "the-kiss-at-bar-la-concha"],
  ["/es/proyectos/observaciones/", "observaciones"],
  ["/es/proyectos/encuentros/", "encuentros"],
  ["/es/bio/", "bio"],
]);

const processor = remark().use(directive);

function cleanDir(dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function writeJsonLike(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content, "utf8");
}

function writeFile(file, content) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content, "utf8");
}

function slugFromUri(uri) {
  const trimmed = uri.replace(/^\/|\/$/g, "");
  const parts = trimmed.split("/").filter(Boolean);
  return parts.at(-1) || "index";
}

function normalizeText(value) {
  return (value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeMarkdownText(value) {
  return normalizeText(value)
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`");
}

function escapeMarkdownTitle(value) {
  return normalizeText(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, " | ");
}

function escapeDirectiveAttr(value) {
  return normalizeText(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/\r?\n/g, " | ");
}

function escapeYamlTitle(value) {
  return normalizeText(value).replace(/\r?\n/g, " | ");
}

function captionFromFigure(figure) {
  const caption = figure.querySelector("figcaption");
  if (!caption) return "";
  return caption.innerHTML
    .replace(/<br\s*\/?>/gi, " | ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*\|\s*$/g, "")
    .trim();
}

function imageInfoFromImg(img, caption = "") {
  return {
    src: img.getAttribute("src") || "",
    alt: img.getAttribute("alt") || "",
    width: Number(img.getAttribute("width") || 0) || undefined,
    height: Number(img.getAttribute("height") || 0) || undefined,
    caption,
  };
}

function columnsFromGallery(gallery) {
  const cls = gallery.getAttribute("class") || "";
  const match = cls.match(/columns-(\d+)/);
  return match ? Number(match[1]) : 3;
}

function isGalleryNode(node) {
  return node.nodeType === NodeType.ELEMENT_NODE
    && (node.getAttribute("class") || "").includes("wp-block-gallery");
}

function isImageNode(node) {
  return node.nodeType === NodeType.ELEMENT_NODE
    && node.tagName === "FIGURE"
    && (node.getAttribute("class") || "").includes("wp-block-image");
}

function isMediaTextNode(node) {
  return node.nodeType === NodeType.ELEMENT_NODE
    && (node.getAttribute("class") || "").includes("wp-block-media-text");
}

function isEmbedNode(node) {
  return node.nodeType === NodeType.ELEMENT_NODE
    && (node.getAttribute("class") || "").includes("wp-block-embed");
}

function unwrapNode(node, options = {}) {
  return convertChildren(node, options);
}

function escapeAttribute(value) {
  return normalizeText(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}

function imageHtml(img, caption = "") {
  const src = img.getAttribute("src") || "";
  const alt = escapeAttribute(img.getAttribute("alt") || "");
  const title = escapeAttribute(caption);
  return `<img src="${src}" alt="${alt}"${title ? ` title="${title}"` : ""} />`;
}

function convertChildren(node, options = {}) {
  return (node.childNodes || [])
    .map((child) => convertNode(child, options))
    .filter(Boolean)
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function convertList(node, options = {}) {
  const tag = node.tagName?.toLowerCase() === "ol" ? "ol" : "ul";
  const items = (node.childNodes || [])
    .filter((child) => child.nodeType === NodeType.ELEMENT_NODE && child.tagName === "LI")
    .map((li) => {
      const body = convertChildren(li, options).replace(/\n/g, " ");
      return `${tag === "ol" ? "1." : "-"} ${body}`;
    });
  return items.join("\n");
}

function convertBlockquote(node, options = {}) {
  return convertChildren(node, options)
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

function imageMarkdown(img, caption = "") {
  const src = img.getAttribute("src") || "";
  const alt = escapeMarkdownText(img.getAttribute("alt") || "");
  const title = escapeMarkdownTitle(caption);
  return `![${alt}](${src} "${title}")`;
}

function convertGallery(gallery, options = {}) {
  const galleryAsHtml = Boolean(options.galleryAsHtml);
  const columns = columnsFromGallery(gallery);
  const imageNodes = (gallery.childNodes || []).filter(isImageNode);
  const images = imageNodes.map((figure) => {
    const img = figure.querySelector("img");
    if (!img) return "";
    const caption = captionFromFigure(figure);
    return galleryAsHtml ? imageHtml(img, caption) : imageMarkdown(img, caption);
  }).filter(Boolean);

  if (images.length === 0) return "";
  if (galleryAsHtml) return images.join("\n\n");
  return `:::gallery{columns=${columns}}\n${images.join("\n")}\n:::`;
}

function convertImage(figure) {
  const img = figure.querySelector("img");
  if (!img) return "";
  const cls = figure.getAttribute("class") || "";
  const caption = captionFromFigure(figure);
  const image = imageHtml(img, caption);
  if (cls.includes("aligncenter")) return `:::center\n${image}\n:::`;
  if (cls.includes("alignright")) return `:::right\n${image}\n:::`;
  return image;
}

function convertMediaText(node, options = {}) {
  const figure = node.querySelector(".wp-block-media-text__media");
  const content = node.querySelector(".wp-block-media-text__content");
  if (!figure || !content) return convertChildren(node, options);
  const img = figure.querySelector("img");
  const link = figure.querySelector("a");
  if (!img) return convertChildren(content, options);
  const text = normalizeText(content.text);
  const src = img.getAttribute("src") || "";
  const alt = img.getAttribute("alt") || "";
  const url = link?.getAttribute("href") || "";
  return `:::press-card{url="${escapeDirectiveAttr(url)}" src="${escapeDirectiveAttr(src)}" alt="${escapeDirectiveAttr(alt)}" text="${escapeDirectiveAttr(text)}"}`;
}

function convertEmbed(node) {
  const iframe = node.querySelector("iframe");
  if (!iframe) return "";
  const src = iframe.getAttribute("src") || "";
  const title = iframe.getAttribute("title") || "";
  const id = youtubeIdFromUrl(src);
  if (!id) return `<iframe src="${src}" title="${title}"></iframe>`;
  return `:::video{id="${id}" title="${escapeDirectiveAttr(title)}"}`;
}

function youtubeIdFromUrl(url) {
  const patterns = [
    /youtube\.com\/embed\/([^?&/]+)/,
    /youtu\.be\/([^?&/]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return "";
}

function convertParagraph(node) {
  const cls = node.getAttribute("class") || "";
  const text = convertInlineChildren(node);
  if (!text) return "";
  if (cls.includes("has-text-align-center")) return `:::center\n${text}\n:::`;
  if (cls.includes("has-text-align-right")) return `:::right\n${text}\n:::`;
  return text;
}

function convertHeading(node) {
  const level = Number(String(node.tagName).replace("H", "")) || 2;
  const text = convertInlineChildren(node);
  return `${"#".repeat(Math.min(6, Math.max(1, level)))} ${text}`;
}

function convertNode(node, options = {}) {
  if (node.nodeType !== NodeType.ELEMENT_NODE) {
    if (node.nodeType === NodeType.TEXT_NODE) return escapeMarkdownText(node.text);
    return "";
  }

  const element = node;
  const cls = element.getAttribute("class") || "";

  if (
    cls.includes("wp-block-columns")
    || cls.includes("wp-block-column")
    || cls.includes("wp-block-group")
    || cls.includes("wp-block-embed__wrapper")
    || cls.includes("wp-block-media-text__media")
    || cls.includes("wp-block-media-text__content")
  ) {
    return unwrapNode(element, options);
  }

  if (isGalleryNode(element)) return convertGallery(element, options);
  if (isImageNode(element)) return convertImage(element);
  if (isMediaTextNode(element)) return convertMediaText(element, options);
  if (isEmbedNode(element)) return convertEmbed(element);

  const tag = element.tagName?.toLowerCase();
  if (tag === "p") return convertParagraph(element);
  if (tag && /^h[1-6]$/.test(tag)) return convertHeading(element);
  if (tag === "ul" || tag === "ol") return convertList(element, options);
  if (tag === "blockquote") return convertBlockquote(element, options);
  if (tag === "hr") return "---";
  if (tag === "br") return "\n";
  if (tag === "em" || tag === "i") return `*${convertInlineChildren(element)}*`;
  if (tag === "strong" || tag === "b") return `**${convertInlineChildren(element)}**`;
  if (tag === "a") {
    const href = element.getAttribute("href") || "";
    const text = convertInlineChildren(element);
    return `[${text}](${href})`;
  }
  if (tag === "code") return `\`${normalizeText(element.text)}\``;

  return convertChildren(element, options);
}

function convertInlineChildren(node) {
  return (node.childNodes || [])
    .map(convertInlineNode)
    .filter(Boolean)
    .join("");
}

function convertInlineNode(node) {
  if (node.nodeType !== NodeType.ELEMENT_NODE) {
    if (node.nodeType === NodeType.TEXT_NODE) return escapeMarkdownText(node.text);
    return "";
  }

  const element = node;
  const tag = element.tagName?.toLowerCase();
  if (tag === "br") return "\n";
  if (tag === "em" || tag === "i") return `*${convertInlineChildren(element)}*`;
  if (tag === "strong" || tag === "b") return `**${convertInlineChildren(element)}**`;
  if (tag === "a") {
    const href = element.getAttribute("href") || "";
    const text = convertInlineChildren(element);
    return `[${text}](${href})`;
  }
  if (tag === "code") return `\`${normalizeText(element.text)}\``;
  if (tag === "img") {
    return imageHtml(element);
  }
  return convertInlineChildren(element);
}

function convertHtmlToMarkdown(html, options = {}) {
  const root = parse(html || "");
  return convertChildren(root, options)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function markdownAst(markdown) {
  return processor.parse(markdown || "");
}

function normalizedMarkdownText(markdown) {
  return normalizeText(toString(markdownAst(markdown)));
}

function imageSequenceFromHtml(html) {
  const root = parse(html || "");
  const images = [];
  const walk = (node) => {
    if (node.nodeType === NodeType.ELEMENT_NODE && node.tagName === "IMG") {
      images.push(node.getAttribute("src") || "");
    }
    (node.childNodes || []).forEach(walk);
  };
  walk(root);
  return images;
}

function imageSequenceFromMarkdown(markdown) {
  const images = [];
  const ast = markdownAst(markdown);
  const walk = (node) => {
    if (node.type === "image") images.push(node.url);
    if (node.type === "containerDirective" && node.name === "press-card" && node.attributes?.src) images.push(node.attributes.src);
    if (node.children) node.children.forEach(walk);
  };
  walk(ast);
  return images;
}

function imageSequenceFromHtmlInMarkdown(markdown) {
  const images = [];
  for (const match of markdown.matchAll(/src="([^"]+)"/g)) {
    images.push(match[1]);
  }
  return images;
}

function captionSequenceFromHtml(html) {
  const root = parse(html || "");
  const captions = [];
  const walk = (node) => {
    if (node.nodeType === NodeType.ELEMENT_NODE && node.tagName === "FIGCAPTION") {
      const caption = normalizeText(node.text);
      if (caption) captions.push(caption);
    }
    (node.childNodes || []).forEach(walk);
  };
  walk(root);
  return captions;
}

function captionSequenceFromMarkdown(markdown) {
  const captions = [];
  const ast = markdownAst(markdown);
  const walk = (node) => {
    if (node.type === "image") {
      const caption = normalizeText((node.title || "").replace(/\s*\|\s*/g, " "));
      if (caption) captions.push(caption);
    }
    if (node.children) node.children.forEach(walk);
  };
  walk(ast);
  return captions;
}

function videoSequenceFromHtml(html) {
  const root = parse(html || "");
  const videos = [];
  const walk = (node) => {
    if (node.nodeType === NodeType.ELEMENT_NODE && node.tagName === "IFRAME") {
      const id = youtubeIdFromUrl(node.getAttribute("src") || "");
      if (id) videos.push({ id, title: normalizeText(node.getAttribute("title") || "") });
    }
    (node.childNodes || []).forEach(walk);
  };
  walk(root);
  return videos;
}

function videoSequenceFromMarkdown(markdown) {
  const videos = [];
  const ast = markdownAst(markdown);
  const walk = (node) => {
    if (node.type === "containerDirective" && node.name === "video") {
      videos.push({
        id: node.attributes?.id || "",
        title: node.attributes?.title || "",
      });
    }
    if (node.children) node.children.forEach(walk);
  };
  walk(ast);
  return videos;
}

function mediaTextSequenceFromHtml(html) {
  const root = parse(html || "");
  const cards = [];
  const walk = (node) => {
    if (node.nodeType === NodeType.ELEMENT_NODE && isMediaTextNode(node)) {
      const figure = node.querySelector(".wp-block-media-text__media");
      const content = node.querySelector(".wp-block-media-text__content");
      const img = figure?.querySelector("img");
      if (img) {
        cards.push({
          url: figure?.querySelector("a")?.getAttribute("href") || "",
          src: img.getAttribute("src") || "",
          alt: img.getAttribute("alt") || "",
          text: normalizeText(content?.text || ""),
        });
      }
    }
    (node.childNodes || []).forEach(walk);
  };
  walk(root);
  return cards;
}

function mediaTextSequenceFromMarkdown(markdown) {
  const cards = [];
  const ast = markdownAst(markdown);
  const walk = (node) => {
    if (node.type === "containerDirective" && node.name === "press-card") {
      cards.push({
        url: node.attributes?.url || "",
        src: node.attributes?.src || "",
        alt: node.attributes?.alt || "",
        text: normalizeText(node.attributes?.text || ""),
      });
    }
    if (node.children) node.children.forEach(walk);
  };
  walk(ast);
  return cards;
}

function assertEqual(label, actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} mismatch\nexpected: ${JSON.stringify(expected)}\nactual:   ${JSON.stringify(actual)}`);
  }
}

function pageTypeFor(page, lang) {
  if (page.isFrontPage) return "home";
  if (page.slug === GALLERY_SLUGS[lang]) return "gallery";
  if (page.slug === PRESS_SLUGS[lang]) return "press";
  if (page.slug === VIDEO_SLUGS[lang]) return "videos";
  if (!page.content) return "hub";
  if (PROJECT_PREFIXES.some((prefix) => page.uri.startsWith(prefix))) return "project";
  if (PUBLICATION_PREFIXES.some((prefix) => page.uri.startsWith(prefix))) return "publication";
  return "page";
}

function translationKeyFor(page) {
  return TRANSLATION_KEYS.get(page.uri) || slugFromUri(page.uri);
}

function orderFor(page, lang, index) {
  const parts = page.uri.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
  const topLevel = parts[1];
  const orderMap = ORDER_MAP[lang];
  const topLevelIndex = topLevel ? orderMap.indexOf(topLevel) : -1;
  if (topLevelIndex >= 0) return topLevelIndex * 1000 + index * 10;
  return 9000 + index * 10;
}

function frontmatter(data) {
  const lines = Object.entries(data).map(([key, value]) => `${key}: ${JSON.stringify(value)}`);
  return `---\n${lines.join("\n")}\n---\n`;
}

function homeParagraphs(page) {
  const root = parse(page.content || "");
  return (root.querySelectorAll("p") || [])
    .map((p) => ({
      html: p.innerHTML.trim(),
      text: normalizeText(p.text),
    }))
    .filter((p) => p.text.length > 0);
}

function splitStatement(paragraph) {
  const sentences = paragraph.html.split(/(?<=\.)\s+(?=[A-ZÅÄÖÉÍ])/);
  if (sentences.length < 3) return { statement: paragraph.text, reflection: "" };
  return {
    statement: normalizeText(sentences.slice(0, 2).join(" ")),
    reflection: normalizeText(sentences.slice(2).join(" ")),
  };
}

function collectImagesFromMarkdown(markdown) {
  const images = [];
  // Markdown AST images (e.g. ![...](...))
  const ast = markdownAst(markdown);
  const walk = (node) => {
    if (node.type === "image") {
      images.push({
        src: node.url,
        alt: node.alt || "",
        caption: node.title || "",
      });
    }
    if (node.children) node.children.forEach(walk);
  };
  walk(ast);
  // Raw HTML <img> tags (non-gallery pages use galleryAsHtml: true)
  for (const match of markdown.matchAll(/<img\s[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*\/?>/g)) {
    images.push({
      src: match[1],
      alt: match[2] || "",
      caption: "",
    });
  }
  return images;
}

function extractGalleryData(markdown) {
  const images = [];
  let columns = 3;
  const ast = markdownAst(markdown);
  const walk = (node) => {
    if (node.type === "containerDirective" && node.name === "gallery") {
      columns = Number(node.attributes?.columns || columns);
    }
    // Images inside ::gallery are nested in paragraph children (remark-directive
    // wraps them). Walk deeply to find all image nodes under the directive.
    if (node.type === "image") {
      images.push({
        src: node.url,
        alt: node.alt || "",
        title: node.title || "",
      });
    }
    if (node.children) node.children.forEach(walk);
  };
  walk(ast);
  return { columns, images };
}

function parseDirectiveAttrs(source) {
  const attrs = {};
  for (const match of source.matchAll(/([A-Za-z0-9_-]+)="([^"]*)"/g)) {
    attrs[match[1]] = match[2]
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&");
  }
  return attrs;
}

function extractPressData(markdown) {
  const links = [];
  const cards = [];
  const ast = markdownAst(markdown);

  const walk = (node) => {
    // Press cards from media-text directives (may be nested in AST)
    if (node.type === "containerDirective" && node.name === "press-card" && node.attributes?.src) {
      cards.push({
        url: node.attributes.url || "",
        image: { src: node.attributes.src, alt: node.attributes.alt || "" },
        text: normalizeText(node.attributes.text || ""),
      });
      // Don't return — continue walking children for nested press-cards
    }
    // Extract markdown links: [text](url)
    if (node.type === "link") {
      const text = normalizeText(node.children?.map((c) => c.value || "").join("") || "");
      if (text && node.url) {
        links.push({ text, url: node.url });
      }
      return;
    }
    if (node.children) node.children.forEach(walk);
  };
  walk(ast);

  return { links, cards };
}

function extractVideosFromPages(pagesByLang) {
  const byId = new Map();
  for (const lang of LANGS) {
    const page = pagesByLang[lang].find((page) => page.slug === VIDEO_SLUGS[lang]);
    for (const video of videoSequenceFromHtml(page.content || "")) {
      const entry = byId.get(video.id) || { id: video.id, title: video.title, titles: {} };
      entry.titles[lang] = video.title;
      if (!entry.title && video.title) entry.title = video.title;
      byId.set(video.id, entry);
    }
  }
  return Array.from(byId.values()).map((entry) => ({
    id: entry.id,
    title: entry.title,
    titles: entry.titles,
  }));
}

function writePageMarkdown(file, data, body) {
  writeFile(file, `${frontmatter(data)}${body ? `\n${body}\n` : "\n"}`);
}

function validatePage(page, markdown) {
  // Text extraction includes image alt/caption text, so image-only/gallery pages
  // naturally differ. Image URLs and captions are validated separately below.
  const textExpected = normalizeText(parse(page.content || "").text);
  const textActual = normalizedMarkdownText(markdown);
  const hasImages = imageSequenceFromHtml(page.content || "").length > 0;
  if (!hasImages && textExpected && textActual && textExpected !== textActual) {
    throw new Error(`Text mismatch for ${page.uri}\nexpected: ${textExpected}\nactual: ${textActual}`);
  }

  const expectedImages = imageSequenceFromHtml(page.content || "");
  const actualImages = markdown.includes("<img")
    ? imageSequenceFromHtmlInMarkdown(markdown)
    : imageSequenceFromMarkdown(markdown);
  if (!markdown.includes("<img")) {
    assertEqual(`image sequence for ${page.uri}`, actualImages, expectedImages);
    assertEqual(`caption sequence for ${page.uri}`, captionSequenceFromMarkdown(markdown), captionSequenceFromHtml(page.content || ""));
  }
  assertEqual(`video sequence for ${page.uri}`, videoSequenceFromMarkdown(markdown), videoSequenceFromHtml(page.content || ""));
  assertEqual(`press-card sequence for ${page.uri}`, mediaTextSequenceFromMarkdown(markdown), mediaTextSequenceFromHtml(page.content || ""));
}

function main() {
  cleanDir(PAGES_ROOT);
  cleanDir(PRESS_ROOT);
  cleanDir(VIDEOS_ROOT);
  cleanDir(HOME_ROOT);

  const pagesByLang = {};
  const projectImagesByKey = {};
  const galleryData = {};
  const pressData = {};
  const homeData = {};
  const videos = [];

  for (const lang of LANGS) {
    const file = join(DATA_ROOT, `${lang}-content.json`);
    const pages = JSON.parse(readFileSync(file, "utf8")).data.pages.nodes;
    pagesByLang[lang] = pages;

    for (const [index, page] of pages.entries()) {
      const type = pageTypeFor(page, lang);
      const key = translationKeyFor(page);
      const markdownForData = type === "gallery"
        ? convertHtmlToMarkdown(page.content || "")
        : convertHtmlToMarkdown(page.content || "", { galleryAsHtml: true });
      const markdown = ["gallery", "press", "videos"].includes(type) ? "" : markdownForData;
      const images = ["home", "gallery", "press", "videos"].includes(type) ? [] : collectImagesFromMarkdown(markdownForData);

      if (type === "project" || type === "publication") {
        projectImagesByKey[key] = images.map((image) => image.src);
      }

      if (type === "gallery") {
        galleryData[lang] = extractGalleryData(markdownForData);
      }

      if (type === "press") {
        pressData[lang] = extractPressData(markdownForData);
      }

      if (type === "home") {
        const paragraphs = homeParagraphs(page);
        const intro = splitStatement(paragraphs[0] || { html: "", text: "" });
        const walterKey = "walter-benjamin";
        const atacamaKey = "atacama";
        homeData[lang] = {
          statement: intro.statement,
          reflection: intro.reflection,
          spreads: [
            {
              project: walterKey,
              paragraph: normalizeText(paragraphs[1]?.text || ""),
              images: projectImagesByKey[walterKey]?.slice(0, 4) || [],
            },
            {
              project: atacamaKey,
              paragraph: normalizeText(paragraphs[2]?.text || ""),
              images: projectImagesByKey[atacamaKey]?.slice(0, 4) || [],
            },
          ],
          closing: paragraphs.slice(3).map((paragraph) => paragraph.text),
        };
      }

      if (type !== "home") {
        validatePage(page, markdownForData);
      }

      const data = {
        title: page.title,
        uri: page.uri,
        lang,
        type,
        translationKey: key,
        order: orderFor(page, lang, index),
        images,
      };

      writePageMarkdown(join(PAGES_ROOT, lang, `${slugFromUri(page.uri)}.md`), data, markdown || " ");
    }
  }

  videos.push(...extractVideosFromPages(pagesByLang));

  // Unified gallery — single YAML with i18n alt/title, per-language columns.
  // Merges images from all languages into one set keyed by src.
  const galleryBySrc = new Map();
  for (const lang of LANGS) {
    for (const img of galleryData[lang]?.images || []) {
      const entry = galleryBySrc.get(img.src) || {
        src: img.src,
        alt: {},
        title: {},
      };
      if (img.alt) entry.alt[lang] = img.alt;
      if (img.title) entry.title[lang] = img.title;
      galleryBySrc.set(img.src, entry);
    }
  }
  const galleryImages = Array.from(galleryBySrc.values());

  const galleryYaml = {
    images: galleryImages,
    en: { columns: galleryData.en?.columns || 3 },
    es: { columns: galleryData.es?.columns || 3 },
    sv: { columns: galleryData.sv?.columns || 3 },
  };

  writeFile(join(CONTENT_ROOT, "gallery.yaml"), stringify(galleryYaml));

  for (const lang of LANGS) {
    writeFile(join(PRESS_ROOT, `${lang}.yaml`), stringify({
      links: pressData[lang]?.links || [],
      cards: pressData[lang]?.cards || [],
    }));

    writeFile(join(HOME_ROOT, `${lang}.yaml`), stringify(homeData[lang]));
  }

  writeFile(join(VIDEOS_ROOT, "videos.yaml"), stringify({ videos }));

  console.log(`Exported ${LANGS.reduce((sum, lang) => sum + pagesByLang[lang].length, 0)} pages to ${CONTENT_ROOT}`);
  console.log(`Exported ${videos.length} shared videos to ${VIDEOS_ROOT}/videos.yaml`);
}

main();
