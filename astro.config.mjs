import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [tailwind()],
  output: "hybrid",
  i18n: {
    defaultLocale: "en",
    locales: ["es", "en", "sv"],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
