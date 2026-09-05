import { notFound } from "next/navigation";
import { de } from "@/data/translations/de";
import { en } from "@/data/translations/en";
import { ka } from "@/data/translations/ka";
import type { Dictionary } from "@/data/translations/schema";
import { LOCALES, type Locale } from "./constants";

export type LocalePageProps = { params: Promise<{ locale: string }> };

export function isLocale(value: string): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

export function requireLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}

const dictionaries: Record<Locale, Dictionary> = { de, en, ka };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
