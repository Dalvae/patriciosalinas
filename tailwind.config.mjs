/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./node_modules/@wordpress/block-library/build-style/*.css",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['"Playfair Display"', "serif"],
        "playfair-italic": ['"Playfair Display Italic"', "serif"],
        "abril-fatface": ['"Abril Fatface"', "serif"],
      },
      colors: {
        primary: {
          600: "#111111",
        },
        gold: "#d4af37",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": theme("colors.black"),
            "--tw-prose-headings": theme("colors.black"),
            "--tw-prose-links": theme("colors.gray.900"),
            "& *::selection": {
              backgroundColor: theme("colors.gold"),
              color: theme("colors.white"),
            },
            "& *::-moz-selection": {
              backgroundColor: theme("colors.gold"),
              color: theme("colors.white"),
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
