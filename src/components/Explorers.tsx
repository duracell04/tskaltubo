"use client";
import { useQuery } from "@/lib/use-query";
import { assessments } from "@/lib/concept-assessment";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import type { ResearchRecord } from "@/types/research";
import type { Locale } from "@/lib/constants";
import { copy, conceptCopy } from "@/lib/copy";
import { seed, expertiseLabels } from "@/lib/research-data";
import { RichText, SourceNote, Tag } from "./ui";
const str = (v: unknown) => (typeof v === "string" ? v : "");
export function SearchBar({
  value,
  onChange,
  placeholder = "Search the project",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="search-box">
      <Search size={18} />
      <span className="sr-only">{placeholder}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
export function PropertyExplorer({
  records,
  locale,
}: {
  records: ResearchRecord[];
  locale: Locale;
}) {
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all");
  const rows = records
    .filter((r) => r.kind === "property")
    .filter((r) =>
      JSON.stringify(r.body).toLowerCase().includes(query.toLowerCase()),
    )
    .filter(
      (r) =>
        filter === "all" ||
        (filter === "priority"
          ? str(r.body.screen).startsWith("Priority")
          : str(r.body.screen).startsWith("Defer")),
    );
  return (
    <>
      <div className="toolbar">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={`${copy(locale).search} · name, cadastral ID, condition`}
        />
        <label className="select-label">
          Screen
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All assets</option>
            <option value="priority">Priority screening</option>
            <option value="defer">Deferred</option>
          </select>
        </label>
        <Link className="button secondary" href={`/${locale}/compare`}>
          {copy(locale).compare}
        </Link>
      </div>
      <p className="muted small">
        {rows.length} assets · historical screen, not current offers or
        valuations
      </p>
      <div className="property-grid">
        {rows.map((r) => (
          <article className="property-card" key={r.id}>
            <div className="property-top">
              <span className="asset-code">{str(r.body.cadastral)}</span>
              <Tag kind="market_field" locale={locale} />
            </div>
            <h2>
              <Link href={`/${locale}/sanatoriums/${r.id}`}>
                {r.title}
                <ArrowUpRight size={20} />
              </Link>
            </h2>
            <div className="asset-metrics">
              <div>
                <span>Land area · reported</span>
                <strong>{str(r.body.landArea)}</strong>
              </div>
              <div>
                <span>Historical value</span>
                <strong>{str(r.body.historicalValue)}</strong>
              </div>
            </div>
            <p>{str(r.body.signal)}</p>
            <div className="screen-note">{str(r.body.screen)}</div>
            <p className="small muted">
              Current title and transaction availability:{" "}
              <strong>unknown</strong>
            </p>
            <SourceNote locator="8.2" locale={locale} />
          </article>
        ))}
      </div>
      {!rows.length && <p role="status">No assets match these filters.</p>}
    </>
  );
}
export function ConceptExplorer({
  records,
  locale,
}: {
  records: ResearchRecord[];
  locale: Locale;
}) {
  const concepts = records.filter((r) => r.kind === "concept");
  return (
    <div className="concept-grid">
      {concepts.map((r, i) => {
        const narrative = conceptCopy[locale][i];
        return (
          <article className="concept-card" key={r.id} id={r.id}>
            <div className="card-kicker">
              <span>{r.id}</span>
              <Tag kind="assumption" locale={locale} />
            </div>
            <h2>{narrative?.[0] ?? r.title}</h2>
            <p>{narrative?.[1]}</p>
            <details>
              <summary>Concept, operating role & validation question</summary>
              <RichText>{str(r.body.body)}</RichText>
              <dl className="service-list">
                {Object.entries(
                  (r.body.services as Record<string, string>) ?? {},
                ).map(([key, v]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </details>
            <dl className="service-list">
              <div>
                <dt>Property requirements</dt>
                <dd>{assessments[r.id]?.property}</dd>
              </div>
              <div>
                <dt>Accountability</dt>
                <dd>{assessments[r.id]?.accountability}</dd>
              </div>
              <div>
                <dt>What must change or be proven</dt>
                <dd>{assessments[r.id]?.viability}</dd>
              </div>
            </dl>
            <p className="small muted">
              Economics remain unvalidated. Populate demand, asset, staffing and
              financing inputs to test viability.
            </p>
            <div className="card-links">
              <Link href={`/${locale}/finance?concept=${r.id}`}>
                Model this concept <ArrowUpRight size={15} />
              </Link>
            </div>
            <SourceNote
              source="strategy-matrix"
              locator={`4 / ${r.id}`}
              locale={locale}
            />
          </article>
        );
      })}
    </div>
  );
}
export function CompareExplorer({
  records,
  locale,
}: {
  records: ResearchRecord[];
  locale: Locale;
}) {
  const [kind, setKind] = useState("property"),
    [selected, setSelected] = useState<string[]>([
      "intouristi",
      "geologist",
      "imereti",
    ]);
  const rows = records.filter((r) => r.kind === kind);
  const chosen = rows.filter((r) => selected.includes(r.id));
  const attributes =
    kind === "concept"
      ? [
          "Independent / retirement living",
          "Assisted / personal care",
          "Nursing",
          "Skilled nursing",
          "Rehab",
          "Post-acute",
          "Wellness / balneology",
          "Short stays",
          "External clients",
          "Strategic character",
        ]
      : [
          "cadastral",
          "landArea",
          "historicalValue",
          "signal",
          "screen",
          "informationGapPriority",
          "titleStatus",
          "availability",
        ];
  return (
    <>
      <div className="segmented">
        <button
          aria-pressed={kind === "concept"}
          onClick={() => {
            setKind("concept");
            setSelected(["TSK-S2", "TSK-S6", "TSK-S7"]);
          }}
        >
          Operating concepts
        </button>
        <button
          aria-pressed={kind === "property"}
          onClick={() => {
            setKind("property");
            setSelected(["intouristi", "geologist", "imereti"]);
          }}
        >
          Properties
        </button>
      </div>
      <fieldset className="selection-list">
        <legend>Choose up to four to compare</legend>
        {rows.map((r) => (
          <label key={r.id}>
            <input
              type="checkbox"
              checked={selected.includes(r.id)}
              disabled={!selected.includes(r.id) && selected.length >= 4}
              onChange={(e) =>
                setSelected(
                  e.target.checked
                    ? [...selected, r.id]
                    : selected.filter((x) => x !== r.id),
                )
              }
            />
            {r.title}
          </label>
        ))}
      </fieldset>
      <div className="table-scroll">
        <table>
          <caption>
            {kind === "concept"
              ? "Service configurations are hypotheses, not validated operating plans."
              : "All property values are attributed historical signals; current title is unknown."}
          </caption>
          <thead>
            <tr>
              <th>Dimension</th>
              {chosen.map((r) => (
                <th key={r.id}>{r.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attributes.map((key) => (
              <tr key={key}>
                <th>{key.replace(/([A-Z])/g, " $1")}</th>
                {chosen.map((r) => (
                  <td key={r.id}>
                    {str(
                      kind === "concept"
                        ? (r.body.services as Record<string, string>)?.[key]
                        : r.body[key],
                    ) || "Unknown"}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th>Financial viability</th>
              {chosen.map((r) => (
                <td key={r.id}>
                  Not established.{" "}
                  <Link
                    href={`/${locale}/finance?${kind === "concept" ? "concept" : "property"}=${r.id}`}
                  >
                    Test assumptions
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <SourceNote
        locator={kind === "concept" ? "3" : "8.2"}
        source={kind === "concept" ? "strategy-matrix" : "audit-2026"}
        locale={locale}
      />
    </>
  );
}
export function ReferenceExplorer({
  records,
  locale,
}: {
  records: ResearchRecord[];
  locale: Locale;
}) {
  const [query, setQuery] = useState(""),
    [kind, setKind] = useState("risk");
  const rows = records.filter(
    (r) =>
      r.kind === kind &&
      (r.title + JSON.stringify(r.body))
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <p>
        Reference topics from the dated audit. These are research questions, not
        tracked tasks.
      </p>
      <div className="toolbar">
        <SearchBar value={query} onChange={setQuery} />
        <div className="segmented">
          {[
            ["risk", "Risk register"],
            ["question", "Unresolved questions"],
            ["topic", "Diligence topics"],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={kind === id}
              onClick={() => setKind(id!)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="issue-list">
        {rows.map((r) => (
          <article className="issue" id={r.id} key={r.id}>
            <span className="small muted">
              {expertiseLabels[str(r.body.expertise)] ?? "Research topic"}
            </span>
            <h3>{r.title}</h3>
            {r.kind === "risk" && (
              <p className="tag tag-risk">
                {str(r.body.rating)} · probability {str(r.body.probability)} ·
                impact {str(r.body.impact)}
              </p>
            )}
            <p>
              {str(r.body.mitigation) ||
                str(r.body.output) ||
                "Evidence needed to resolve this question."}
            </p>
            <p>{str(r.body.rationale)}</p>
            <SourceNote locator={str(r.body.locator)} locale={locale} />
          </article>
        ))}
      </div>
      {!rows.length && <p>No matching topics.</p>}
    </>
  );
}
export function EvidenceExplorer({
  records,
  locale,
  initialKind = "claim",
}: {
  records: ResearchRecord[];
  locale: Locale;
  initialKind?: string;
}) {
  const [query, setQuery] = useState(""),
    [chosenKind, setKind] = useState<string | null>(null);
  const queryParams = useQuery();
  const kind =
    chosenKind ??
    (queryParams.get("kind") === "source" ? "source" : initialKind);

  useEffect(()=>{const id=location.hash.slice(1);if(id)document.getElementById(id)?.scrollIntoView();},[kind]);
  const rows = records
    .filter((r) => r.kind === kind)
    .filter((r) =>
      JSON.stringify(r).toLowerCase().includes(query.toLowerCase()),
    );
  return (
    <>
      <div className="notice">
        The supplied audit is retained. Its linked sources have not
        automatically been verified, and the underlying historical decks, model
        and registry extracts are not in this source package.
      </div>
      <div className="toolbar">
        <SearchBar value={query} onChange={setQuery} />
        <div className="segmented">
          {["claim", "source"].map((k) => (
            <button
              key={k}
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
            >
              {k === "claim"
                ? "Claims register"
                : k === "source"
                  ? "Source library"
                  : "Published documents"}
            </button>
          ))}
        </div>
      </div>
      <div className="issue-list">
        {rows.map((r) => (
          <article className="issue" id={r.id} key={r.id}>
            <Tag
              kind={str(r.body.classification) || "unknown"}
              verified={r.body.verification === "verified"}
              locale={locale}
            />
            <h3>{r.title}</h3>
            {kind === "claim" ? (
              <>
                <p>{str(r.body.wording)}</p>
                <p className="small">
                  <strong>Evidence still needed:</strong> {str(r.body.required)}
                </p>
                <p className="muted small">Assessment: {str(r.body.status)}</p>
                <SourceNote locator={str(r.body.locator)} locale={locale} />
              </>
            ) : (
              <>
                <p>
                  {str(r.body.publisher)} ·{" "}
                  {str(r.body.availability) || "Availability unknown"}
                </p>
                <p className="small muted">
                  Published: {str(r.body.publishedAt) || "date not established"}{" "}
                  · Accessed:{" "}
                  {str(r.body.accessedAt) || "not independently accessed"}
                </p>
                {typeof r.body.url === "string" && (
                  <a href={r.body.url} target="_blank" rel="noreferrer">
                    Open cited source ↗
                  </a>
                )}
                {r.id === "audit-2026" && (
                  <Link href={`/${locale}/report`}>Read retained audit</Link>
                )}
                {r.id === "strategy-matrix" && (
                  <Link href={`/${locale}/report?strategy=1`}>
                    Read retained concept matrix
                  </Link>
                )}
                {Boolean(r.body.sha256) && (
                  <details>
                    <summary>Source integrity</summary>
                    <code className="hash">SHA-256 {str(r.body.sha256)}</code>
                  </details>
                )}
              </>
            )}
          </article>
        ))}
      </div>
      {!rows.length && (
        <p>
          No matching evidence. Missing documents are not treated as verified
          sources.
        </p>
      )}
    </>
  );
}
export function ReportExplorer({ strategy = false }: { strategy?: boolean }) {
  const [query, setQuery] = useState("");
  const showStrategy = useQuery().get("strategy") === "1" || strategy;
  const sections = seed.sections.filter((s) =>
    (s.title + s.body).toLowerCase().includes(query.toLowerCase()),
  );
  if (showStrategy) return <RichText>{seed.strategy}</RichText>;
  return (
    <>
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search the full report"
      />
      <div className="report-layout">
        <nav aria-label="Report contents" className="report-index">
          {seed.sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {String(s.number).padStart(2, "0")} {s.title}
            </a>
          ))}
        </nav>
        <div>
          {sections.map((s) => (
            <section className="report-section" key={s.id} id={s.id}>
              <p className="eyebrow">
                SECTION {String(s.number).padStart(2, "0")}
              </p>
              <h2>{s.title}</h2>
              <RichText>{s.body}</RichText>
            </section>
          ))}
        </div>
      </div>
      {!sections.length && <p>No sections match this search.</p>}
    </>
  );
}
