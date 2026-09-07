"use client";
import { useState } from "react";
import type { Locale } from "@/lib/constants";
import { propertyCopy } from "@/lib/property-copy";
import { naspRequest } from "@/data/nasp-request";
export function NaspRequest({ locale }: { locale: Locale }) {
  const c = propertyCopy(locale);
  const [message, setMessage] = useState("");
  return <section id="nasp-request" className="request-panel">
    <h2>{c.request}</h2>
    <p><a href="https://nasp.gov.ge/pages/?page_id=143" target="_blank" rel="noreferrer">NASP · {c.source} ↗</a></p>
    <textarea aria-label={c.request} readOnly value={naspRequest[locale]} rows={12} />
    <button className="button" onClick={async () => {
      try { await navigator.clipboard.writeText(naspRequest[locale]); setMessage(c.copied); }
      catch { setMessage(c.copyFailed); }
    }}>{c.copy}</button><span className="small" role="status">{message}</span>
    <p className="small muted">{c.privateSteps}</p>
  </section>;
}
