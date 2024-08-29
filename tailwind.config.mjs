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
          600: 111111,
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    // require("./plugins/wordpress-styles"),
  ],
};
