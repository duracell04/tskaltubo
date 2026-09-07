import Link from "next/link";
import { evidence, sources } from "@/data/evidence";
import type { Locale } from "@/lib/constants";
import { propertyCopy } from "@/lib/property-copy";

export function EvidenceLinks({ ids, locale }: { ids: readonly string[]; locale: Locale }) {
  const c = propertyCopy(locale);
  return <span className="property-citations">{ids.map(id => {
    const e = evidence.find(e => e.id === id);
    if (!e) return null;
    const s = sources.find(s => s.id === e.sourceIds[0]);
    return <Link key={id} href={`/${locale}/sources/#${id}`} title={`${s?.publisher} · ${e.claim[locale]}`}>
      {e.effectiveAt?.value ?? c.undated} · {c[e.status]}
    </Link>;
  })}</span>;
}

export function EvidenceCard({ id, locale }: { id: string; locale: Locale }) {
  const e = evidence.find(e => e.id === id);
  if (!e) return null;
  const c = propertyCopy(locale);
  return <article className="evidence-card" id={id}>
    <p className="small muted">{c[e.category]} · {c[e.status]} · {c.evidenceDate}: {e.effectiveAt?.value ?? c.undated}</p>
    <p>{e.claim[locale]}</p>
    <p className="small muted">{c.locator}: {e.locator}</p>
    {e.sourceIds.map(id => {
      const s = sources.find(s => s.id === id)!;
      return <p key={id} className="small">{s.publisher} · {c.published}: {s.publishedAt?.value ?? c.undated}<br />
        {s.url ? <a href={s.url} target="_blank" rel="noreferrer">{c.original} ↗</a> : <Link href={`/${locale}/report`}>{c.report}</Link>}
      </p>;
    })}
  </article>;
}
