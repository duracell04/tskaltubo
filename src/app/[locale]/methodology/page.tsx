import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { getDictionary, requireLocale, type LocalePageProps } from "@/lib/locale";

export default async function MethodologyPage({ params }: LocalePageProps) {
  const copy = getDictionary(requireLocale((await params).locale));
  return <PlaceholderPage copy={copy.pages.methodology} phaseLabel={copy.phaseLabel} />;
}
