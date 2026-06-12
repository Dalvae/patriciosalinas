import { defineConfig, passthroughImageService } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import directive from "remark-directive";
import rehypeStripImages from "./src/lib/rehype-strip-images.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://www.patriciosalinas.com",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ["**/.omc/**", "**/.playwright-cli/**", "**/.impeccable/**"],
      },
    },
  },
  markdown: {
    remarkPlugins: [directive],
    rehypePlugins: [rehypeStripImages],
  },
  adapter: vercel(),
  image: {
    service: passthroughImageService(),
    domains: ["res.cloudinary.com"],
    remotePatterns: [{ protocol: "https" }],
  },
  i18n: {
    defaultLocale: "en",
    locales: ["es", "en", "sv"],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
