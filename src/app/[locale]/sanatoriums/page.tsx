import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { SanatoriumMap } from "@/components/map/SanatoriumMap";
import { getDictionary, requireLocale, type LocalePageProps } from "@/lib/locale";

export default async function SanatoriumsPage({ params }: LocalePageProps) {
  const copy = getDictionary(requireLocale((await params).locale));
  return <PlaceholderPage copy={copy.pages.sanatoriums} phaseLabel={copy.phaseLabel}><SanatoriumMap {...copy.map} /></PlaceholderPage>;
}
