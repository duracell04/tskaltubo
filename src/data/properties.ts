import type { DevelopmentObligation, HistoricalPrice, LocalizedText, Property, PropertyEvent, PropertyNarrative, PropertyQuestion } from "@/types/property";
import { identities, auditIdentityMapping } from "./property-identities";
import { evidence, scheduleIds } from "./evidence";
import { date, known, text3, unknown } from "./research-helpers";

const assetScope = text3("Named property; exact parcel/package scope unconfirmed", "Benanntes Objekt; genauer Parzellen-/Paketumfang unbestätigt", "დასახელებული ობიექტი; ნაკვეთის/პაკეტის ზუსტი მოცულობა დაუდასტურებელია");
const hotelUse = text3("Hotel", "Hotel", "სასტუმრო");
const unknownUse = text3("Confirm permitted use and current conditions with NASP", "Zulässige Nutzung und heutige Bedingungen bei NASP bestätigen", "დანიშნულება და მიმდინარე პირობები გადაამოწმეთ NASP-თან");
function price(amount: number, at: string, evidenceId: string, kind: HistoricalPrice["kind"] = "asking", currency: "GEL" | "USD" = "GEL", scope = assetScope): HistoricalPrice {
  return { kind, price: known({ amount, currency }, evidenceId), effectiveAt: date(at), scope, taxTreatment: "unknown" };
}
function obligation(evidenceId: string, at: string, amount: number | null, requiredUse = unknownUse, capacity: DevelopmentObligation["capacity"] = null, deadline: LocalizedText | null = null): DevelopmentObligation {
  return { evidenceIds: [evidenceId], effectiveAt: date(at), minimumInvestment: amount === null ? null : { amount, currency: "GEL" }, investmentComparison: "at_least", requiredUse, capacity, deadline, conditions: null, taxTreatment: "unknown" };
}
function event(evidenceId: string, kind: PropertyEvent["kind"]): PropertyEvent {
  const e = evidence.find(e => e.id === evidenceId)!;
  return { id: evidenceId, kind, at: e.effectiveAt, evidenceIds: [e.id], description: e.claim };
}
function question(id: string, question: LocalizedText, action: LocalizedText, evidenceIds: string[] = []): PropertyQuestion {
  return { id, question, action, evidenceIds };
}
const registryAction = text3("Obtain fresh real-estate, business and restrictions extracts; identify the authorized seller and obtain dated availability and terms.", "Aktuelle Immobilien-, Unternehmens- und Beschränkungsregisterauszüge beschaffen; Verkaufsbefugnis sowie datierte Verfügbarkeit und Bedingungen bestätigen.", "მოიპოვეთ უძრავი ქონების, ბიზნესისა და შეზღუდვების ახალი ამონაწერები; დაადგინეთ უფლებამოსილი გამყიდველი და დათარიღებული ხელმისაწვდომობა და პირობები.");
const naspAction = text3("Ask NASP for the current parcel schedule, disposal authority, auction outcome, obligations and responsible contact; obtain a fresh title extract.", "NASP nach aktuellen Parzellen, Verfügungsbefugnis, Auktionsergebnis, Auflagen und zuständigem Kontakt fragen; aktuellen Registerauszug beschaffen.", "NASP-ს მოსთხოვეთ ნაკვეთების მიმდინარე სია, გასხვისების უფლებამოსილება, აუქციონის შედეგი, ვალდებულებები და პასუხისმგებელი პირი; მოიპოვეთ ახალი ამონაწერი.");
const schedule: Readonly<Record<string, readonly [number | null, number | null]>> = {
  megobroba: [5232300, 15696900], savane: [2123400, 7000000], intouristi: [2988000, null],
  philiali: [2179000, 6537000], rkinigzeli: [5131000, 9273600], imereti: [3124500, 9373500],
  geologist: [1422000, 4266000], gelati: [1969300, 5907900], aia: [2802300, 8406900],
  medea: [5820000, 10000000], tsiskari: [null, null],
};

