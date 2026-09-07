import Link from "next/link";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/constants";
import type { Property } from "@/types/property";
import { properties, propertyNarratives } from "@/data/properties";
import { evidence, sources } from "@/data/evidence";
import { propertyNews } from "@/data/property-news";
import { RESEARCH_AS_OF } from "@/data/research-helpers";
import { propertyCopy } from "@/lib/property-copy";
import { formatPropertyNumber, effectiveAvailability, hasMatchedCoordinates, propertyEvidenceIds, validatePropertyResearch } from "@/lib/property-research";
import { PropertyInventory } from "./PropertyInventory";
import { EvidenceCard, EvidenceLinks } from "./PropertyEvidence";
import { NaspRequest } from "./NaspRequest";
import { ConceptExplorer } from "./Explorers";
import { researchRecords } from "@/lib/research-data";

const contentErrors = validatePropertyResearch(properties, evidence, sources, propertyNews);
if (contentErrors.length) throw new Error(contentErrors.join("\n"));

export function InventoryPage({ locale, home = false }: { locale: Locale; home?: boolean }) {
  const c = propertyCopy(locale);
  return <div className="property-research">
    <header className="inventory-heading"><p className="eyebrow">TSKALTUBO · {c.checked} {RESEARCH_AS_OF}</p>
      <h1>{home ? c.title : c.sanatoriums}</h1><p className="lede">{home ? c.intro : c.scope}</p></header>
    <div className="portfolio-counts">{(["historic", "state-offers-2025", "audit-shortlist"] as const).map(id => <div key={id}><strong>{properties.filter(p => p.memberships.some(m => m.portfolioId === id)).length}</strong><span>{c[id]}</span></div>)}</div>
    <details className="portfolio-notes small muted"><summary>{c.scopeLabel}</summary><p>{c.scope}</p><p>{c.programNote} <a href="https://www.economy.ge/?lang=en&nw=1982&page=news" target="_blank" rel="noreferrer">{c.source} ↗</a></p></details>
    <PropertyInventory locale={locale} />
    {home && <section className="recent-news"><h2>{c.news}</h2><NewsList locale={locale} limit={3} /><Link href={`/${locale}/news/`}>{c.news} →</Link></section>}
  </div>;
}

