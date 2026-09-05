import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { LOCALES } from "@/lib/constants";
import { getDictionary, requireLocale, type LocalePageProps } from "@/lib/locale";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const copy = getDictionary(requireLocale((await params).locale));
  return { title: copy.siteName, description: copy.siteDescription };
}

export default async function LocaleLayout({ children, params }: LocalePageProps & { children: ReactNode }) {
  const locale = requireLocale((await params).locale);
  const copy = getDictionary(locale);
  return (
    <div lang={locale} className="site-shell">
      <a className="skip-link" href="#main-content">{copy.skipToContent}</a>
      <Header locale={locale} />
      <main id="main-content" tabIndex={-1} className="container main-content">
        {copy.translationNotice ? <aside className="translation-notice">{copy.translationNotice}</aside> : null}
        {children}
      </main>
      <footer className="site-footer"><div className="container"><p>{copy.footer}</p></div></footer>
    </div>
  );
}
