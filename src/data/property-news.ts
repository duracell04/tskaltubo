import type { PropertyNews } from "@/types/property";
import { date, text3 } from "./research-helpers";
import { scheduleIds } from "./evidence";

export const propertyNews: readonly PropertyNews[] = [
  { id: "reversions-june-2026", propertyIds: ["medea", "meshakhte", "tsiskari"], sourceId: "reversions-2026", publishedAt: date("2026-06-17"), eventAt: null,
    title: text3("Three properties reported back in state ownership", "Drei Objekte laut Bericht wieder in Staatseigentum", "სამი ობიექტი, გავრცელებული ცნობით, კვლავ სახელმწიფო საკუთრებაშია"),
    summary: text3("KutaisiPost reports reversions and outstanding rehabilitation. Fresh registry extracts are still needed.", "KutaisiPost berichtet über Rückübertragungen und ausstehende Sanierung. Aktuelle Registerauszüge fehlen weiterhin.", "ქუთაისიპოსტი დაბრუნებებსა და ჩასატარებელ რეაბილიტაციაზე წერს. კვლავ საჭიროა რეესტრის ახალი ამონაწერები."),
    evidenceIds: ["medea-reversion", "meshakhte-reversion", "tsiskari-reversion"] },
  { id: "metalurgi-june-2026", propertyIds: ["metalurgi"], sourceId: "metalurgi-2026", publishedAt: date("2026-06-10"), eventAt: null,
    title: text3("Metalurgi redevelopment preparation reported", "Vorbereitung der Metalurgi-Sanierung berichtet", "გავრცელდა ცნობა მეტალურგის განახლების მომზადების შესახებ"),
    summary: text3("Georgia Today describes Global Lifestyle’s preparation for a hotel conversion. Completed operation is not established.", "Georgia Today beschreibt Global Lifestyles Vorbereitung eines Hotelumbaus. Ein fertiger Hotelbetrieb ist nicht belegt.", "Georgia Today აღწერს Global Lifestyle-ის მიერ სასტუმროდ გადაკეთების მომზადებას. დასრულებული ოპერირება დაუდასტურებელია."),
    evidenceIds: ["metalurgi-preparation"] },
  { id: "tbilisi-april-2026", propertyIds: ["tbilisi"], sourceId: "tbilisi-2026", publishedAt: date("2026-04-01"), eventAt: date("2026-04-01"),
    title: text3("Aka Holding reports ongoing works at Tbilisi", "Aka Holding berichtet über laufende Arbeiten an Tbilisi", "Aka Holding თბილისის მიმდინარე სამუშაოებზე საუბრობს"),
    summary: text3("BMG attributes the construction update and opening forecast to the investor; the forecast is not completion evidence.", "BMG schreibt Baufortschritt und Eröffnungsprognose dem Investor zu; die Prognose ist kein Fertigstellungsnachweis.", "BMG მშენებლობის განახლებასა და გახსნის პროგნოზს ინვესტორს მიაწერს; პროგნოზი დასრულების მტკიცებულება არ არის."),
    evidenceIds: ["tbilisi-works"] },
  { id: "offers-september-2025", propertyIds: scheduleIds, sourceId: "schedule-2025", publishedAt: date("2025-09-24"), eventAt: null,
    title: text3("Dated state-offer price schedule published", "Datierte Preisliste staatlicher Angebote veröffentlicht", "გამოქვეყნდა სახელმწიფო შეთავაზებების დათარიღებული ფასების სია"),
    summary: text3("BMG published agency-supplied values and obligations. These remain historical offers until current terms are confirmed.", "BMG veröffentlichte von der Behörde gelieferte Werte und Auflagen. Bis zur Bestätigung aktueller Bedingungen bleiben dies historische Angebote.", "BMG-მ სააგენტოს მიერ მოწოდებული ფასები და ვალდებულებები გამოაქვეყნა. მიმდინარე პირობების დადასტურებამდე ეს ისტორიული შეთავაზებებია."),
    evidenceIds: scheduleIds.map(id => `${id}-schedule`) },
  { id: "savane-september-2024", propertyIds: ["savane"], sourceId: "savane-2024", publishedAt: date("2024-09-20"), eventAt: null,
    title: text3("Savane auction reportedly found no buyer", "Savane-Auktion laut Bericht ohne Käufer", "გავრცელებული ცნობით სავანეს აუქციონს მყიდველი არ გამოუჩნდა"),
    summary: text3("Commersant describes the unsuccessful auction and its conditions. Later investment terms differ.", "Commersant beschreibt die erfolglose Auktion und ihre Bedingungen. Spätere Investitionsauflagen weichen ab.", "კომერსანტი აღწერს უშედეგო აუქციონსა და მის პირობებს. მოგვიანებით საინვესტიციო პირობები განსხვავდება."),
    evidenceIds: ["savane-failed"] },
];
