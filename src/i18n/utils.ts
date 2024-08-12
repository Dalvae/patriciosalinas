import { ui, defaultLang } from "./ui";
import type { Lang } from "../types/types";

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split("/");
  if (lang === "en" || lang === "es" || lang === "sv") {
    return lang;
  }
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    // Si el idioma no está en ui, usa el idioma por defecto
    const uiLang = lang in ui ? lang : defaultLang;
    return ui[uiLang][key] || ui[defaultLang][key];
  };
}
