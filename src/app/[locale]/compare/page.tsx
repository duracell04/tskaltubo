import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { getDictionary, requireLocale, type LocalePageProps } from "@/lib/locale";

export default async function ComparePage({ params }: LocalePageProps) {
  const copy = getDictionary(requireLocale((await params).locale));
  return <PlaceholderPage copy={copy.pages.compare} phaseLabel={copy.phaseLabel} />;
}
