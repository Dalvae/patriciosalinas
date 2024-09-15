import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  output: "hybrid",
  adapter: vercel({
    isr: {
      routes: [
        { route: "/es/blog/*", revalidate: 120 },
        { route: "/en/blog/*", revalidate: 120 },
        { route: "/sv/blog/*", revalidate: 120 },
      ],
    },
  }),
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