export function NewsList({ locale, propertyId, limit }: { locale: Locale; propertyId?: string; limit?: number }) {
  const c = propertyCopy(locale);
  const rows = propertyNews.filter(n => !propertyId || n.propertyIds.includes(propertyId)).sort((a, b) => b.publishedAt.value.localeCompare(a.publishedAt.value)).slice(0, limit);
  return <div className="news-list">{rows.map(n => {
    const source = sources.find(s => s.id === n.sourceId)!;
    return <article key={n.id} id={n.id} className="news-item"><p className="eyebrow">{n.publishedAt.value} · {source.publisher}</p>
      <h3>{n.title[locale]}</h3><p>{n.summary[locale]}</p>
      <p className="small muted">{c.eventDate}: {n.eventAt?.value ?? c.unknown}</p>
      <div className="property-news-links">{n.propertyIds.map(id => { const p = properties.find(p => p.id === id)!; return <Link key={id} href={`/${locale}/sanatoriums/${p.slug}/`}>{locale === "ka" ? p.georgianName : p.canonicalName}</Link>; })}</div>
      <EvidenceLinks ids={n.evidenceIds} locale={locale} /><a className="small" href={source.url!} target="_blank" rel="noreferrer">{c.original} ↗</a>
    </article>;
  })}</div>;
}
export function NewsPage({ locale }: { locale: Locale }) {
  const c = propertyCopy(locale);
  return <div className="property-research"><header className="inventory-heading"><p className="eyebrow">TSKALTUBO · {c.checked} {RESEARCH_AS_OF}</p><h1>{c.news}</h1><p>{c.sourcesIntro}</p></header><NewsList locale={locale} /></div>;
}
function Field({ title, children }: { title: string; children: ReactNode }) {
  return <div><dt>{title}</dt><dd>{children}</dd></div>;
}
export function PropertyProfile({ property: p, locale }: { property: Property; locale: Locale }) {
  const c = propertyCopy(locale);
  const narrative = propertyNarratives.find(n => n.propertyId === p.id && n.locale === locale)!;
  const ids = propertyEvidenceIds(p);
  const nextQuestion = p.questions[0]!;
  return <div className="property-research property-profile">
    <Link href={`/${locale}/sanatoriums/`}>← {c.back}</Link>
    <header className="inventory-heading"><p className="eyebrow">{p.id} · {c.checked} {RESEARCH_AS_OF}</p><h1>{locale === "ka" ? p.georgianName : p.canonicalName}</h1><p className="property-subtitle">{locale === "ka" ? p.canonicalName : p.georgianName}</p><p>{narrative.summary}</p></header>
    <section className="next-action"><h2>{c.next}</h2><p>{nextQuestion.question[locale]}</p><p>{nextQuestion.action[locale]}</p><EvidenceLinks ids={nextQuestion.evidenceIds} locale={locale} />
      <Link href={`/${locale}/sources/${p.inquiryRoute === "nasp" ? "#nasp-request" : "#private-verification"}`}>{p.inquiryRoute === "nasp" ? c.request : c.sources} →</Link>
    </section>
    <div className="property-profile-grid"><section className="property-panel"><h2>{c.identity}</h2><dl className="property-fields">
      <Field title={c.aliases}>{p.alternativeNames.join(" · ") || "—"}<EvidenceLinks ids={p.identityEvidenceIds} locale={locale} /></Field>
      <Field title={c.address}>{p.address.value?.[locale] ?? c.unknown}<EvidenceLinks ids={p.address.evidenceIds} locale={locale} /></Field>
      <Field title={c.cadastral}>{p.cadastralIds.value?.join(" · ") ?? c.unknown}<EvidenceLinks ids={p.cadastralIds.evidenceIds} locale={locale} /></Field>
      <Field title={c.plotArea}>{p.plotAreaM2.status === "known" ? `${formatPropertyNumber(p.plotAreaM2.value, locale)} m²` : c.unknown}<EvidenceLinks ids={p.plotAreaM2.evidenceIds} locale={locale} /></Field>
      <Field title={c.portfolio}>{p.memberships.map(m => <span key={m.portfolioId}>{c[m.portfolioId as "historic" | "audit-shortlist" | "state-offers-2025"]}<EvidenceLinks ids={m.evidenceIds} locale={locale} /></span>)}</Field>
    </dl>{hasMatchedCoordinates(p) && p.coordinates.status === "known" ? <a href={`https://www.openstreetmap.org/?mlat=${p.coordinates.value.lat}&mlon=${p.coordinates.value.lng}#map=17/${p.coordinates.value.lat}/${p.coordinates.value.lng}`} target="_blank" rel="noreferrer">{c.map} ↗</a> : <p className="small muted">{c.mapUnavailable}</p>}</section>
    <section className="property-panel"><h2>{c.status}</h2><dl className="property-fields">
      <Field title={c.ownership}>{c[p.ownership.value?.kind ?? "unknown"]}{p.ownership.value?.ownerName && ` · ${p.ownership.value.ownerName}`}<span className="small muted">{c[p.ownershipVerification]}</span><EvidenceLinks ids={p.ownership.evidenceIds} locale={locale} /></Field>
      <Field title={c.development}>{c[p.development.value ?? "unknown"]}<EvidenceLinks ids={p.development.evidenceIds} locale={locale} /></Field>
      <Field title={c.operatingStatus}>{c[p.operatingStatus.value ?? "unknown"]}<EvidenceLinks ids={p.operatingStatus.evidenceIds} locale={locale} /></Field>
      <Field title={c.occupancy}>{c[p.occupancy.value ?? "unknown"]}<EvidenceLinks ids={p.occupancy.evidenceIds} locale={locale} /></Field>
      <Field title={c.availability}>{c[effectiveAvailability(p)]}<EvidenceLinks ids={p.availability.evidenceIds} locale={locale} /></Field>
      {p.roles.map((r, i) => <Field key={i} title={c[r.role]}>{r.name}<EvidenceLinks ids={r.evidenceIds} locale={locale} /></Field>)}
    </dl>{p.observedScope && <p>{p.observedScope[locale]}<EvidenceLinks ids={[...p.development.evidenceIds, ...p.operatingStatus.evidenceIds]} locale={locale} /></p>}<p className="small muted">{c.authorityNote}</p></section></div>
    <section id="prices" className="property-panel"><h2>{c.prices}</h2>
      {p.questions.filter(q => ["price-discrepancy", "transaction-scope"].includes(q.id)).map(q => <div className="conflict-note" key={q.id}><strong>{c.discrepancy}</strong><p>{q.question[locale]}</p><EvidenceLinks ids={q.evidenceIds} locale={locale} /></div>)}
      {p.historicalPrices.length ? <div className="table-scroll" role="region" tabIndex={0} aria-label={c.prices}><table><thead><tr>{[c.evidenceDate, c.recordedPrice, c.scopeLabel, c.tax, c.evidence].map(t => <th scope="col" key={t}>{t}</th>)}</tr></thead><tbody>{[...p.historicalPrices].sort((a, b) => (b.effectiveAt?.value ?? "").localeCompare(a.effectiveAt?.value ?? "")).map((v, i) => <tr key={i}>
        <td>{v.effectiveAt?.value ?? c.undated}</td><td>{v.price.status === "known" ? <strong className="price-value">{v.price.value.currency} {formatPropertyNumber(v.price.value.amount, locale)}</strong> : c.unknown}<span className="small">{c[v.kind]}</span></td><td>{v.scope[locale]}</td><td>{c[v.taxTreatment]}</td><td><EvidenceLinks ids={v.price.evidenceIds} locale={locale} /></td>
      </tr>)}</tbody></table></div> : <p>{c.unknown}</p>}
    </section>
    <section className="property-panel"><h2>{c.obligations}</h2><p className="small muted">{c.obligationNote}</p><div className="obligation-list">{p.obligations.length ? p.obligations.map((o, i) => <article key={i}><h3>{o.requiredUse[locale]}</h3><dl className="property-fields">
      <Field title={c.minimum}>{o.minimumInvestment ? `${o.investmentComparison === "more_than" ? ">" : "≥"} ${o.minimumInvestment.currency} ${formatPropertyNumber(o.minimumInvestment.amount, locale)}` : c.unknown}</Field>
      <Field title={c.capacity}>{o.capacity ? `${o.capacity.value} ${c[o.capacity.unit]}` : c.unknown}</Field><Field title={c.deadline}>{o.deadline?.[locale] ?? c.unknown}</Field><Field title={c.tax}>{c[o.taxTreatment]}</Field>
    </dl>{o.conditions && <p>{o.conditions[locale]}</p>}<EvidenceLinks ids={o.evidenceIds} locale={locale} /></article>) : <p>{c.unknown}</p>}</div></section>
    <section className="property-panel"><h2>{c.timeline}</h2><ol className="property-timeline">{[...p.events].sort((a, b) => (b.at?.value ?? "").localeCompare(a.at?.value ?? "")).map(e => <li key={e.id}><span className="small muted">{e.at?.value ?? c.undated}{e.kind === "forecast" ? ` · ${c.forecast}` : ""}</span><p>{e.description[locale]}</p><EvidenceLinks ids={e.evidenceIds} locale={locale} /></li>)}</ol>{!p.events.length && <p>{c.unknown}</p>}</section>
    <section className="property-panel"><h2>{c.next}</h2>{p.questions.map(q => <article className="verification-question" key={q.id}><h3>{q.question[locale]}</h3><p>{q.action[locale]}</p><EvidenceLinks ids={q.evidenceIds} locale={locale} /></article>)}</section>
    {propertyNews.some(n => n.propertyIds.includes(p.id)) && <section className="recent-news"><h2>{c.news}</h2><NewsList locale={locale} propertyId={p.id} /></section>}
    <section className="profile-evidence"><h2>{c.evidence}</h2>{ids.map(id => <EvidenceCard key={id} id={id} locale={locale} />)}</section>
  </div>;
}

