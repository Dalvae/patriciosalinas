import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const httpsUrl = z.string().url().regex(/^https:\/\//);

const i18nField = z.object({
  en: z.string(),
  es: z.string(),
  sv: z.string(),
});

const imageSchema = z.object({
  src: httpsUrl,
  alt: z.string(),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const imageWithOptionalAltSchema = imageSchema.extend({
  alt: z.string().optional(),
});

const pages = defineCollection({
  loader: glob({
    base: "./src/content/pages",
    pattern: "**/*.md",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    uri: z.string().regex(/^\/$|^\/(en|es|sv)(\/.*)?\/$/),
    lang: z.enum(["en", "es", "sv"]),
    type: z.enum(["project", "publication", "page", "hub", "home", "gallery", "press", "videos"]),
    translationKey: z.string(),
    order: z.number(),
    images: z.array(imageSchema).default([]),
  }),
});

const galleryImageSchema = z.object({
  src: httpsUrl,
  alt: i18nField,
  title: i18nField,
  width: z.number().optional(),
  height: z.number().optional(),
});

const gallery = defineCollection({
  loader: glob({ base: "./src/content", pattern: "gallery.yaml" }),
  schema: z.object({
    images: z.array(galleryImageSchema),
    en: z.object({ columns: z.number() }).optional(),
    es: z.object({ columns: z.number() }).optional(),
    sv: z.object({ columns: z.number() }).optional(),
  }),
});

const press = defineCollection({
  loader: glob({ base: "./src/content/press", pattern: "**/*.yaml" }),
  schema: z.object({
    links: z.array(z.object({
      text: z.string(),
      url: z.string().url(),
    })).default([]),
    cards: z.array(z.object({
      url: z.string().url().optional(),
      image: z.object({
        src: httpsUrl,
        alt: z.string(),
      }),
      text: z.string(),
    })).default([]),
  }),
});

const videos = defineCollection({
  loader: glob({ base: "./src/content/videos", pattern: "**/*.yaml" }),
  schema: z.object({
    videos: z.array(z.object({
      id: z.string(),
      title: z.string(),
      titles: z.record(z.string()).default({}),
    })),
  }),
});

const home = defineCollection({
  loader: glob({ base: "./src/content/home", pattern: "**/*.yaml" }),
  schema: z.object({
    statement: z.string(),
    reflection: z.string().default(""),
    spreads: z.array(z.object({
      project: reference("pages"),
      paragraph: z.string(),
      images: z.array(imageWithOptionalAltSchema).default([]),
    })),
    closing: z.array(z.string()).default([]),
  }),
});

export const collections = {
  pages,
  gallery,
  press,
  videos,
  home,
};
