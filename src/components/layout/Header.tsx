import Link from "next/link";
import type { Locale } from "@/lib/constants";
import { copy } from "@/lib/copy";
import { Navigation } from "./Navigation";

export function Header({ locale }: { locale: Locale }) {
  const c = copy(locale);
  return (
    <header className="site-header">
      <div className="container">
        <div className="brand-row">
          <Link className="brand" href={`/${locale}`} lang="en">
            <span className="brand-icon">T</span>
            <span>
              Tskaltubo<small>SENIOR LIVING & CARE DEVELOPMENT</small>
            </span>
          </Link>
          <span className="header-status">
            <i />
            {c.status}
          </span>
        </div>
        <Navigation locale={locale} />
      </div>
    </header>
  );
}
