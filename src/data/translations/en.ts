import type { Dictionary } from "./schema";

export const en: Dictionary = {
  siteName: "Tskaltubo Sanatorium Opportunity Explorer",
  siteDescription: "Properties, redevelopment concepts and business-case analysis.",
  navigationLabel: "Main navigation",
  languageLabel: "Language",
  skipToContent: "Skip to content",
  phaseLabel: "Research framework · In preparation",
  footer: "Research and modelling are in preparation. No property assessments or financial results are published yet.",
  translationNotice: null,
  nav: { home: "Home", sanatoriums: "Sanatoriums", compare: "Compare", scenarios: "Business cases", methodology: "Methodology" },
  pages: {
    home: {
      title: "Tskaltubo Sanatoriums",
      description: "Properties, redevelopment concepts and business-case analysis.",
      emptyTitle: "A framework for careful research",
      emptyDescription: "Property facts, possible business concepts and target markets will be examined separately. The research inventory has not been populated yet.",
    },
    sanatoriums: {
      title: "Sanatoriums",
      description: "The physical properties and the evidence behind them.",
      emptyTitle: "Property research is in preparation",
      emptyDescription: "No property records have been added. Ownership, areas, condition and historical prices will appear here once documented with sources.",
    },
    compare: {
      title: "Compare properties",
      description: "Examine properties side by side before selecting a business concept.",
      emptyTitle: "Comparison awaits the property inventory",
      emptyDescription: "Property selection and comparison will become available after the research records have been added.",
    },
    scenarios: {
      title: "Business cases",
      description: "Explore operating concepts independently of the physical properties.",
      emptyTitle: "Business concepts are in preparation",
      emptyDescription: "No presets or financial assumptions have been added. Assisted living and long-term nursing will remain distinct service models.",
    },
    methodology: {
      title: "Methodology & sources",
      description: "Make the distinction between evidence, uncertainty and assumptions visible.",
      emptyTitle: "The evidence register is not populated yet",
      emptyDescription: "Each claim will identify its source category, effective date and verification status. Missing information will stay unknown; historical evidence will retain its original date.",
    },
  },
  map: { title: "Property map", description: "The map will be added after property locations have been researched. No locations are shown yet." },
  calculator: { title: "Financial calculator", description: "The calculator is not implemented yet. Financial assumptions and calculations will follow the property and business-concept research." },
  notFound: { title: "Page not found", description: "This page or property record is not available.", back: "Return home" },
};
