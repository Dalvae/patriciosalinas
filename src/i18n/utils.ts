import { ui, defaultLang } from "./ui";

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    // Si el idioma no está en ui, usa el idioma por defecto
    const uiLang = lang in ui ? lang : defaultLang;
    return ui[uiLang][key] || ui[defaultLang][key];
  };
}