function base(id: string, canonicalName: string, georgianName: string, alternativeNames: readonly string[]): Property {
  const offered = scheduleIds.includes(id);
  const state = offered || ["meshakhte", "sinatle"].includes(id);
  const scheduleEvidence = `${id}-schedule`;
  const terms = schedule[id];
  return {
    id, slug: id, canonicalName, georgianName, alternativeNames, identityEvidenceIds: [`${id}-identity`],
    assetType: id === "legends" ? "military_complex" : id === "intouristi" ? "hotel" : "sanatorium",
    address: unknown(), coordinates: unknown(), cadastralIds: auditIdentityMapping[id] ? known([auditIdentityMapping[id]], `${id}-audit`) : unknown(),
    ownership: offered ? known({ kind: "state", ownerName: null }, scheduleEvidence) : unknown(), ownershipVerification: offered ? "reported" : "unknown",
    roles: [], development: unknown(), operatingStatus: unknown(), observedScope: null,
    availability: { kind: offered ? "historical_offer" : "unknown", evidenceIds: offered ? [scheduleEvidence] : [], confirmedAt: null, validUntil: null, authorizedParty: null },
    memberships: [
      { portfolioId: "historic", evidenceIds: [`${id}-identity`], at: date("2021-09-11") },
      ...(auditIdentityMapping[id] ? [{ portfolioId: "audit-shortlist", evidenceIds: [`${id}-audit`], at: date("2026-09-06") }] : []),
      ...(offered ? [{ portfolioId: "state-offers-2025", evidenceIds: [scheduleEvidence], at: date("2025-09-24") }] : []),
    ],
    plotAreaM2: unknown(), grossBuildingAreaM2: unknown(), usableBuildingAreaM2: unknown(), condition: unknown(), occupancy: unknown(), media: [],
    historicalPrices: terms && terms[0] !== null ? [price(terms[0], "2025-09-24", scheduleEvidence)] : [],
    obligations: terms ? [obligation(scheduleEvidence, "2025-09-24", terms[1])] : [],
    events: offered ? [event(scheduleEvidence, "offer")] : [],
    questions: [question("title-and-availability", text3("Who can legally sell this property, and on what current terms?", "Wer darf dieses Objekt verkaufen, und zu welchen aktuellen Bedingungen?", "ვის აქვს ამ ქონების გაყიდვის უფლება და რა მიმდინარე პირობებით?"), state ? naspAction : registryAction)],
    inquiryRoute: state ? "nasp" : "registry_then_owner",
  };
}

