import type { Dict } from "./en";
import type { Lang } from "./index";

/* One file per language, fetched when it is wanted: a visitor downloads the
   words of the language they read and no others. */
const loaders: Record<Lang, () => Promise<{ default: Dict }>> = {
  es: () => import("./es"),
  en: () => import("./en"),
  de: () => import("./de"),
  pt: () => import("./pt"),
};

export async function loadDict(lang: Lang): Promise<Dict> {
  return (await loaders[lang]()).default;
}
