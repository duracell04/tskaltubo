"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { LOCALES, type Locale } from "@/lib/constants";
import { copy } from "@/lib/copy";

interface NavigationProps {
  locale: Locale;
}

export function Navigation({ locale }: NavigationProps) {
  const c = copy(locale);
  const sections = [
    ["overview", ""],
    ["sanatoriums", "/sanatoriums"],
    ["scenarios", "/scenarios"],
    ["finance", "/finance"],
  ] as const;
  const pathname = usePathname();
  const router = useRouter();
  const suffix = pathname.replace(/^\/(de|en|ka)(?=\/|$)/, "");
  const menu = useRef<HTMLDetailsElement>(null);
  const referenceSections = [
    ["evidence", "/evidence"],
    ["report", "/report"],
    ["methodology", "/methodology"],
  ] as const;
  const currentPath = pathname.replace(/\/$/, "");

  return (
    <>
      <div className="mobile-navigation">
        <Link className="mobile-brand" href={`/${locale}/`} lang="en">
          Tskaltubo
        </Link>
        <label className="mobile-language">
          <span className="sr-only">{c.language}</span>
          <select
            value={locale}
            onChange={(event) => {
              router.push(
                `/${event.target.value}${suffix}${window.location.search}${window.location.hash}`,
              );
            }}
          >
            {LOCALES.map((target) => (
              <option key={target} value={target} lang={target}>
                {target.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <details className="mobile-menu" ref={menu} key={pathname}>
          <summary>{c.menu}</summary>
          <nav aria-label={c.menu}>
            {[...sections, ...referenceSections].map(([key, path]) => {
              const href = `/${locale}${path}`;
              const active =
                currentPath === href ||
                (path !== "" && currentPath.startsWith(`${href}/`));
              return (
                <Link
                  key={key}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => {
                    if (menu.current) menu.current.open = false;
                  }}
                >
                  {c[key]}
                </Link>
              );
            })}
          </nav>
        </details>
      </div>
      <div className="desktop-navigation">
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
        <nav aria-label="Research navigation" className="secondary-navigation">
          {referenceSections.map(([key, path]) => (
            <Link key={key} href={`/${locale}${path}`}>
              {c[key]}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
