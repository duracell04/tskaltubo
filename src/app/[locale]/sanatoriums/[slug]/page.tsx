import { notFound } from "next/navigation";
import { properties } from "@/data/properties";
import { PropertyProfile } from "@/components/PropertyPages";
import { requireLocale } from "@/lib/locale";
export const dynamicParams = false;
export function generateStaticParams() {
  return properties.map(p => ({ slug: p.slug }));
}
export default async function PropertyPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const lang = requireLocale(locale);
  const property = properties.find(p => p.slug === slug);
  if (!property) notFound();
  return <PropertyProfile property={property} locale={lang} />;
}