export function SourcesPage({ locale }: { locale: Locale }) {
  const c = propertyCopy(locale);
  return <div className="property-research"><header className="inventory-heading"><h1>{c.sources}</h1><p className="lede">{c.sourcesIntro}</p><p className="small muted">{c.checked}: {RESEARCH_AS_OF}</p></header>
    <nav className="section-links"><a href="#nasp-request">{c.request}</a><a href="#source-register">{c.sources}</a><a href="#audit-library">{c.historicalLibrary}</a></nav>
    <NaspRequest locale={locale} /><section id="private-verification" className="property-panel"><h2>{c.next}</h2><p>{c.privateSteps}</p><div className="section-links">{sources.filter(s => s.sourceType === "registry_service").map(s => <a key={s.id} href={s.url!} target="_blank" rel="noreferrer">NAPR · {s.title} ↗</a>)}</div></section>
    <section id="source-register"><h2>{c.sources}</h2>{sources.filter(s => s.sourceType !== "audit").map(s => <article className="source-entry" key={s.id} id={`source-${s.id}`}>
      <h3>{s.title}</h3><p>{s.publisher} · {c[s.accessResult]}</p><p className="small muted">{c.published}: {s.publishedAt?.value ?? c.undated} · {c.accessed}: {s.accessedAt?.value ?? c.unknown} · {c.language}: {s.language}</p>
      {s.url && <a href={s.url} target="_blank" rel="noreferrer">{c.original} ↗</a>}
      {evidence.filter(e => e.sourceIds.includes(s.id)).map(e => <EvidenceCard id={e.id} key={e.id} locale={locale} />)}
    </article>)}</section>
    <section className="source-entry" id="audit-library"><h2>{c.historicalLibrary}</h2><p>{c.auditNotice}</p><div className="section-links"><Link href={`/${locale}/report/`}>{c.report}</Link><Link href={`/${locale}/evidence/`}>{c.evidence}</Link></div>{evidence.filter(e => e.sourceIds.includes("audit-2026")).map(e => <EvidenceCard id={e.id} key={e.id} locale={locale} />)}</section>
  </div>;
}
export function ProjectPage({ locale }: { locale: Locale }) {
  const c = propertyCopy(locale);
  return <div className="property-research"><header className="inventory-heading"><p className="eyebrow">TSKALTUBO · SENIOR LIVING & CARE</p><h1>{c.project}</h1><p className="lede">{c.projectIntro}</p></header>
    <nav className="project-links">{([["finance", "calculator"], ["compare", "compare"], ["report", "report"], ["methodology", "methodology"], ["evidence", "evidence"]] as const).map(([path, label]) => <Link key={path} href={`/${locale}/${path}/`}>{c[label]} →</Link>)}</nav>
    <p className="notice">{c.auditNotice}</p><h2>{c.scenarios}</h2><ConceptExplorer records={researchRecords()} locale={locale} />
  </div>;
}
