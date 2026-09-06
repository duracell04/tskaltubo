"use client";
import { useMemo, useState } from "react";
import {
  calculateAnnual,
  reportExample,
  emptyAnnual,
  reportCases,
  type ReportCase,
} from "@/lib/annual-finance";
import type { AnnualInput, AnnualService, Value } from "@/types/annual-finance";
import { useQuery } from "@/lib/use-query";
import { seed } from "@/lib/research-data";
import type { Locale } from "@/lib/constants";
import { SourceNote, Stat } from "../ui";
const money = (n: Value) =>
  n === null
    ? "Unknown"
    : new Intl.NumberFormat("en", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(n);
const pct = (n: Value) => (n === null ? "Unknown" : `${(n * 100).toFixed(2)}%`);
function NumberField({
  label,
  value,
  onChange,
  percent = false,
}: {
  label: string;
  value: Value;
  onChange: (n: Value) => void;
  percent?: boolean;
}) {
  return (
    <label className="field">
      {label}
      <input
        type="number"
        min="0"
        max={percent ? 100 : undefined}
        step="any"
        value={
          value === null ? "" : Number((value * (percent ? 100 : 1)).toFixed(6))
        }
        placeholder="Unknown"
        onChange={(e) =>
          onChange(
            e.target.value === ""
              ? null
              : Number(e.target.value) / (percent ? 100 : 1),
          )
        }
      />
    </label>
  );
}
function propertyExample(id: string, concept = "TSK-S7") {
  const p = seed.assets.find((a) => a.id === id),
    m = emptyAnnual(concept);
  if (!p) return m;
  const match = /^EUR ([\d.]+)m$/.exec(p.historicalValue);
  return {
    ...m,
    propertyId: id,
    acquisition: match ? Number(match[1]) * 1e6 : null,
    provenance: `${p.name}: historical value ${p.historicalValue}, audit §8.2 dated 6 September 2026; not a current offer or valuation. No measured gross building area or validated operating assumptions are supplied. Land area is not building area. ${match ? "Historical amount copied for exploration." : "Historical range requires an explicit user choice; acquisition is blank."}`,
  };
}
export function AnnualCalculator({ locale }: { locale: Locale }) {
  const q = useQuery(),
    property = q.get("property"),
    concept = q.get("concept");
  const initial =
    property && seed.assets.some((a) => a.id === property)
      ? propertyExample(property, concept ?? "TSK-S7")
      : concept && seed.concepts.some((c) => c.id === concept)
        ? emptyAnnual(concept)
        : reportExample();
  return (
    <Calculator
      key={`${property}-${concept}`}
      locale={locale}
      initial={initial}
    />
  );
}
function Calculator({
  locale,
  initial,
}: {
  locale: Locale;
  initial: AnnualInput;
}) {
  const [selected, setSelected] = useState<ReportCase>("base"),
    [model, setModel] = useState<AnnualInput>(initial),
    [edited, setEdited] = useState(false);
  const result = useMemo(() => calculateAnnual(model), [model]),
    screen = useMemo(
      () => calculateAnnual(reportExample(selected)),
      [selected],
    );
  const last = result.annual[10]!,
    screenYear = screen.annual[1]!;
  function update<K extends keyof AnnualInput>(key: K, value: AnnualInput[K]) {
    setEdited(true);
    setModel((m) => ({ ...m, [key]: value }));
  }
  function service(i: number, change: Partial<AnnualService>) {
    update(
      "services",
      model.services.map((s, j) => (j === i ? { ...s, ...change } : s)),
    );
  }
  function capacity(n: Value) {
    setEdited(true);
    setModel((m) => ({
      ...m,
      capacity: n,
      phases:
        m.phases.length === 1 ? [{ ...m.phases[0]!, capacity: n }] : m.phases,
    }));
  }
  function reset() {
    setModel(
      model.propertyId
        ? propertyExample(model.propertyId, model.conceptId)
        : model.provenance.startsWith("Audit")
          ? reportExample(selected)
          : emptyAnnual(model.conceptId),
    );
    setEdited(false);
  }
  function download() {
    const rows = [
      [
        "Year",
        "Capacity",
        "Revenue EUR",
        "Opex EUR",
        "EBITDA EUR",
        "EBITDA margin",
        "Maintenance EUR",
        "Operating cash EUR",
        "Investment EUR",
        "Project cash EUR",
        "Cumulative cash EUR",
        "Cash yield",
      ],
      ...result.annual.map((r) => [
        r.year,
        r.capacity,
        r.revenue,
        r.opex,
        r.ebitda,
        r.margin,
        r.maintenance,
        r.operatingCash,
        r.expenditure,
        r.projectCash,
        r.cumulative,
        r.cashYield,
      ]),
    ];
    const blob = new Blob(
        [rows.map((r) => r.map((v) => v ?? "").join(",")).join("\n")],
        { type: "text/csv" },
      ),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "tskaltubo-annual-results.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const field = (
    key:
      | "acquisition"
      | "area"
      | "renovation"
      | "ffe"
      | "medical"
      | "hydro"
      | "soft"
      | "contingency"
      | "preOpening"
      | "workingCapital"
      | "transaction"
      | "ancillary"
      | "margin"
      | "fixed"
      | "maintenance"
      | "fx",
    label: string,
    percent = false,
  ) => (
    <NumberField
      key={key}
      label={label}
      value={model[key]}
      percent={percent}
      onChange={(n) => update(key, n)}
    />
  );
  return (
    <>
      <section className="screening-reference">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ATTRIBUTED REPORT SCREENING</p>
            <h2>The starting example</h2>
          </div>
          <label>
            Report case
            <select
              value={selected}
              onChange={(e) => {
                const v = e.target.value as ReportCase;
                setSelected(v);
                setModel(reportExample(v));
                setEdited(false);
              }}
            >
              {Object.keys(reportCases).map((k) => (
                <option key={k} value={k}>
                  {k[0]!.toUpperCase() + k.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p>
          140 beds: 98 long-term care and 42 rehabilitation / short stays.
          Assumed margins, not a staffing-derived budget. This named
          configuration draws on S7, S4 and S6 without redefining them.
        </p>
        <div className="stats-row">
          <Stat label="Report investment" value={money(screen.investment)} />
          <Stat label="Annual revenue" value={money(screenYear.revenue)} />
          <Stat
            label="Operating cash before tax"
            value={money(screenYear.operatingCash)}
          />
          <Stat
            label="Stabilized cash yield"
            value={pct(screenYear.cashYield)}
            note="Not IRR"
          />
        </div>
        <SourceNote locator="11.5–11.10" locale={locale} />
      </section>
      <section className="calculator">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR TEN-YEAR WORKSHEET</p>
            <h2>Change the assumptions</h2>
          </div>
          <button className="button secondary" onClick={reset}>
            Reset assumptions
          </button>
        </div>
        <p className="notice">
          Year 0 investment; ten annual operating periods. Flat prices and
          occupancy unless edited. No tax, financing, inflation, resale value or
          automatic working-capital recovery. Changes stay on this page and
          reset on reload.
        </p>
        <div className="toolbar">
          <label>
            Property
            <select
              value={model.propertyId ?? ""}
              onChange={(e) => {
                setModel(
                  e.target.value
                    ? propertyExample(e.target.value, model.conceptId)
                    : reportExample(selected),
                );
                setEdited(false);
              }}
            >
              <option value="">Report illustration — no specific asset</option>
              {seed.assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Business concept
            <select
              value={
                model.provenance.startsWith("Audit")
                  ? "report"
                  : model.conceptId
              }
              onChange={(e) => {
                setModel(
                  e.target.value === "report"
                    ? reportExample(selected)
                    : model.propertyId
                      ? propertyExample(model.propertyId, e.target.value)
                      : emptyAnnual(e.target.value),
                );
                setEdited(false);
              }}
            >
              <option value="report">
                Report care + rehabilitation configuration
              </option>
              {seed.concepts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} · {c.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <details className="assumption-source">
          <summary>
            Source and limitations{" "}
            {edited ? "· assumptions edited locally" : ""}
          </summary>
          <p>{model.provenance}</p>
          <p>
            All edited inputs are your assumptions. Calculations do not verify
            prices, clinical suitability or staffing safety. Annual personnel
            and variable costs below are per occupied unit-year.
          </p>
        </details>
        <div className="live-summary" aria-label="Live calculation summary" aria-live="polite">{result.issues.length?<strong>Correct invalid assumptions below</strong>:<><span>Investment <strong>{money(result.investment)}</strong></span><span>Year 10 revenue <strong>{money(last.revenue)}</strong></span><span>Operating cash <strong>{money(last.operatingCash)}</strong></span><span>Cash yield <strong>{pct(last.cashYield)}</strong></span></>}</div>
        <h3>Property & development</h3>
        <div className="form-grid">
          {field(
            "acquisition",
            model.acquisitionBundled
              ? "Acquisition + transaction (bundled)"
              : "Acquisition price",
          )}
          <label>
            Acquisition currency
            <select
              value={model.currency}
              onChange={(e) =>
                update("currency", e.target.value as AnnualInput["currency"])
              }
            >
              {["EUR", "GEL", "CHF", "USD"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          {model.currency !== "EUR" && (
            <>
              {field("fx", "EUR per foreign currency unit")}
              <label>
                FX assumption date
                <input
                  type="date"
                  value={model.fxDate}
                  onChange={(e) => update("fxDate", e.target.value)}
                />
              </label>
            </>
          )}
          {field("area", "Gross building area · m²")}
          {field("renovation", "Renovation · EUR / m²")}
          <NumberField
            label="Total capacity · beds / units"
            value={model.capacity}
            onChange={capacity}
          />
        </div>
        <h3>Services & demand</h3>
        <p className="small muted">
          Allocate 100% of capacity across services. Rates are EUR. Monthly
          rates use 12 months; daily rates use 365 days.
        </p>
        {model.services.map((s, i) => (
          <fieldset className="service-editor" key={i}>
            <legend>{s.name}</legend>
            <div className="form-grid">
              <label>
                Service name
                <input
                  value={s.name}
                  onChange={(e) => service(i, { name: e.target.value })}
                />
              </label>
              <NumberField
                label={`${s.name} · capacity share %`}
                percent
                value={s.share}
                onChange={(share) => service(i, { share })}
              />
              <NumberField
                label={`${s.name} · rate EUR`}
                value={s.rate}
                onChange={(rate) => service(i, { rate })}
              />
              <label>
                Rate period
                <select
                  value={s.period}
                  onChange={(e) =>
                    service(i, { period: e.target.value as "month" | "day" })
                  }
                >
                  <option value="month">Per month</option>
                  <option value="day">Per day</option>
                </select>
              </label>
              <NumberField
                label={`${s.name} · occupancy % (all years)`}
                percent
                value={
                  s.occupancy.every((x) => x === s.occupancy[0])
                    ? (s.occupancy[0] ?? null)
                    : null
                }
                onChange={(n) => service(i, { occupancy: Array(10).fill(n) })}
              />
              {model.costMode === "derived" && (
                <>
                  <NumberField
                    label="Personnel · EUR / occupied unit-year"
                    value={s.personnel}
                    onChange={(personnel) => service(i, { personnel })}
                  />
                  <NumberField
                    label="Other variable cost · EUR / occupied unit-year"
                    value={s.variable}
                    onChange={(variable) => service(i, { variable })}
                  />
                </>
              )}
            </div>
            <details>
              <summary>Annual occupancy ramp</summary>
              <div className="year-fields">
                {s.occupancy.map((n, y) => (
                  <NumberField
                    key={y}
                    label={`Year ${y + 1} · %`}
                    percent
                    value={n}
                    onChange={(v) =>
                      service(i, {
                        occupancy: s.occupancy.map((x, j) => (j === y ? v : x)),
                      })
                    }
                  />
                ))}
              </div>
            </details>
            {model.services.length > 1 && (
              <button
                className="text-button"
                onClick={() =>
                  update(
                    "services",
                    model.services.filter((_, j) => i !== j),
                  )
                }
              >
                Remove service
              </button>
            )}
          </fieldset>
        ))}
        <button
          className="button secondary"
          disabled={model.services.length >= 7}
          onClick={() =>
            update("services", [
              ...model.services,
              {
                name: "Additional service",
                share: null,
                rate: null,
                period: "month",
                occupancy: Array(10).fill(null),
                personnel: null,
                variable: null,
              },
            ])
          }
        >
          Add service
        </button>
        <h3>Operating economics</h3>
        <div className="form-grid">
          <label>
            Operating-cost method
            <select
              value={model.costMode}
              onChange={(e) =>
                update("costMode", e.target.value as "derived" | "margin")
              }
            >
              <option value="margin">Assumed EBITDA margin</option>
              <option value="derived">Personnel + other costs</option>
            </select>
          </label>
          {model.costMode === "margin"
            ? field("margin", "EBITDA margin · %", true)
            : field("fixed", "Fixed operating costs · EUR / operating year")}
          {field("ancillary", "Ancillary revenue · % of core", true)}
          {field("maintenance", "Maintenance capex · % of revenue", true)}
        </div>
        <p className="small muted">
          The margin method replaces personnel and other cost calculations.
          Fixed costs begin at the first opening and are charged in full
          thereafter; pre-opening costs are separate.
        </p>
        <details className="advanced-inputs">
          <summary>Advanced development & timing assumptions</summary>
          <div className="form-grid">
            {field(
              "ffe",
              model.equipmentBundled
                ? "FF&E + medical / therapy / IT · EUR / bed"
                : "FF&E · EUR / bed",
            )}
            {field("hydro", "Hydrotherapy investment · EUR")}
            {field("soft", "Soft costs · % of direct development", true)}
            {field("contingency", "Contingency · %", true)}
            <label>
              Contingency basis
              <select
                value={model.contingencyBase}
                onChange={(e) =>
                  update(
                    "contingencyBase",
                    e.target.value as AnnualInput["contingencyBase"],
                  )
                }
              >
                <option value="direct">Report: direct development only</option>
                <option value="direct_plus_soft">
                  Earlier draft: direct + soft costs
                </option>
              </select>
            </label>
            {field(
              "preOpening",
              model.preOpeningBundled
                ? "Pre-opening + working capital (bundled) · EUR"
                : "Pre-opening · EUR",
            )}
          </div>
          <div className="form-grid">
            {(
              [
                [
                  "acquisitionBundled",
                  "transaction",
                  "Transaction costs · EUR",
                ],
                ["equipmentBundled", "medical", "Medical equipment · EUR"],
                [
                  "preOpeningBundled",
                  "workingCapital",
                  "Working capital · EUR",
                ],
              ] as const
            ).map(([key, cost, label]) => (
              <div key={key}>
                <label>
                  <input
                    type="checkbox"
                    checked={model[key]}
                    onChange={(e) => update(key, e.target.checked)}
                  />{" "}
                  Included in report bundle
                </label>
                {!model[key] && field(cost, label)}
              </div>
            ))}
          </div>
          <p className="small muted">
            Unchecking a bundle requires entering its separate costs and
            revising the original combined amount. The report does not establish
            the split.
          </p>
          <h4>Opening phases</h4>
          {model.phases.map((p, i) => (
            <div className="toolbar" key={i}>
              <label>
                Phase {i + 1} opening year
                <select
                  value={p.year}
                  onChange={(e) =>
                    update(
                      "phases",
                      model.phases.map((x, j) =>
                        j === i ? { ...x, year: Number(e.target.value) } : x,
                      ),
                    )
                  }
                >
                  {Array.from({ length: 10 }, (_, j) => (
                    <option key={j} value={j + 1}>
                      {j + 1}
                    </option>
                  ))}
                </select>
              </label>
              <NumberField
                label={`Phase ${i + 1} capacity`}
                value={p.capacity}
                onChange={(n) =>
                  update(
                    "phases",
                    model.phases.map((x, j) =>
                      j === i ? { ...x, capacity: n } : x,
                    ),
                  )
                }
              />
              {model.phases.length > 1 && (
                <button
                  onClick={() =>
                    update(
                      "phases",
                      model.phases.filter((_, j) => i !== j),
                    )
                  }
                >
                  Remove phase
                </button>
              )}
            </div>
          ))}
          <button
            className="button secondary"
            disabled={model.phases.length >= 3}
            onClick={() =>
              update("phases", [...model.phases, { year: 2, capacity: null }])
            }
          >
            Add opening phase
          </button>
          <h4>Investment spending · % by year</h4>
          <p>
            Acquisition and transaction stay in year 0. These shares allocate
            all remaining investment, including pre-opening and working capital.
            Must total 100%.
          </p>
          <div className="year-fields">
            {model.spending.map((n, y) => (
              <NumberField
                key={y}
                label={`Year ${y} · %`}
                percent
                value={n}
                onChange={(v) =>
                  update(
                    "spending",
                    model.spending.map((x, j) => (j === y ? (v ?? 0) : x)),
                  )
                }
              />
            ))}
          </div>
        </details>
        <section className="worksheet-results" aria-label="Worksheet results">
          <div className="section-heading">
            <h2>What the assumptions imply</h2>
            <button
              className="button secondary"
              disabled={result.issues.length > 0}
              onClick={download}
            >
              Download annual CSV
            </button>
          </div>
          {result.issues.length > 0 ? (
            <div role="alert" className="notice">
              <h3>Correct these inputs to calculate</h3>
              <ul>
                {result.issues.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <div className="stats-row" aria-live="polite">
                <Stat
                  label="Total investment"
                  value={money(result.investment)}
                />
                <Stat
                  label="Investment / bed"
                  value={money(result.investmentPerBed)}
                />
                <Stat label="Year 10 EBITDA" value={money(last.ebitda)} />
                <Stat label="Year 10 cash yield" value={pct(last.cashYield)} />
              </div>
              <div className="stats-row">
                <Stat label="Year 10 EBITDA margin" value={pct(last.margin)} />
                <Stat label="Ten-year simple ROI" value={pct(result.roi)} />
                <Stat
                  label="Indicative annual IRR"
                  value={
                    result.irr.status === "available"
                      ? pct(result.irr.rate)
                      : result.irr.status
                  }
                  note={
                    result.irr.status === "available"
                      ? "Unlevered, pre-tax, no resale value"
                      : result.irr.reason
                  }
                />
                <Stat
                  label="Investment payback"
                  value={
                    result.missing.length
                      ? "Incomplete inputs"
                      : result.payback === null
                        ? "Not within 10 years"
                        : `Year ${result.payback}`
                  }
                />
              </div>
              {result.missing.length > 0 && (
                <details open className="notice">
                  <summary>
                    Missing assumptions · dependent outputs remain unknown
                  </summary>
                  <ul>
                    {result.missing.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </details>
              )}
              <details>
                <summary>Investment breakdown and formula bases</summary>
                <dl className="service-list">
                  {(
                    [
                      ["Acquisition + transaction", result.acquisition],
                      ["Renovation", result.renovation],
                      ["Equipment", result.equipment],
                      ["Direct development", result.direct],
                      ["Soft costs", result.soft],
                      ["Contingency", result.contingency],
                      ["Development investment", result.development],
                      [
                        "Total including pre-opening / working capital",
                        result.investment,
                      ],
                    ] as const
                  ).map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{money(v)}</dd>
                    </div>
                  ))}
                </dl>
              </details>
              <figure className="cash-chart">
                <figcaption>
                  Cumulative project cash flow · EUR · no terminal value
                </figcaption>
                {result.annual.map((r) => (
                  <div key={r.year} className="cash-row">
                    <span>Year {r.year}</span>
                    <div className="chart-track" aria-hidden="true">
                      <span
                        className={(r.cumulative ?? 0) < 0 ? "negative" : ""}
                        style={{
                          width: `${(Math.abs(r.cumulative ?? 0) / Math.max(1, ...result.annual.map((x) => Math.abs(x.cumulative ?? 0)))) * 100}%`,
                        }}
                      />
                    </div>
                    <strong>{money(r.cumulative)}</strong>
                  </div>
                ))}
              </figure>
              <div className="table-scroll">
                <table>
                  <caption>
                    Annual worksheet · all monetary values EUR; unknown inputs
                    leave dependent cells unknown
                  </caption>
                  <thead>
                    <tr>
                      {[
                        "Year",
                        "Capacity",
                        "Revenue",
                        "Opex",
                        "EBITDA",
                        "Maintenance",
                        "Operating cash",
                        "Investment",
                        "Project cash",
                        "Cumulative cash",
                        "Cash yield",
                      ].map((x) => (
                        <th key={x}>{x}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.annual.map((r) => (
                      <tr key={r.year}>
                        <th>{r.year}</th>
                        <td>{r.capacity ?? "Unknown"}</td>
                        {[
                          r.revenue,
                          r.opex,
                          r.ebitda,
                          r.maintenance,
                          r.operatingCash,
                          r.expenditure,
                          r.projectCash,
                          r.cumulative,
                        ].map((v, i) => (
                          <td key={i}>{money(v)}</td>
                        ))}
                        <td>{pct(r.cashYield)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="notice">
                Cash yield is an annual operating return on planned investment,
                not IRR. A ten-year horizon without resale may not recover the
                initial investment. These outputs do not establish demand,
                property availability or operational feasibility.
              </p>
            </>
          )}
        </section>
      </section>
    </>
  );
}
