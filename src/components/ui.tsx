import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/constants";
import { copy } from "@/lib/copy";
export function RichText({ children }: { children: string }) {
  return (
    <div className="prose" lang="en">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="table-scroll">
              <table>{children}</table>
            </div>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              rel={href?.startsWith("http") ? "noreferrer" : undefined}
            >
              {children}
            </a>
          ),
        }}
      >
        {children}
      </Markdown>
    </div>
  );
}
export function Tag({
  kind = "unknown",
  verified = false,
  locale = "en",
}: {
  kind?: string;
  verified?: boolean;
  locale?: Locale;
}) {
  const c = copy(locale);
  const label =
    kind === "official"
      ? verified
        ? c.official
        : "Official source · unverified"
      : kind === "derived"
        ? c.derived
        : kind === "assumption"
          ? c.assumption
          : kind === "market_field"
            ? c.signal
            : c.unknown;
  return <span className={`tag tag-${kind}`}>{label}</span>;
}
export function SourceNote({
  locator,
  locale = "en",
  source = "audit-2026",
}: {
  locator: string;
  locale?: Locale;
  source?: string;
}) {
  return (
    <div className="source-note">
      <Link href={`/${locale}/evidence?kind=source#${source}`}>
        {copy(locale).source}:{" "}
        {source === "strategy-matrix" ? "Concept matrix" : "Integrated audit"} ·
        § {locator}
      </Link>
      <span>6 Sep 2026 · not independently verified</span>
    </div>
  );
}
export function Heading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string | undefined;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow ?? "TSKALTUBO / INVESTMENT MEMO"}</p>
        <h1>{title}</h1>
        {description && <p className="lede">{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`panel ${className}`}>{children}</section>;
}
