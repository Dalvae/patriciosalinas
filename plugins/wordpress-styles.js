const plugin = require("tailwindcss/plugin");

module.exports = plugin(
  function ({ addComponents }) {
    addComponents({
      ".wp-blocks": {
        "overflow-x-hidden": { "overflow-x-hidden": {} },
        a: {
          "text-wp-blue relative": {},
        },
        "h1, h2, h3, h4, h5, h6": {
          "mt-16": {},
        },
        h1: {
          "text-4xl leading-none": {},
        },
        h2: {
          "text-3xl leading-snug": {},
        },
        h3: {
          "text-2xl leading-normal": {},
        },
        h4: {
          "text-xl leading-normal": {},
        },
        h5: {
          "text-lg leading-normal": {},
        },
        h6: {
          "font-bold leading-normal": {},
        },
        ".wp-block-image": {
          "block mt-6": {},
        },
        ".aligncenter img": {
          "mx-auto": {},
        },
        ".alignright": {
          "float-right": {},
        },
        ".alignleft": {
          "float-left": {},
        },
        ".is-style-circle-mask figure img": {
          "rounded-full": {},
        },
        ".is-layout-constrained > *": {
          "mt-[1.2rem]": {},
        },

        p: {
          "mt-6 text-lg leading-relaxed": {},
        },
        // Aumentamos la especificidad para estas clases
        ".wp-blocks .has-text-align-center": {
          "text-center important": {},
        },
        ".wp-blocks .has-text-align-right": {
          "text-right important": {},
        },
        ".wp-blocks .has-text-align-left": {
          "text-left important": {},
        },
        ".has-drop-cap::first-letter": {
          "font-serif text-wp-blue float-left text-6xl pt-1 pr-2 pl-1": {},
        },
        ".has-small-font-size": {
          "text-sm": {},
        },
        ".has-normal-font-size": {
          "text-base": {},
        },
        ".has-medium-font-size": {
          "text-lg": {},
        },
        ".has-large-font-size": {
          "text-3xl": {},
        },
        ".has-huge-font-size": {
          "text-4xl": {},
        },
        "hr.wp-block-separator": {
          "my-6 border-wp-pink": {},
          "&:not(.is-style-wide)": {
            "max-w-xs mx-auto": {},
          },
          "&.is-style-dots": {
            "border-0 max-w-none leading-none h-auto text-center": {},
            "&::before": {
              "font-serif text-wp-pink text-2xl": {},
              content: '"\\00b7 \\00b7 \\00b7"',
              letterSpacing: "2em",
              paddingLeft: "2em",
            },
          },
        },
        blockquote: {
          "mt-8 mb-8 px-8 border-l-2 border-wp-yellow flex flex-col justify-center":
            {},
          p: {
            "italic m-auto": {},
          },
          cite: {
            "text-sm text-gray-700 block mt-6": {},
          },
          "&.is-style-large": {
            "border-none relative": {},
            p: {
              "text-2xl": {},
            },
            "p::before": {
              content: '"❝"',
              "text-teal-600 absolute text-8xl -top-4 -left-4": {},
            },
          },
          "@screen md": {
            "mt-12 mb-12 px-12": {},
          },
          "&.has-text-align-center": {
            "text-center": {},
          },
        },
        "& > ol, & > ul": {
          "mt-6": {},
        },
        "ol, ul": {
          "list-inside pl-8 leading-8": {},
          "li::marker": {
            "font-medium": {},
          },
        },
        ol: {
          "list-decimal": {},
        },
        ul: {
          "list-disc": {},
          "li > ul": {
            "list-circle": {},
          },
        },
      },
    });
  },
  {
    theme: {
      extend: {
        colors: {
          wp: {
            blue: "#0073aa",
            pink: "#d63638",
            yellow: "#dba617",
          },
        },
      },
    },
  }
);
