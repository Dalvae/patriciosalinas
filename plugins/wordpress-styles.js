const plugin = require("tailwindcss/plugin");

module.exports = plugin(
  function ({ addComponents, matchComponents }) {
    // Estilos estáticos usando addComponents
    addComponents({
      ".wp-blocks": {
        overflowX: "hidden",
        a: {
          color: "var(--wp-blue)",
          position: "relative",
        },
        "h1, h2, h3, h4, h5, h6": {
          marginTop: "4rem",
        },
        h1: {
          fontSize: "2.25rem",
          lineHeight: "1",
        },
        h2: {
          fontSize: "1.875rem",
          lineHeight: "1.25",
        },
        h3: {
          fontSize: "1.5rem",
          lineHeight: "1.5",
        },
        h4: {
          fontSize: "1.25rem",
          lineHeight: "1.5",
        },
        h5: {
          fontSize: "1.125rem",
          lineHeight: "1.5",
        },
        h6: {
          fontWeight: "bold",
          lineHeight: "1.5",
        },
        ".wp-block-image": {
          display: "block",
          marginTop: "1.5rem",
        },
        ".aligncenter img": {
          marginLeft: "auto",
          marginRight: "auto",
        },
        ".alignright": {
          float: "right",
        },
        ".alignleft": {
          float: "left",
        },
        ".is-style-circle-mask figure img": {
          borderRadius: "9999px",
        },
        ".is-layout-constrained > *": {
          marginTop: "1.2rem",
        },
        ".is-layout-flex": {
          display: "flex",
        },
        p: {
          marginTop: "1.5rem",
          fontSize: "1.125rem",
          lineHeight: "1.75",
        },
        ".has-text-align-center": {
          textAlign: "center !important",
        },
        ".has-text-align-right": {
          textAlign: "right !important",
        },
        ".has-text-align-left": {
          textAlign: "left !important",
        },
        ".has-drop-cap::first-letter": {
          fontFamily: "serif",
          color: "var(--wp-blue)",
          float: "left",
          fontSize: "3.75rem",
          paddingTop: "0.25rem",
          paddingRight: "0.5rem",
          paddingLeft: "0.25rem",
        },
        ".has-small-font-size": {
          fontSize: "0.875rem",
        },
        ".has-normal-font-size": {
          fontSize: "1rem",
        },
        ".has-medium-font-size": {
          fontSize: "1.125rem",
        },
        ".has-large-font-size": {
          fontSize: "1.875rem",
        },
        ".has-huge-font-size": {
          fontSize: "2.25rem",
        },
        // Nuevos estilos agregados
        ".is-content-justification-center": {
          justifyContent: "center",
        },
        ".is-nowrap": {
          whiteSpace: "nowrap",
        },
        ".is-layout-flex": {
          display: "flex",
        },
        ".wp-block-group": {
          display: "block",
        },
        "wp-block-group-is-layout-flex": {
          display: "flex",
        },
        ".columns-default": {
          // Estilos para columnas por defecto
          "& > *": {
            width: "100%",
            "@screen sm": {
              width: "50%",
            },
            "@screen md": {
              width: "33.333%",
            },
          },
        },

        ".is-cropped": {
          "& img": {
            height: "100%",
            flexGrow: "1",
            objectFit: "cover",
          },
        },

        ".wp-block-gallery-is-layout-flex": {
          display: "flex",
          flexWrap: "wrap",
        },
        "hr.wp-block-separator": {
          margin: "1.5rem 0",
          borderColor: "var(--wp-pink)",
          "&:not(.is-style-wide)": {
            maxWidth: "16rem",
            marginLeft: "auto",
            marginRight: "auto",
          },
          "&.is-style-dots": {
            border: "none",
            maxWidth: "none",
            lineHeight: "1",
            height: "auto",
            textAlign: "center",
            "&::before": {
              fontFamily: "serif",
              color: "var(--wp-pink)",
              fontSize: "1.5rem",
              content: '"\\00b7 \\00b7 \\00b7"',
              letterSpacing: "2em",
              paddingLeft: "2em",
            },
          },
        },
        blockquote: {
          marginTop: "2rem",
          marginBottom: "2rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
          borderLeftWidth: "2px",
          borderColor: "var(--wp-yellow)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: {
            fontStyle: "italic",
            margin: "auto",
          },
          cite: {
            fontSize: "0.875rem",
            color: "#4a5568",
            display: "block",
            marginTop: "1.5rem",
          },
          "&.is-style-large": {
            border: "none",
            position: "relative",
            p: {
              fontSize: "1.5rem",
            },
            "p::before": {
              content: '"❝"',
              color: "#319795",
              position: "absolute",
              fontSize: "6rem",
              top: "-1rem",
              left: "-1rem",
            },
          },
          "@screen md": {
            marginTop: "3rem",
            marginBottom: "3rem",
            paddingLeft: "3rem",
            paddingRight: "3rem",
          },
          "&.has-text-align-center": {
            textAlign: "center",
          },
        },
        "& > ol, & > ul": {
          marginTop: "1.5rem",
        },
        "ol, ul": {
          listStylePosition: "inside",
          paddingLeft: "2rem",
          lineHeight: "2rem",
          "li::marker": {
            fontWeight: "500",
          },
        },
        ol: {
          listStyleType: "decimal",
        },
        ul: {
          listStyleType: "disc",
          "li > ul": {
            listStyleType: "circle",
          },
        },
      },
      // Nuevos estilos agregados
      ".is-content-justification-center": {
        justifyContent: "center",
      },
      ".is-nowrap": {
        whiteSpace: "nowrap",
      },
      ".is-layout-flex": {
        display: "flex",
      },
      ".wp-block-group": {
        display: "block",
      },
      "wp-block-group-is-layout-flex": {
        display: "flex",
      },
      ".columns-default": {
        // Estilos para columnas por defecto
        "& > *": {
          width: "100%",
          "@screen sm": {
            width: "50%",
          },
          "@screen md": {
            width: "33.333%",
          },
        },
      },

      ".is-cropped": {
        "& img": {
          height: "100%",
          flexGrow: "1",
          objectFit: "cover",
        },
      },

      ".wp-block-gallery-is-layout-flex": {
        display: "flex",
        flexWrap: "wrap",
      },
    });

    // Componentes dinámicos usando matchComponents
    matchComponents(
      {
        "wp-block-gallery": (value) => ({
          display: "flex",
          flexWrap: "wrap",
          listStyle: "none",
          margin: "0 -0.5rem",
          ...(value === "aligncenter" && {
            justifyContent: "center",
          }),
          ...(value === "has-nested-images" && {
            margin: "0",
          }),
        }),
        "wp-block-image": () => ({
          position: "relative",
          overflow: "hidden",
          "& img": {
            width: "100%",
            height: "auto",
          },
        }),
        "wp-lightbox-container": () => ({
          position: "relative",
        }),
        "lightbox-trigger": () => ({
          position: "absolute",
          top: "1rem",
          right: "1rem",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: "0.5rem",
          borderRadius: "9999px",
          "& svg": {
            width: "1rem",
            height: "1rem",
          },
        }),
      },
      {
        values: {
          DEFAULT: "",
          aligncenter: "aligncenter",
          "has-nested-images": "has-nested-images",
        },
      }
    );

    matchComponents(
      {
        columns: (value) => ({
          "& > .wp-block-image": {
            width: "100%",
            "@screen sm": {
              width: value === "3" ? "50%" : "100%",
            },
            "@screen md": {
              width: `${100 / parseInt(value, 10)}%`,
            },
            padding: "0.5rem",
          },
        }),
      },
      {
        values: {
          2: "2",
          3: "3",
          4: "4",
          // Añade más valores según sea necesario
        },
      }
    );
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
