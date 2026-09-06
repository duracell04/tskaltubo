import { WorkspacePage } from "@/components/WorkspacePage";
import { requireLocale, type LocalePageProps } from "@/lib/locale";
export default async function Page({ params }: LocalePageProps) {
  return (
    <WorkspacePage
      locale={requireLocale((await params).locale)}
      section="scenarios"
    />
  );
}
