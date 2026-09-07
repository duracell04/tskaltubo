"use client";
import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/constants";
import { properties } from "@/data/properties";
import { formatPropertyNumber, emptyFilters, filterProperties, latestPropertyDate, effectiveAvailability, type InventoryFilters } from "@/lib/property-research";
import { propertyCopy, type PropertyCopyKey } from "@/lib/property-copy";
import { EvidenceLinks } from "./PropertyEvidence";

export function PropertyInventory({ locale }: { locale: Locale }) {
  const c = propertyCopy(locale);
  const [filters, setFilters] = useState(emptyFilters);
  const rows = filterProperties(properties, filters);
  const update = (key: keyof InventoryFilters, value: string) => setFilters(f => ({ ...f, [key]: value }));
  const choices: [keyof InventoryFilters, PropertyCopyKey, PropertyCopyKey[]][] = [
    ["ownership", "ownership", ["state", "private", "mixed", "unknown"]],
    ["development", "development", ["announced", "preparation", "construction", "requires_rehabilitation", "completed", "operating", "partially_operating", "not_operating", "unknown"]],
    ["availability", "availability", ["historical_offer", "inquiry_required", "unknown", "live_auction", "private_sale"]],
    ["age", "evidenceAge", ["recent", "older", "undated"]],
    ["portfolio", "portfolio", ["historic", "audit-shortlist", "state-offers-2025"]],
  ];
  return <section aria-label={c.inventory}>
    <div className="inventory-toolbar">
      <label className="inventory-search"><span>{c.search}</span><input type="search" value={filters.query} onChange={e => update("query", e.target.value)} /></label>
      <details className="inventory-filter-details"><summary>{c.filters}</summary><div className="inventory-filters">{choices.map(([key, label, options]) => <label key={key}>
        <span>{c[label]}</span><select value={filters[key]} onChange={e => update(key, e.target.value)}>
          <option value="all">{c.all}</option>{options.map(o => <option key={o} value={o}>{c[o]}</option>)}
        </select>
      </label>)}<button className="button secondary" onClick={() => setFilters(emptyFilters)}>{c.reset}</button></div></details>
    </div>
    <div className="inventory-results"><p role="status" aria-live="polite">{rows.length} / {properties.length} {c.matches}</p><details className="small muted"><summary>{c.evidenceAge}</summary><p>{c.ageNote}</p></details></div>
    <div className="table-scroll inventory-table-wrap" role="region" aria-label={c.inventory} tabIndex={0}>
      <table className="inventory-table"><caption className="sr-only">{c.scope}</caption><thead><tr>
        {[c.property, c.ownership, c.development, c.availability, c.recordedPrice, c.evidenceDate].map(h => <th key={h} scope="col">{h}</th>)}
      </tr></thead><tbody>{rows.map(p => {
        const prices = [...p.historicalPrices].sort((a, b) => (b.effectiveAt?.value ?? "").localeCompare(a.effectiveAt?.value ?? ""));
        const latest = prices[0];
        const discrepancy = p.questions.some(q => ["price-discrepancy", "transaction-scope"].includes(q.id));
        return <tr key={p.id}>
          <th scope="row"><Link className="property-name" href={`/${locale}/sanatoriums/${p.slug}/`}>{locale === "ka" ? p.georgianName : p.canonicalName}</Link><span className="small muted">{locale === "ka" ? p.canonicalName : p.georgianName}</span>{p.memberships.some(m => m.portfolioId === "audit-shortlist") && <span className="shortlist-label">{c["audit-shortlist"]}</span>}</th>
          <td>{c[p.ownership.value?.kind ?? "unknown"]}{p.ownership.value?.ownerName && <span className="small">{p.ownership.value.ownerName}</span>}<EvidenceLinks ids={p.ownership.evidenceIds} locale={locale} /></td>
          <td>{c[p.development.value ?? p.operatingStatus.value ?? "unknown"]}<EvidenceLinks ids={p.development.status === "known" ? p.development.evidenceIds : p.operatingStatus.evidenceIds} locale={locale} /></td>
          <td><span className="availability-label">{c[effectiveAvailability(p)]}</span><EvidenceLinks ids={p.availability.evidenceIds} locale={locale} /></td>
          <td>{latest?.price.status === "known" ? <><strong className="price-value">{latest.price.value.currency} {formatPropertyNumber(latest.price.value.amount, locale)}</strong><span className="small">{c[latest.kind]}</span><EvidenceLinks ids={latest.price.evidenceIds} locale={locale} /></> : c.unknown}{discrepancy && <Link className="discrepancy-link" href={`/${locale}/sanatoriums/${p.slug}/#prices`}>{c.discrepancy}</Link>}</td>
          <td className="evidence-date">{latestPropertyDate(p)?.value ?? c.undated}</td>
        </tr>;
      })}</tbody></table>
    </div>
    {!rows.length && <p className="empty-state">{c.empty}</p>}
  </section>;
}
