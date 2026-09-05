import type { Dictionary } from "./schema";

export const de: Dictionary = {
  siteName: "Tskaltubo Sanatorium Opportunity Explorer",
  siteDescription: "Immobilien, Nutzungskonzepte und Wirtschaftlichkeitsanalyse.",
  navigationLabel: "Hauptnavigation",
  languageLabel: "Sprache",
  skipToContent: "Zum Inhalt springen",
  phaseLabel: "Recherchegrundlage · In Vorbereitung",
  footer: "Recherche und Modellierung sind in Vorbereitung. Es sind noch keine Immobilienbewertungen oder Finanzergebnisse veröffentlicht.",
  translationNotice: null,
  nav: { home: "Start", sanatoriums: "Sanatorien", compare: "Vergleichen", scenarios: "Geschäftsmodelle", methodology: "Methodik" },
  pages: {
    home: {
      title: "Sanatorien in Tskaltubo",
      description: "Immobilien, Nutzungskonzepte und Wirtschaftlichkeitsanalyse.",
      emptyTitle: "Eine Grundlage für sorgfältige Recherche",
      emptyDescription: "Immobilienfakten, mögliche Geschäftsmodelle und Zielmärkte werden getrennt untersucht. Das Immobilienverzeichnis ist noch nicht befüllt.",
    },
    sanatoriums: {
      title: "Sanatorien",
      description: "Die Immobilien und die zugehörigen Belege.",
      emptyTitle: "Die Immobilienrecherche wird vorbereitet",
      emptyDescription: "Es wurden noch keine Immobilien erfasst. Eigentum, Flächen, Zustand und historische Preise erscheinen hier, sobald sie mit Quellen dokumentiert sind.",
    },
    compare: {
      title: "Immobilien vergleichen",
      description: "Immobilien gegenüberstellen, bevor ein Geschäftsmodell ausgewählt wird.",
      emptyTitle: "Der Vergleich wartet auf das Immobilienverzeichnis",
      emptyDescription: "Auswahl und Vergleich werden verfügbar, sobald die recherchierten Immobilien erfasst sind.",
    },
    scenarios: {
      title: "Geschäftsmodelle",
      description: "Betriebskonzepte unabhängig von den Immobilien untersuchen.",
      emptyTitle: "Die Geschäftskonzepte werden vorbereitet",
      emptyDescription: "Es wurden noch keine Szenarien oder finanziellen Annahmen hinterlegt. Betreutes Wohnen / Betreuung und stationäre Pflege / Langzeitpflege bleiben eigenständige Leistungsmodelle.",
    },
    methodology: {
      title: "Methodik & Quellen",
      description: "Belege, Unsicherheiten und Annahmen nachvollziehbar unterscheiden.",
      emptyTitle: "Das Quellenverzeichnis ist noch nicht befüllt",
      emptyDescription: "Jede Aussage erhält eine Quellenkategorie, einen Bezugszeitpunkt und einen Prüfstatus. Fehlende Informationen bleiben unbekannt; historische Belege behalten ihr ursprüngliches Datum.",
    },
  },
  map: { title: "Immobilienkarte", description: "Die Karte folgt nach der Recherche der Standorte. Es werden noch keine Standorte angezeigt." },
  calculator: { title: "Wirtschaftlichkeitsrechner", description: "Der Rechner ist noch nicht implementiert. Finanzielle Annahmen und Berechnungen folgen nach der Recherche zu Immobilien und Geschäftskonzepten." },
  notFound: { title: "Seite nicht gefunden", description: "Diese Seite oder dieser Immobiliendatensatz ist nicht verfügbar.", back: "Zur Startseite" },
};
