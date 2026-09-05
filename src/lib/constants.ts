export const LOCALES = ["de", "en", "ka"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";

export const SECTIONS = [
  { key: "home", path: "" },
  { key: "sanatoriums", path: "/sanatoriums" },
  { key: "compare", path: "/compare" },
  { key: "scenarios", path: "/scenarios" },
  { key: "methodology", path: "/methodology" },
] as const;
export type Section = (typeof SECTIONS)[number]["key"];
