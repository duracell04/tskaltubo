import { MemoPage } from "@/components/MemoPage";
import { NewsPage, ProjectPage, SourcesPage } from "@/components/PropertyPages";
import { requireLocale } from "@/lib/locale";
export const dynamicParams = false;
export function generateStaticParams() {
  return ["finance", "evidence", "report", "news", "project", "sources"].map((section) => ({ section }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale, section } = await params;
  const lang = requireLocale(locale);
  if (section === "news") return <NewsPage locale={lang} />;
  if (section === "project") return <ProjectPage locale={lang} />;
  if (section === "sources") return <SourcesPage locale={lang} />;
  return <MemoPage locale={requireLocale(locale)} section={section} />;
}
