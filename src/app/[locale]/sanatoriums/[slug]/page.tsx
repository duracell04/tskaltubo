import { notFound } from "next/navigation";
import { properties } from "@/data/properties";
import { requireLocale } from "@/lib/locale";

export function generateStaticParams() {
  return properties.map(({ slug }) => ({ slug }));
}

export default async function PropertyPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  requireLocale(locale);
  const property = properties.find((item) => item.slug === slug);
  if (!property) notFound();
  return <h1>{property.canonicalName}</h1>;
}
