import Link from "next/link";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { getDictionary, requireLocale, type LocalePageProps } from "@/lib/locale";

export default async function HomePage({ params }: LocalePageProps) {
  const locale = requireLocale((await params).locale);
  const copy = getDictionary(locale);
  return <PlaceholderPage copy={copy.pages.home} phaseLabel={copy.phaseLabel}>
    <div className="section-links"><Link href={`/${locale}/sanatoriums`}>{copy.nav.sanatoriums} <span aria-hidden="true">→</span></Link><Link href={`/${locale}/scenarios`}>{copy.nav.scenarios} <span aria-hidden="true">→</span></Link></div>
  </PlaceholderPage>;
}
