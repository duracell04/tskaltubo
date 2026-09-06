"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/constants";
import { copy } from "@/lib/copy";

interface NavigationProps {
  locale: Locale;
}

export function Navigation({ locale }: NavigationProps) {
  const c = copy(locale);
  const sections = [
    ["overview", ""],
    ["scenarios", "/scenarios"],
    ["sanatoriums", "/sanatoriums"],
    ["finance", "/finance"],
    ["diligence", "/diligence"],
    ["evidence", "/evidence"],
    ["report", "/report"],
    ["workspace", "/workspace"],
  ] as const;
  const pathname = usePathname();
  const suffix = pathname.replace(/^\/(de|en|ka)(?=\/|$)/, "");

  return (
    <div className="navigation-row">
      <nav aria-label="Main navigation" className="main-navigation">
        {sections.map(([key, path]) => {
          const href = `/${locale}${path}`;
          const active =
            path === ""
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={key}
              href={href}
              aria-current={active ? "page" : undefined}
            >
              {c[key]}
            </Link>
          );
        })}
      </nav>
      <nav aria-label="Language" className="language-navigation">
        {LOCALES.map((target) => (
          <Link
            key={target}
            href={`/${target}${suffix}`}
            hrefLang={target}
            lang={target}
            aria-current={target === locale ? "true" : undefined}
          >
            {target.toUpperCase()}
          </Link>
        ))}
      </nav>
    </div>
  );
}
