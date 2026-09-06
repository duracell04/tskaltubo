import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  HeartPulse,
  Scale,
  Users,
  Landmark,
  Compass,
} from "lucide-react";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/constants";
import { copy } from "@/lib/copy";
import { seed, germanTitle } from "@/lib/workspace-data";
import { publicRecords } from "@/lib/repository";
import { Heading, Panel, SourceNote, Stat, Tag, RichText } from "./ui";
import {
  PropertyExplorer,
  ConceptExplorer,
  CompareExplorer,
  DiligenceExplorer,
  EvidenceExplorer,
  ReportExplorer,
} from "./Explorers";
import dynamic from "next/dynamic";
const FinancialLab = dynamic(() =>
  import("./finance/FinancialLab").then((m) => m.FinancialLab),
);
const CollaborationWorkspace = dynamic(() =>
  import("./workspace/CollaborationWorkspace").then(
    (m) => m.CollaborationWorkspace,
  ),
);
export async function WorkspacePage({
  section,
  locale,
  query = {},
}: {
  section: string;
  locale: Locale;
  query?: Record<string, string | undefined>;
}) {
  const c = copy(locale),
    data = await publicRecords(),
    records = data.records;
  const status = (
    <div className={`data-status ${data.error ? "error" : ""}`}>
      <span className="status-dot" />
      {data.mode === "live" ? c.live : c.snapshot}
      {data.mode === "snapshot" && (
        <span>
          {" "}
          ·{" "}
          {data.error ??
            "Read-only source data; saved collaboration requires connected services"}
        </span>
      )}
    </div>
  );
  if (section === "overview")
    return (
      <>
        {status}
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
              <Link className="text-link" href={`/${locale}/diligence`}>
                {c.contribute}
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
            label="Decision gates"
            value="06"
            note="Evidence before commitment"
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
            <SourceNote locator="1–5" locale={locale} />
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
            <Link href={`/${locale}/diligence`}>
              See the decision gates <ArrowRight size={15} />
            </Link>
          </Panel>
        </div>
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE QUESTIONS THAT MATTER</p>
            <h2>{c.risk}</h2>
          </div>
          <Link href={`/${locale}/diligence`}>
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
            <p className="eyebrow">
              AN OPEN INVITATION TO EXAMINE THE EVIDENCE
            </p>
            <h2>{c.partner}</h2>
            <p>{c.partnerText}</p>
          </div>
          <Link className="button" href={`/${locale}/workspace`}>
            {c.workspace}
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
    diligence: c.diligence,
    evidence: c.evidence,
    report: c.report,
    workspace: c.workspace,
    methodology: c.methodology,
  };
  if (!titles[section]) notFound();
  return (
    <>
      {status}
      <Heading
        title={titles[section]!}
        description={
          section === "scenarios"
            ? "Comparable hypotheses across the residential, care and recovery continuum. No concept has a validated business case."
            : section === "sanatoriums"
              ? "Screen the physical asset separately from its potential operating concept. Historical values are not current offers."
              : section === "finance"
                ? "Trace the original screening arithmetic, then build and challenge a monthly development scenario."
                : section === "diligence"
                  ? "Every unresolved issue is an opportunity for a partner to contribute evidence, capability or a better alternative."
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
      {section === "finance" && (
        <FinancialLab
          conceptId={query.concept ?? "TSK-S7"}
          locale={locale}
          savedModels={records.filter((r) => r.kind === "model")}
        />
      )}
      {section === "diligence" && (
        <DiligenceExplorer records={records} locale={locale} />
      )}
      {section === "evidence" && (
        <EvidenceExplorer
          records={records}
          locale={locale}
          initialKind={query.kind ?? "claim"}
        />
      )}
      {section === "report" && (
        <ReportExplorer strategy={query.strategy === "1"} />
      )}
      {section === "workspace" && (
        <>
          <div className="capability-grid">
            {[
              [Building2, "Real estate"],
              [HeartPulse, "Clinical"],
              [Scale, "Legal"],
              [Users, "Operating"],
              [Landmark, "Financing"],
              [Compass, "Demand"],
            ].map(([Icon, label]) => {
              const I = Icon as typeof Building2;
              return (
                <div key={String(label)}>
                  <I size={20} />
                  <span>{String(label)}</span>
                </div>
              );
            })}
          </div>
          <CollaborationWorkspace
            locale={locale}
            initialRecords={records}
            issueId={query.issue ?? ""}
          />
        </>
      )}
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
              The monthly model uses actual calendar days for daily rates and
              one charge per month for monthly rates. Monthly cash flows are
              placed at each month index, with index 0 as the valuation date.
              Tax and financing are unresolved until configured or explicitly
              excluded. IRRs are annual effective rates; cash yield remains a
              separate stabilized screening metric.
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
