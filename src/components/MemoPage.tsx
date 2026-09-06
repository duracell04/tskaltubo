import Link from "next/link";

import { ArrowRight, ArrowUpRight } from "lucide-react";

import { notFound } from "next/navigation";

import type { Locale } from "@/lib/constants";

import { copy } from "@/lib/copy";

import { seed, germanTitle } from "@/lib/research-data";

import { researchRecords } from "@/lib/research-data";

import { Heading, Panel, SourceNote, Stat, Tag, RichText } from "./ui";

import {
  PropertyExplorer,
  ConceptExplorer,
  CompareExplorer,
  ReferenceExplorer,
  EvidenceExplorer,
  ReportExplorer,
} from "./Explorers";

import dynamic from "next/dynamic";

const AnnualCalculator = dynamic(() =>
  import("./finance/AnnualCalculator").then((m) => m.AnnualCalculator),
);

export async function MemoPage({
  section,

  locale,
}: {
  section: string;

  locale: Locale;
}) {
  const c = copy(locale),
    records = researchRecords();

  if (section === "overview")
    return (
      <>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">{c.stage}</p>

            <h1>{c.tagline}</h1>

            <p>{c.intro}</p>

            <div className="hero-actions">
              <Link className="button light" href={`/${locale}/scenarios`}>
                {c.explore}

                <ArrowRight size={17} />
              </Link>

              <Link className="text-link" href={`/${locale}/evidence#risks`}>
                {c.read}

                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>

          <div className="hero-aside">
            <div className="architectural" aria-hidden="true">
              <span />

              <span />

              <span />

              <span />

              <span />
            </div>

            <div className="hero-location">
              <span>TSKALTUBO</span>

              <span>IMERETI, GEORGIA</span>
            </div>

            <p>
              Historic spa identity.
              <br />A new use to be proven.
            </p>
          </div>
        </section>

        <div className="stats-row">
          <Stat
            label="Operating concepts"

            value="07"

            note="All remain visible and comparable"
          />

          <Stat
            label="Historic assets"

            value="11"

            note="Current title and availability unknown"
          />

          <Stat
            label="Report cash yield"

            value="5.30%"

            note="Stabilized screening assumption, not IRR"
          />

          <Stat
            label="Verified investment case"

            value="Not yet"

            note="Private-pay demand remains unproven"
          />
        </div>

        <div className="overview-grid">
          <Panel>
            <p className="eyebrow">CURRENT DIRECTION</p>

            <h2>{c.hypothesis}</h2>

            <p>{c.hypothesisText}</p>

            <Tag kind="assumption" locale={locale} />

            <p className="small muted">
              The audit favors a defined care proposition and separates
              rehabilitation validation. This is not evidence that care-led
              economics outperform the other six concepts. The configuration
              draws on TSK-S7, TSK-S4 and TSK-S6 without changing their
              definitions.
            </p>

            <SourceNote locator="1â€“5" locale={locale} />
          </Panel>

          <Panel className="readiness">
            <p className="eyebrow">DECISION READINESS</p>

            <h2>{c.status}</h2>

            <p>{c.statusText}</p>

            <ul className="readiness-list">
              <li>
                <span className="status-dot" />
                Exploratory partner feedback <strong>Appropriate</strong>
              </li>

              <li>
                <span className="status-dot amber" />
                Conditional operator EOI <strong>Not yet</strong>
              </li>

              <li>
                <span className="status-dot critical" />
                Binding site / investor commitment <strong>Not ready</strong>
              </li>
            </ul>

            <Link href={`/${locale}/evidence#risks`}>
              Inspect the unresolved questions <ArrowRight size={15} />
            </Link>
          </Panel>
        </div>

        <div className="section-heading">
          <div>
            <p className="eyebrow">THE QUESTIONS THAT MATTER</p>

            <h2>{c.risk}</h2>
          </div>

          <Link href={`/${locale}/evidence#risks`}>
            Full risk register <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="blocker-grid">
          {[
            [
              "01",

              "Product & clinical scope",

              "Who can be admitted safely, and which services belong in the first phase?",
            ],

            [
              "02",

              "Demand & private payment",

              "Will families relocate and pay after travel costs and lost benefits?",
            ],

            [
              "03",

              "Asset & conversion cost",

              "Can an available building support a legally and economically separable pilot?",
            ],

            [
              "04",

              "Accountability & licensing",

              "Which Georgian entity is legally responsible for care and rehabilitation?",
            ],

            [
              "05",

              "People & emergency care",

              "Can safe staffing, German-language coverage and hospital escalation be secured?",
            ],
          ].map(([n, title, text]) => (
            <article key={n}>
              <span>{n}</span>

              <h3>{title}</h3>

              <p>{text}</p>
            </article>
          ))}
        </div>

        <section className="partner-banner">
          <div>
            <p className="eyebrow">KEY CONCLUSION</p>
            <h2>The economics need to be challenged.</h2>
            <p>
              The report’s €22.209m investment produces a 5.30% stabilized
              pre-tax cash yield under assumed margins. Demand, conversion cost
              and staffing remain unvalidated.
            </p>
            <SourceNote locator="11.5–11.10" locale={locale} />
          </div>
          <Link className="button" href={`/${locale}/finance`}>
            {c.finance}
            <ArrowRight size={18} />
          </Link>
        </section>

        {locale === "de" && (
          <p className="small muted">
            {germanTitle} · Vorprüfung und Betreiberpartnerschaft | Tskaltubo,
            Georgien
          </p>
        )}
      </>
    );

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

      {section === "compare" && (
        <CompareExplorer records={records} locale={locale} />
      )}

      {section === "finance" && <AnnualCalculator locale={locale} />}

      {section === "evidence" && (
        <>
          <EvidenceExplorer records={records} locale={locale} />
          <section id="risks">
            <h2>Risks, assumptions & unresolved questions</h2>
            <ReferenceExplorer records={records} locale={locale} />
          </section>
        </>
      )}

      {section === "report" && <ReportExplorer />}

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
              The reportâ€™s legal, clinical, market and financial assertions
              remain attributed until independently verified.
            </p>
          </Panel>

          <RichText>{seed.sections.find((s) => s.number === 3)!.body}</RichText>

          <Panel>
            <h2>Financial conventions</h2>

            <p>
              The worksheet uses year zero and ten annual periods. Monthly
              prices use 12 months; daily prices use 365 days. It excludes tax,
              financing, inflation, resale value and automatic working-capital
              recovery. Cash yield is annual operating cash flow divided by
              planned investment; IRR uses annual project cash flows. These are
              screening conventions, not a forecast.
            </p>

            <p>
              The reportâ€™s contingency uses direct costs. The previous draft
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
