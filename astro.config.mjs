import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  integrations: [tailwind()],
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
  i18n: {
    defaultLocale: "en",
    locales: ["es", "en", "sv"],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
