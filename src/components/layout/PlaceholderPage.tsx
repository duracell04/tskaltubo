import type { ReactNode } from "react";
import type { PageCopy } from "@/data/translations/schema";

export function PlaceholderPage({ copy, phaseLabel, children }: { copy: PageCopy; phaseLabel: string; children?: ReactNode }) {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">{phaseLabel}</p>
        <h1>{copy.title}</h1>
        <p className="lede">{copy.description}</p>
      </div>
      <section className="empty-state">
        <h2>{copy.emptyTitle}</h2>
        <p>{copy.emptyDescription}</p>
      </section>
      {children}
    </>
  );
}
