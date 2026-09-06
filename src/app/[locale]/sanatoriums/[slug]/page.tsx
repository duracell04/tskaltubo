import { notFound } from "next/navigation";
import Link from "next/link";
import { publicRecords } from "@/lib/repository";
import { Heading, Panel, SourceNote, Tag } from "@/components/ui";
import { requireLocale } from "@/lib/locale";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const lang = requireLocale(locale);
  const { records } = await publicRecords();
  const property = records.find(
    (item) => item.id === slug && item.kind === "property",
  );
  if (!property) notFound();
  const b = property.body;
  return (
    <>
      <Link href={`/${locale}/sanatoriums`}>← All properties</Link>
      <Heading
        title={property.title}
        eyebrow={`ASSET SCREEN / ${String(b.cadastral)}`}
      />
      <Tag kind="market_field" locale={lang} />
      <div className="overview-grid">
        <Panel>
          <h2>Historical evidence</h2>
          <dl className="service-list">
            {[
              "cadastral",
              "landArea",
              "historicalValue",
              "signal",
              "screen",
              "informationGapPriority",
            ].map((k) => (
              <div key={k}>
                <dt>{k.replace(/([A-Z])/g, " $1")}</dt>
                <dd>{String(b[k] ?? "Unknown")}</dd>
              </div>
            ))}
          </dl>
          <SourceNote locator="8.2–8.3" locale={lang} />
        </Panel>
        <Panel>
          <h2>Current diligence gaps</h2>
          <p>
            Current ownership, transaction authority, availability, possession,
            heritage restrictions, measured building area, technical condition
            and water rights require fresh evidence.
          </p>
          <p>
            No verified coordinates or licensed property imagery are available
            in the retained source package.
          </p>
          <h3>Pilot separability</h3>
          <p>
            Fire compartments, evacuation, utilities, access, services,
            licensing and operating costs must support independent operation
            during later construction.
          </p>
          <Link className="button" href={`/${locale}/workspace?issue=${slug}`}>
            Contribute asset evidence
          </Link>
        </Panel>
      </div>
      <div className="notice">
        Historical values are not asking prices, valuations or total conversion
        costs. Reported vacancy does not establish lawful vacant possession.
      </div>
    </>
  );
}
