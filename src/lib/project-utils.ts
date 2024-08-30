import type { Lang } from "../types/types";

export const projectPageSlugs: Record<Lang, string> = {
  es: "proyectos",
  en: "projects",
  sv: "projekt",
};

export function getProjectPageSlug(lang: Lang): string {
  return projectPageSlugs[lang];
}