const patches: Readonly<Record<string, (p: Property) => Property>> = {
  rkinigzeli: p => ({ ...p,
    address: known(text3("51 Rustaveli Street", "Rustaveli-Straße 51", "რუსთაველის ქუჩა 51"), "rkinigzeli-auction"),
    plotAreaM2: known(33000, "rkinigzeli-auction"),
    historicalPrices: [...p.historicalPrices, price(5135000, "2024-06-11", "rkinigzeli-auction", "auction_reserve")],
    obligations: [...p.obligations, obligation("rkinigzeli-auction", "2024-06-11", 9273600, hotelUse, { value: 120, unit: "rooms" })],
    events: [...p.events, event("rkinigzeli-auction", "offer")],
    questions: [question("price-discrepancy", text3("Do the different published auction and offered values reflect revised terms or a reporting error?", "Beruhen die unterschiedlichen veröffentlichten Werte auf neuen Bedingungen oder einem Berichtsfehler?", "განსხვავებული გამოქვეყნებული ფასები შეცვლილ პირობებს ასახავს თუ შეცდომას?"), naspAction, ["rkinigzeli-auction", "rkinigzeli-schedule"]), ...p.questions],
  }),
  imereti: p => ({ ...p,
    address: known(text3("Adjacent to 6 Chakhrukhadze Street", "Bei Chakhrukhadze-Straße 6", "ჩახრუხაძის ქუჩა 6-ის მიმდებარედ"), "imereti-auction"),
    plotAreaM2: known(41150, "imereti-auction"),
    historicalPrices: [...p.historicalPrices, price(3124500, "2024-06-11", "imereti-auction", "auction_reserve")],
    obligations: [...p.obligations, { ...obligation("imereti-auction", "2024-06-11", 9373500, hotelUse, { value: 80, unit: "rooms" }), investmentComparison: "more_than" }],
    events: [...p.events, event("imereti-auction", "offer")],
  }),
  savane: p => ({ ...p,
    historicalPrices: [...p.historicalPrices, price(2123400, "2024-09-20", "savane-failed", "auction_reserve")],
    obligations: [...p.obligations, { ...obligation("savane-failed", "2024-09-20", 6370200, hotelUse, { value: 100, unit: "rooms" }, text3("Within 60 months of signing the contract", "Binnen 60 Monaten nach Vertragsunterzeichnung", "ხელშეკრულების გაფორმებიდან 60 თვეში")), taxTreatment: "excluding_vat" }],
    events: [...p.events, event("savane-failed", "offer")],
    questions: [question("successive-terms", text3("Which investment conditions now apply after the failed auction and later schedule?", "Welche Investitionsbedingungen gelten nach erfolgloser Auktion und späterer Liste?", "რომელი საინვესტიციო პირობები მოქმედებს უშედეგო აუქციონისა და შემდგომი სიის შემდეგ?"), naspAction, ["savane-failed", "savane-schedule"]), ...p.questions],
  }),
  intouristi: p => ({ ...p, obligations: [{ ...p.obligations[0]!, conditions: text3("The schedule cites an older demolition condition; present permission and terms unconfirmed.", "Die Liste nennt eine ältere Abrissbedingung; heutige Genehmigung und Bedingungen unbestätigt.", "სიაში მითითებულია ძველი დემონტაჟის პირობა; მიმდინარე ნებართვა და პირობები დაუდასტურებელია.") }],
    questions: [question("distinct-identity", text3("Confirm the Intourist parcels independently of Sanatorium Tskaltubo and Legends.", "Intourist-Parzellen getrennt von Sanatorium Tskaltubo und Legends bestätigen.", "ინტურისტის ნაკვეთები სანატორიუმ წყალტუბოსა და ლეგენდსისგან დამოუკიდებლად გადაამოწმეთ."), naspAction, ["intouristi-audit", "intouristi-schedule"]), ...p.questions] }),
  megobroba: p => ({ ...p, obligations: [...p.obligations, obligation("megobroba-use", "2025-09-23", null, text3("Diagnostic and rehabilitation centre", "Diagnostik- und Rehabilitationszentrum", "დიაგნოსტიკური და სარეაბილიტაციო ცენტრი"), { value: 100, unit: "beds" })],
    questions: [question("care-use", text3("Does the required use permit the proposed senior-living and care model?", "Erlaubt die vorgeschriebene Nutzung das geplante Seniorenwohn- und Pflegemodell?", "იძლევა სავალდებულო დანიშნულება ხანდაზმულთა საცხოვრებლისა და მოვლის მოდელის საშუალებას?"), naspAction, ["megobroba-use"]), ...p.questions] }),
  "tskaltubo-rustaveli-48": p => ({ ...p,
    identityEvidenceIds: [...p.identityEvidenceIds, "tskaltubo-sale"],
    address: known(text3("48 Shota Rustaveli Street", "Shota-Rustaveli-Straße 48", "შოთა რუსთაველის ქუჩა 48"), "tskaltubo-sale"),
    ownership: known({ kind: "private", ownerName: "Golden Towers LLC" }, "tskaltubo-sale"), ownershipVerification: "official_historical",
    roles: [{ role: "historical_buyer", name: "Golden Towers LLC", evidenceIds: ["tskaltubo-sale"] }],
    historicalPrices: [price(2600000, "2023-09-07", "tskaltubo-sale", "transaction"), price(11262000, "2023", "tskaltubo-rustaveli-48-sale-report", "transaction", "GEL", text3("Reported acquired real estate; possible broader package, unconfirmed", "Berichteter Immobilienerwerb; möglicherweise größeres Paket, unbestätigt", "გავრცელებული შეძენილი უძრავი ქონება; შესაძლოა უფრო ფართო პაკეტი, დაუდასტურებელი"))],
    obligations: [{ ...obligation("tskaltubo-sale", "2023-09-07", 7800000, text3("Hotel and catering facilities", "Hotel und Gastronomie", "სასტუმრო და კვების ობიექტები"), { value: 100, unit: "rooms" }, text3("Within 60 months of contract signing", "Binnen 60 Monaten nach Vertragsunterzeichnung", "ხელშეკრულების გაფორმებიდან 60 თვეში")), investmentComparison: "more_than" }],
    events: [event("tskaltubo-sale", "ownership"), event("tskaltubo-rustaveli-48-sale-report", "ownership")],
    questions: [question("transaction-scope", text3("Why do the official and reported transaction amounts differ? Is a larger property package involved?", "Warum unterscheiden sich amtlicher und berichteter Kaufpreis? Betrifft ein Wert ein größeres Immobilienpaket?", "რატომ განსხვავდება ოფიციალური და გავრცელებული გარიგების თანხები? ეხება თუ არა ერთი მათგანი უფრო ფართო პაკეტს?"), text3("Ask NASP for sale contracts and a parcel-by-parcel reconciliation of both figures.", "NASP um Kaufverträge und parzellenweisen Abgleich beider Beträge bitten.", "NASP-ს მოსთხოვეთ გაყიდვის ხელშეკრულებები და ორივე თანხის ნაკვეთების მიხედვით შეჯერება."), ["tskaltubo-sale", "tskaltubo-rustaveli-48-sale-report"]), ...p.questions],
  }),
  tbilisi: p => ({ ...p,
    ownership: known({ kind: "private", ownerName: null }, "tbilisi-sale"), ownershipVerification: "reported",
    roles: [{ role: "historical_buyer", name: "Aka Holding", evidenceIds: ["tbilisi-sale"] }, { role: "developer", name: "Aka Holding", evidenceIds: ["tbilisi-works"] }],
    development: known("construction", "tbilisi-works"),
    observedScope: text3("Investor describes facade and courtyard works, with replacement of the rear section.", "Investor beschreibt Fassaden- und Hofarbeiten sowie Ersatz des hinteren Gebäudeteils.", "ინვესტორი აღწერს ფასადისა და ეზოს სამუშაოებს და უკანა ნაწილის ჩანაცვლებას."),
    historicalPrices: [price(3152000, "2022-08", "tbilisi-sale", "transaction")],
    obligations: [obligation("tbilisi-sale", "2022-08", 9430000, hotelUse, { value: 110, unit: "rooms" }, text3("Within 55 months; confirm contractual start date", "Binnen 55 Monaten; vertraglichen Fristbeginn bestätigen", "55 თვეში; გადაამოწმეთ ვადის სახელშეკრულებო დასაწყისი"))],
    events: [event("tbilisi-sale", "ownership"), event("tbilisi-works", "development"), { ...event("tbilisi-works", "forecast"), id: "tbilisi-opening-forecast", description: text3("Investor forecast: opening in 1–1.5 years from April 2026. Not evidence of completion.", "Investorenprognose: Eröffnung 1–1,5 Jahre nach April 2026. Kein Fertigstellungsnachweis.", "ინვესტორის პროგნოზი: გახსნა 2026 წლის აპრილიდან 1–1.5 წელიწადში. დასრულების მტკიცებულება არ არის.") }],
  }),
  metalurgi: p => ({ ...p,
    ownership: known({ kind: "private", ownerName: "Worldfound Universal LLC (reported historical entity)" }, "metalurgi-historic"), ownershipVerification: "reported",
    roles: [{ role: "historical_buyer", name: "Worldfound Universal LLC", evidenceIds: ["metalurgi-historic"] }, { role: "developer", name: "Global Lifestyle", evidenceIds: ["metalurgi-preparation"] }],
    development: known("preparation", "metalurgi-preparation"), occupancy: known("vacant", "metalurgi-preparation"),
    observedScope: text3("Reported vacancy and preparation concern the former hotel building; lawful vacant possession is unverified.", "Berichteter Leerstand und Vorbereitung betreffen das ehemalige Hotelgebäude; rechtlich gesicherter Leerbesitz unbestätigt.", "გავრცელებული დაცლა და მომზადება ეხება ყოფილი სასტუმროს შენობას; სამართლებრივად თავისუფალი მფლობელობა დაუდასტურებელია."),
    events: [event("metalurgi-historic", "ownership"), event("metalurgi-preparation", "development")],
  }),
  legends: p => ({ ...p,
    identityEvidenceIds: [...p.identityEvidenceIds, "legends-operation"],
    operatingStatus: known("operating", "legends-operation"),
    roles: [{ role: "operator", name: "Legends Tskaltubo Spa Resort (brand)", evidenceIds: ["legends-operation"] }],
    observedScope: text3("Listed guest accommodation only; renovation of every wing and land ownership are not established.", "Nur die gelistete Gästeunterkunft; Sanierung aller Flügel und Grundeigentum sind nicht belegt.", "მხოლოდ ჩამოთვლილი სტუმრების განთავსება; ყველა ფლიგელის განახლება და მიწის საკუთრება დაუდგენელია."),
    events: [event("legends-operation", "development")],
  }),
  sinatle: p => ({ ...p, ownership: known({ kind: "state", ownerName: null }, "sinatle-state"), ownershipVerification: "reported", events: [event("sinatle-state", "ownership")],
    questions: [question("portfolio-omission", text3("Why is Sinatle absent from the later sale schedule?", "Warum fehlt Sinatle in der späteren Verkaufsliste?", "რატომ არ არის სინათლე შემდგომ გაყიდვის სიაში?"), naspAction, ["sinatle-state"]), ...p.questions] }),
};

