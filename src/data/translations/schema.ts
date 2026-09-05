import type { Section } from "@/lib/constants";

export interface PageCopy {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
}

export interface Dictionary {
  siteName: string;
  siteDescription: string;
  navigationLabel: string;
  languageLabel: string;
  skipToContent: string;
  phaseLabel: string;
  footer: string;
  translationNotice: string | null;
  nav: Record<Section, string>;
  pages: Record<Section, PageCopy>;
  map: { title: string; description: string };
  calculator: { title: string; description: string };
  notFound: { title: string; description: string; back: string };
}
