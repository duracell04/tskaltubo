import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { ScenarioCalculator } from "@/components/finance/ScenarioCalculator";
import { getDictionary, requireLocale, type LocalePageProps } from "@/lib/locale";

export default async function ScenariosPage({ params }: LocalePageProps) {
  const copy = getDictionary(requireLocale((await params).locale));
  return <PlaceholderPage copy={copy.pages.scenarios} phaseLabel={copy.phaseLabel}><ScenarioCalculator {...copy.calculator} /></PlaceholderPage>;
}
