"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, SECTIONS, type Locale, type Section } from "@/lib/constants";

interface NavigationProps {
  locale: Locale;
  labels: Record<Section, string>;
  navigationLabel: string;
  languageLabel: string;
}

export function Navigation({ locale, labels, navigationLabel, languageLabel }: NavigationProps) {
  const pathname = usePathname();
  const suffix = pathname.replace(/^\/(de|en|ka)(?=\/|$)/, "");

  return (
    <div className="navigation-row">
      <nav aria-label={navigationLabel} className="main-navigation">
        {SECTIONS.map(({ key, path }) => {
          const href = `/${locale}${path}`;
          const active = path === "" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return <Link key={key} href={href} aria-current={active ? "page" : undefined}>{labels[key]}</Link>;
        })}
      </nav>
      <nav aria-label={languageLabel} className="language-navigation">
        {LOCALES.map((target) => (
          <Link key={target} href={`/${target}${suffix}`} hrefLang={target} lang={target} aria-current={target === locale ? "true" : undefined}>
            {target.toUpperCase()}
          </Link>
        ))}
      </nav>
    </div>
  );
}
