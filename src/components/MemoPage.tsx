import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/constants";
import { copy } from "@/lib/copy";
import { propertyCopy } from "@/lib/property-copy";
import { researchRecords } from "@/lib/research-data";
import { seed } from "@/lib/research-data";
import { Heading, Panel, Tag, RichText } from "./ui";
import {
  PropertyExplorer,
  ConceptExplorer,
  CompareExplorer,
  ReferenceExplorer,
  EvidenceExplorer,
  ReportExplorer,
} from "./Explorers";
import dynamic from "next/dynamic";
const AnnualCalculator = dynamic(() => import("./finance/AnnualCalculator").then(m=>m.AnnualCalculator));
export async function MemoPage({
  section,
  locale,
}: {
  section: string;
  locale: Locale;
}) {
  const c = copy(locale),
    records = researchRecords();
  const titles: Record<string, string> = {
    scenarios: c.seven,
    sanatoriums: c.properties,
    compare: c.compare,
    finance: c.finance,

    evidence: c.evidence,
    report: c.report,

    methodology: c.methodology,
  };
  if (!titles[section]) notFound();
  return (
    <>
      
      <Heading
        title={titles[section]!}
        description={
          section === "scenarios"
            ? "Comparable hypotheses across the residential, care and recovery continuum. No concept has a validated business case."
            : section === "sanatoriums"
              ? "Screen the physical asset separately from its potential operating concept. Historical values are not current offers."
              : section === "finance"
                ? "Explore the report example, then change assumptions in a transparent ten-year worksheet."
                  : section === "evidence"
                    ? "Inspect the provenance, limitations and verification status behind the project."
                    : section === "report"
                      ? "Complete dated project audit, with its original reasoning, negative findings, assumptions and appendices."
                      : undefined
        }
      />
      {section === "scenarios" && (
        <>
          <div className="notice">
            <strong>Working configuration:</strong> long-term care with
            separately validated rehabilitation. This does not replace any of
            the seven concepts.{" "}
            <Link href={`/${locale}/compare`}>Compare side by side →</Link>
          </div>
          <ConceptExplorer records={records} locale={locale} />
        </>
      )}
      {section === "sanatoriums" && (
        <PropertyExplorer records={records} locale={locale} />
      )}
      {["compare", "finance"].includes(section) && <p className="notice">{propertyCopy(locale).auditNotice}</p>}
      {section === "compare" && (
        <CompareExplorer records={records} locale={locale} />
      )}
      {section === "finance" && <AnnualCalculator locale={locale}/>}
      {section === "evidence" && <><EvidenceExplorer records={records} locale={locale}/><section id="risks"><h2>Risks, assumptions & unresolved questions</h2><ReferenceExplorer records={records} locale={locale}/></section></>}
      {section === "report" && <ReportExplorer/>}
      {section === "methodology" && (
        <>
          <Panel>
            <h2>Evidence and unknowns</h2>
            <p>
              A claim retains its source category separately from its
              verification status. Only an independently checked, dated primary
              source supports a verified official fact. Calculations do not
              validate their inputs.
            </p>
            <div className="tag-list">
              {[
                "official",
                "market_field",
                "assumption",
                "derived",
                "unknown",
              ].map((k) => (
                <Tag key={k} kind={k} locale={locale} />
              ))}
            </div>
            <p>
              Unknown values remain null. Historical field observations do not
              establish current title, possession or transaction availability.
              The report’s legal, clinical, market and financial assertions
              remain attributed until independently verified.
            </p>
          </Panel>
          <RichText>{seed.sections.find((s) => s.number === 3)!.body}</RichText>
          <Panel>
            <h2>Financial conventions</h2>
            <p>
              The worksheet uses year zero and ten annual periods. Monthly prices use 12 months; daily prices use 365 days. It excludes tax, financing, inflation, resale value and automatic working-capital recovery. Cash yield is annual operating cash flow divided by planned investment; IRR uses annual project cash flows. These are screening conventions, not a forecast.
            </p>
            <p>
              The report’s contingency uses direct costs. The previous draft
              repository formula included soft costs in the contingency base.
              Both bases are explicit choices in the development model.
            </p>
            <Link href={`/${locale}/finance`}>Inspect the calculations</Link>
          </Panel>
        </>
      )}
    </>
  );
}
