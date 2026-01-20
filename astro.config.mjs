import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: vercel(),
  image: {
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
