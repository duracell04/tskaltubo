import { WorkspacePage } from "@/components/WorkspacePage";
import { requireLocale } from "@/lib/locale";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; section: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale, section } = await params;
  return (
    <WorkspacePage
      locale={requireLocale(locale)}
      section={section}
      query={await searchParams}
    />
  );
}
