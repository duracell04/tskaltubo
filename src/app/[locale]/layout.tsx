import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { LOCALES } from "@/lib/constants";
import {
  getDictionary,
  requireLocale,
  type LocalePageProps,
} from "@/lib/locale";
import { copy as memoCopy } from "@/lib/copy";
import { projectName } from "@/lib/research-data";
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const copy = getDictionary(requireLocale((await params).locale));
  return { title: projectName, description: copy.siteDescription };
}

export default async function LocaleLayout({
  children,
  params,
}: LocalePageProps & { children: ReactNode }) {
  const locale = requireLocale((await params).locale);
  const copy = getDictionary(locale);
  const c = memoCopy(locale);
  return (
    <div lang={locale} className="site-shell">
      <a className="skip-link" href="#main-content">
        {copy.skipToContent}
      </a>
      <Header locale={locale} />
      <main id="main-content" tabIndex={-1} className="container main-content">
        {locale !== "en" ? (
          <aside className="translation-notice">{c.original}</aside>
        ) : null}
        {children}
      </main>
      <footer className="site-footer">
        <div className="container">
          <p>{c.footer}</p>
          <a href={`/${locale}/methodology`}>{c.methodology}</a>
          <span> · </span>
          <a href="/data/research.json" download>
            Export public data
          </a>
        </div>
      </footer>
    </div>
  );
}
