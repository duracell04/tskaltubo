import { MemoPage } from "@/components/MemoPage";
import { requireLocale, type LocalePageProps } from "@/lib/locale";
export default async function Page({ params }: LocalePageProps) {
  return (
    <MemoPage
      locale={requireLocale((await params).locale)}
      section="overview"
    />
  );
}
