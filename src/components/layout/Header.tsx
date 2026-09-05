import Link from "next/link";
import type { Locale } from "@/lib/constants";
import { getDictionary } from "@/lib/locale";
import { Navigation } from "./Navigation";

export function Header({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale);
  return (
    <header className="site-header">
      <div className="container">
        <Link className="brand" href={`/${locale}`} lang="en">{copy.siteName}</Link>
        <Navigation locale={locale} labels={copy.nav} navigationLabel={copy.navigationLabel} languageLabel={copy.languageLabel} />
      </div>
    </header>
  );
}
