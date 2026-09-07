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
import { propertyCopy } from "@/lib/property-copy";
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
          <details className="translation-notice"><summary>{propertyCopy(locale).translationSummary}</summary>{propertyCopy(locale).translation}</details>
        ) : null}
        {children}
      </main>
      <footer className="site-footer">
        <div className="container">
            <p>{propertyCopy(locale).footer}</p>
          <a href={`/${locale}/methodology`}>{c.methodology}</a>
          <span> · </span>
          <a href="/data/research.json" download>
            {propertyCopy(locale).historicalLibrary} · JSON
          </a>
        </div>
      </footer>
    </div>
  );
}