export const properties: readonly Property[] = identities.map(([id, name, ka, aliases]) => {
  let p = base(id, name, ka, aliases);
  if (patches[id]) p = patches[id](p);
  if (["medea", "meshakhte", "tsiskari"].includes(id)) {
    const ev = `${id}-reversion`;
    p = { ...p, ownership: known({ kind: "state", ownerName: null }, ev), ownershipVerification: "reported", development: known("requires_rehabilitation", ev), condition: known("requires_rehabilitation", ev), events: [...p.events, event(ev, "ownership")] };
  }
  if (id === "medea") p = { ...p, historicalPrices: [...p.historicalPrices, price(5830000, "2022-08", "medea-sale", "transaction")], roles: [{ role: "historical_buyer", name: "Asi Group Hotels Georgia", evidenceIds: ["medea-sale"] }], events: [...p.events, event("medea-sale", "ownership"), event("medea-return-date", "ownership")] };
  if (id === "meshakhte") p = { ...p, historicalPrices: [price(2500000, "2015-07-20", "meshakhte-historic", "transaction", "USD")], roles: [{ role: "historical_buyer", name: "KBP Tbilisi LLC", evidenceIds: ["meshakhte-historic"] }], events: [...p.events, event("meshakhte-historic", "ownership")] };
  if (id === "tsiskari") p = { ...p, historicalPrices: [price(150000, "2016-06-23", "tsiskari-historic", "transaction")], roles: [{ role: "historical_buyer", name: "Nita LLC", evidenceIds: ["tsiskari-historic"] }], events: [...p.events, event("tsiskari-historic", "ownership")] };
  const privateHistory: Record<string, [string, string, number | null, string]> = {
    iveria: ["Iveria Palace LLC", "iveria-historic", 500000, "2018-03-06"],
    rioni: ["Baden LLC", "rioni-historic", null, "2020-11"],
    sakartvelo: ["Sanatorium Sakartvelo LLC", "sakartvelo-historic", null, "2021-09-11"],
    ushishroeba: ["Tandem Estate LLC", "ushishroeba-sale-report", 8470000, "2023"],
    samgurali: ["Harmonia Tskaltubo LLC", "samgurali-sale-report", 2043000, "2023"],
  };
  const history = privateHistory[id];
  if (history) {
    const [owner, ev, amount, at] = history;
    p = { ...p, ownership: known({ kind: "private", ownerName: owner }, ev), ownershipVerification: "reported", roles: [{ role: id === "sakartvelo" ? "reported_owner" : "historical_buyer", name: owner, evidenceIds: [ev] }], historicalPrices: amount === null ? [] : [price(amount, at, ev, "transaction")], events: [event(ev, "ownership")] };
  }
  if (id === "ushishroeba") p = { ...p, obligations: [obligation("ushishroeba-sale-report", "2023", null, text3("Rehabilitation centre", "Rehabilitationszentrum", "სარეაბილიტაციო ცენტრი"), { value: 40, unit: "people" })] };
  if (id === "samgurali") p = { ...p, obligations: [obligation("samgurali-sale-report", "2023", null, text3("Hotel or residential apartments", "Hotel oder Wohnapartments", "სასტუმრო ან საცხოვრებელი აპარტამენტები"))] };
  return p;
});

/** Narratives refer to sourced records rather than duplicating financial values. */
export const propertyNarratives: readonly PropertyNarrative[] = properties.flatMap(p => (["en", "de", "ka"] as const).map(locale => ({
  propertyId: p.id, locale,
  summary: text3("Explore the dated property record and the questions still requiring verification.", "Datierte Objektdaten und noch zu prüfende Fragen.", "გაეცანით ობიექტის დათარიღებულ მონაცემებსა და გადასამოწმებელ საკითხებს.")[locale],
  legalStatus: p.questions[p.questions.length - 1]!.action[locale], building: p.observedScope?.[locale] ?? "",
  possibleUses: "", mediaAlt: {}, translationStatus: locale === "en" ? "reviewed" : "draft",
})));
