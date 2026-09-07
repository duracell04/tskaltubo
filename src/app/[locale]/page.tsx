import { InventoryPage } from "@/components/PropertyPages";
import { requireLocale, type LocalePageProps } from "@/lib/locale";
export default async function Page({ params }: LocalePageProps) {
  return (
    <InventoryPage
      locale={requireLocale((await params).locale)}
      home
    />
  );
}
