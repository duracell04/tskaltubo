"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { LOCALES, type Locale } from "@/lib/constants";
import { copy } from "@/lib/copy";
import { propertyCopy } from "@/lib/property-copy";
export function Navigation({ locale }: { locale: Locale }) {
  const c = propertyCopy(locale), legacy = copy(locale);
  const pathname = usePathname();
  const current = pathname.replace(/\/$/, "");
  const suffix = pathname.replace(/^\/(de|en|ka)(?=\/|$)/, "");
  const router = useRouter();
  const menu = useRef<HTMLDetailsElement>(null);
  const sections = ["sanatoriums", "news", "project", "sources"] as const;
  function active(section: typeof sections[number]) {
    const tail = current.replace(/^\/(de|en|ka)/, "");
    if (section === "sanatoriums") return tail === "" || tail.startsWith("/sanatoriums");
    if (section === "project") return ["/project", "/scenarios", "/compare", "/finance", "/report", "/methodology", "/evidence"].includes(tail);
    return tail === `/${section}`;
  }
  const links = sections.map(section => <Link key={section} href={`/${locale}/${section}/`} aria-current={active(section) ? "page" : undefined} onClick={() => { if (menu.current) menu.current.open = false; }}>{c[section]}</Link>);
  return <>
    <div className="mobile-navigation"><Link className="mobile-brand" href={`/${locale}/`}>Tskaltubo</Link>
      <label className="mobile-language"><span className="sr-only">{legacy.language}</span><select value={locale} onChange={e => router.push(`/${e.target.value}${suffix}${window.location.search}${window.location.hash}`)}>{LOCALES.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}</select></label>
      <details className="mobile-menu" key={pathname} ref={menu}><summary>{legacy.menu}</summary><nav aria-label={legacy.menu}>{links}</nav></details>
    </div>
    <div className="desktop-navigation"><div className="navigation-row"><nav className="main-navigation" aria-label={legacy.menu}>{links}</nav><nav className="language-navigation" aria-label={legacy.language}>{LOCALES.map(l => <Link key={l} href={`/${l}${suffix}`} hrefLang={l} lang={l} aria-current={l === locale ? "true" : undefined} onClick={event => { event.preventDefault(); router.push(`/${l}${suffix}${window.location.search}${window.location.hash}`); }}>{l.toUpperCase()}</Link>)}</nav></div></div>
  </>;
}
