export const languages = {
  en: "English",
  es: "Español",
  sv: "Svenska",
};

export const defaultLang = "en" as const;

export const ui = {
  en: {
    "error.loading":
      "There was a problem loading the content. Please try reloading the page.",
    "error.noHomePage": "No home page found. Please check your settings.",
    "home.latestPosts": "Latest blog posts",
    "nav.home": "Home",
    "nav.about": "About",
    "nav.projects": "Projects",
    "nav.blog": "Blog",
    "nav.subtitle": "Photography, essays and visual thinking",
    "footer.copyright": "Patricio Salinas A All rights reserved.",
    "footer.createdBy": "Dev by",
  },
  es: {
    "error.loading":
      "Hubo un problema al cargar el contenido. Por favor, intenta recargar la página.",
    "error.noHomePage":
      "No se encontró la página de inicio. Por favor, revisa tus configuraciones.",
    "home.latestPosts": "Últimas entradas del blog",
    "nav.home": "Inicio",
    "nav.about": "Acerca de",
    "nav.projects": "Proyectos",
    "nav.blog": "Blog",
    "nav.subtitle": "Fotografía, ensayos y pensamiento visual",
    "footer.copyright": "Patricio Salinas A Todos los derechos reservados.",
    "footer.createdBy": "Desarrollado por",
  },
  sv: {
    "error.loading":
      "Det uppstod ett problem vid inläsning av innehållet. Försök att ladda om sidan.",
    "error.noHomePage":
      "Ingen startsida hittades. Kontrollera dina inställningar.",
    "home.latestPosts": "Senaste blogginlägg",
    "nav.home": "Hem",
    "nav.about": "Om",
    "nav.projects": "Projekt",
    "nav.blog": "Blogg",
    "nav.subtitle": "Fotografi, essäer och visuellt tänkande",
    "footer.copyright": "Patricio Salinas A Alla rättigheter förbehållna.",
    "footer.createdBy": "Utvecklad av",
  },
} as const;
