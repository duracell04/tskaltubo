import type { Evidence, ResearchDate, Source } from "@/types/evidence";
import type { Property, PropertyNews } from "@/types/property";
import { evidence } from "@/data/evidence";
import { RESEARCH_AS_OF } from "@/data/research-helpers";
import type { Locale } from "./constants";

/** Chromium may omit Georgian ICU data; use explicit, consistent separators. */
export function formatPropertyNumber(value: number, locale: Locale): string {
  const formatted = new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-US", { maximumFractionDigits: 2 }).format(value);
  return locale === "ka" ? formatted.replaceAll(",", "\u00a0").replace(".", ",") : formatted;
}

export function propertyEvidenceIds(p: Property): string[] {
  const ids = new Set<string>();
  function walk(value: unknown) {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if ((key === "evidenceIds" || key === "identityEvidenceIds") && Array.isArray(child)) child.forEach(id => ids.add(id));
      else if (typeof child === "object") walk(child);
    }
  }
  walk(p);
  return [...ids];
}
/** Access dates and the recently compiled audit never refresh market evidence. */
export function latestPropertyDate(p: Property, records: readonly Evidence[] = evidence): ResearchDate | null {
  const ids = [p.ownership, p.development, p.operatingStatus, ...p.historicalPrices.map(p => p.price)].flatMap(v => v.evidenceIds);
  return records.filter(e => ids.includes(e.id) && e.effectiveAt).map(e => e.effectiveAt!).sort((a, b) => b.value.localeCompare(a.value))[0] ?? null;
}
export function evidenceAge(at: ResearchDate | null, asOf = RESEARCH_AS_OF): "recent" | "older" | "undated" {
  if (!at) return "undated";
  const cutoff = `${Number(asOf.slice(0, 4)) - 1}${asOf.slice(4)}`;
  // Partial dates only qualify as recent if their earliest possible day qualifies.
  const earliest = at.value + (at.precision === "year" ? "-01-01" : at.precision === "month" ? "-01" : "");
  return earliest >= cutoff && earliest <= asOf ? "recent" : "older";
}
export function effectiveAvailability(p: Property, asOf = RESEARCH_AS_OF) {
  const a = p.availability;
  if (!["live_auction", "private_sale"].includes(a.kind)) return a.kind;
  return a.authorizedParty && a.evidenceIds.length && a.confirmedAt?.precision === "day" && a.confirmedAt.value <= asOf && a.validUntil?.precision === "day" && a.validUntil.value >= asOf ? a.kind : "unknown";
}
export function hasMatchedCoordinates(p: Property) {
  return p.coordinates.status === "known" && p.coordinates.evidenceIds.length > 0 && p.coordinates.evidenceIds.every(id => evidence.some(e => e.id === id && e.propertyIds.includes(p.id) && e.status !== "unverified" && e.status !== "unknown"));
}
export interface InventoryFilters { query: string; ownership: string; development: string; availability: string; age: string; portfolio: string }
export const emptyFilters: InventoryFilters = { query: "", ownership: "all", development: "all", availability: "all", age: "all", portfolio: "all" };
export function filterProperties(properties: readonly Property[], filters: InventoryFilters): Property[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return properties.filter(p => {
    const searchable = [p.canonicalName, p.georgianName, ...p.alternativeNames, ...(p.cadastralIds.value ?? [])].join(" ").toLocaleLowerCase();
    return searchable.includes(query)
      && (filters.ownership === "all" || (p.ownership.value?.kind ?? "unknown") === filters.ownership)
      && (filters.development === "all" || (p.development.value ?? p.operatingStatus.value ?? "unknown") === filters.development)
      && (filters.availability === "all" || effectiveAvailability(p) === filters.availability)
      && (filters.age === "all" || evidenceAge(latestPropertyDate(p)) === filters.age)
      && (filters.portfolio === "all" || p.memberships.some(m => m.portfolioId === filters.portfolio));
  }).sort((a, b) => a.canonicalName.localeCompare(b.canonicalName, "en"));
}
export function validResearchDate(at: ResearchDate): boolean {
  if (!{ year: /^\d{4}$/, month: /^\d{4}-\d{2}$/, day: /^\d{4}-\d{2}-\d{2}$/ }[at.precision]?.test(at.value)) return false;
  const full = at.value + (at.precision === "year" ? "-01-01" : at.precision === "month" ? "-01" : "");
  const d = new Date(`${full}T00:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === full;
}

/** Executed in content tests and before static property pages are generated. */
export function validatePropertyResearch(properties: readonly Property[], records: readonly Evidence[], sources: readonly Source[], news: readonly PropertyNews[]): string[] {
  const errors: string[] = [];
  const checkUnique = (items: readonly { id: string }[], kind: string) => {
    if (new Set(items.map(i => i.id)).size !== items.length) errors.push(`Duplicate ${kind} IDs`);
  };
  checkUnique(properties, "property"); checkUnique(records, "evidence"); checkUnique(sources, "source"); checkUnique(news, "news");
  if (new Set(properties.map(p => p.slug)).size !== properties.length) errors.push("Duplicate slugs");
  const propertyIds = new Set(properties.map(p => p.id));
  const evidenceById = new Map(records.map(e => [e.id, e]));
  const sourcesById = new Map(sources.map(s => [s.id, s]));
  function walk(value: unknown, context: string) {
    if (!value || typeof value !== "object") return;
    const object = value as Record<string, unknown>;
    if ("precision" in object && !validResearchDate(value as ResearchDate)) errors.push(`${context}: invalid date`);
    if (object.status === "known" && (object.value === null || !Array.isArray(object.evidenceIds) || !object.evidenceIds.length)) errors.push(`${context}: unsourced known value`);
    if (object.status === "unknown" && "value" in object && object.value !== null) errors.push(`${context}: unknown must be null`);
    if ("amount" in object && (typeof object.amount !== "number" || !Number.isFinite(object.amount) || object.amount < 0)) errors.push(`${context}: invalid amount`);
    if ("en" in object && ["en", "de", "ka"].some(l => typeof object[l] !== "string" || !(object[l] as string).trim())) errors.push(`${context}: missing translation`);
    Object.values(object).forEach(v => walk(v, context));
  }
  for (const e of records) {
    walk(e, e.id);
    if (!e.sourceIds.length || !e.locator) errors.push(`${e.id}: source or passage missing`);
    e.sourceIds.forEach(id => { if (!sourcesById.has(id)) errors.push(`${e.id}: missing source ${id}`); });
    e.propertyIds.forEach(id => { if (!propertyIds.has(id)) errors.push(`${e.id}: missing property ${id}`); });
    if (e.status === "current" && (!e.verifiedAt || e.verifiedAt.precision !== "day")) errors.push(`${e.id}: current needs verification date`);
    if (e.status !== "unverified" && e.sourceIds.some(id => ["blocked", "not_retrieved"].includes(sourcesById.get(id)?.accessResult ?? ""))) errors.push(`${e.id}: inaccessible source promoted`);
  }
  sources.forEach(s => walk(s, s.id));
  for (const p of properties) {
    walk(p, p.id);
    for (const id of propertyEvidenceIds(p)) {
      const e = evidenceById.get(id);
      if (!e) errors.push(`${p.id}: missing evidence ${id}`);
      else if (!e.propertyIds.includes(p.id)) errors.push(`${p.id}: mismatched evidence ${id}`);
    }
    for (const item of [...p.roles, ...p.events, ...p.memberships, ...p.obligations]) if (!item.evidenceIds.length) errors.push(`${p.id}: unsourced record`);
    if (!p.identityEvidenceIds.length || !p.questions.length) errors.push(`${p.id}: incomplete identity or next step`);
    if (p.ownershipVerification === "registry_verified" && !p.ownership.evidenceIds.some(id => {
      const e = evidenceById.get(id);
      return e?.status === "current" && e.verifiedAt?.value === RESEARCH_AS_OF && e.sourceIds.some(s => sourcesById.get(s)?.sourceType === "registry_extract");
    })) errors.push(`${p.id}: registry label lacks fresh extract`);
    if (["live_auction", "private_sale"].includes(p.availability.kind)) {
      if (effectiveAvailability(p) === "unknown" || !p.availability.evidenceIds.every(id => evidenceById.get(id)?.status === "current")) errors.push(`${p.id}: active offer lacks current confirmation`);
    }
    if (p.development.value === "completed" && !p.events.some(e => e.kind === "development" && e.evidenceIds.some(id => p.development.evidenceIds.includes(id)))) errors.push(`${p.id}: completion cannot derive from forecast`);
    if (p.coordinates.status === "known") {
      const { lat, lng } = p.coordinates.value;
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180 || !hasMatchedCoordinates(p)) errors.push(`${p.id}: unmatched or invalid coordinates`);
    }
  }
  for (const n of news) {
    walk(n, n.id);
    if (!sourcesById.has(n.sourceId) || !n.propertyIds.length || !n.evidenceIds.length) errors.push(`${n.id}: incomplete news`);
    n.propertyIds.forEach(id => { if (!propertyIds.has(id)) errors.push(`${n.id}: missing property`); });
    n.evidenceIds.forEach(id => {
      const e = evidenceById.get(id);
      if (!e || !e.sourceIds.includes(n.sourceId) || !e.propertyIds.some(p => n.propertyIds.includes(p))) errors.push(`${n.id}: unsupported news claim`);
    });
  }
  return errors;
}
