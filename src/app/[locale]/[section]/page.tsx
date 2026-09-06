import { MemoPage } from "@/components/MemoPage";
import { requireLocale } from "@/lib/locale";
export const dynamicParams = false;
export function generateStaticParams() {
  return ["finance", "evidence", "report"].map((section) => ({ section }));
}
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale, section } = await params;
  return <MemoPage locale={requireLocale(locale)} section={section} />;
}
