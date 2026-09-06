"use client";
import { RevenueChart } from "./RevenueChart";
import { useMemo, useState } from "react";
import { Download, Save, RotateCcw } from "lucide-react";
import type { WorkspaceRecord } from "@/types/workspace";
import type { Locale } from "@/lib/constants";
import { seed } from "@/lib/workspace-data";
import {
  calculateFinance,
  screening,
  reportCases,
  stressModel,
  type ReturnResult,
} from "@/lib/finance";
import {
  emptyModel,
  modelSchema,
  type DevelopmentModel,
} from "@/lib/model-schema";
import { SourceNote, Stat, Tag } from "../ui";
const money = (n: number | null) =>
  n === null
    ? "Unknown"
    : new Intl.NumberFormat("en", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(n);
const pct = (n: number | null) =>
  n === null ? "Unknown" : `${(n * 100).toFixed(2)}%`;
const label = (k: string) =>
  k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
function download(name: string, data: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([data], { type })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const seriesKeys = new Set([
  "occupancy",
  "outOfService",
  "sessions",
  "spendingShares",
  "preOpening",
  "sponsorCosts",
  "workingCapital",
  "replacementCapex",
  "rent",
  "depositMovement",
  "depreciation",
  "vatCash",
  "customsCash",
  "draws",
  "principal",
  "fees",
  "equity",
]);
const enums: Record<string, string[]> = {
  staffingMode: ["roster", "aggregate"],
  period: ["month", "day", "session"],
  currency: ["EUR", "GEL", "CHF", "USD"],
  wageCurrency: ["EUR", "GEL", "CHF", "USD"],
  entity: ["propco", "opco"],
  contingencyBase: ["direct", "direct_plus_soft"],
  interestTreatment: ["paid", "capitalized_during_development"],
};
function Schedule({
  name,
  value,
  onChange,
  months,
}: {
  name: string;
  value: number[] | null;
  onChange: (v: unknown) => void;
  months: number;
}) {
  const [constant, setConstant] = useState("");
  return (
    <div className="schedule">
      <strong>{label(name)}</strong>
      <span className="small muted">
        {value === null
          ? "Unknown"
          : `${value.length} months explicitly supplied`}
      </span>
      <div className="toolbar">
        <label>
          Monthly value
          <input
            type="number"
            step="any"
            value={constant}
            onChange={(e) => setConstant(e.target.value)}
            placeholder="Enter an assumption"
          />
        </label>
        <button
          type="button"
          className="button secondary"
          disabled={constant === ""}
          onClick={() => onChange(Array(months).fill(Number(constant)))}
        >
          Apply to every month
        </button>
        <button
          type="button"
          className="text-button"
          onClick={() => onChange(null)}
        >
          Mark unknown
        </button>
      </div>
      {value !== null && (
        <details>
          <summary>Edit individual months</summary>
          <div className="month-inputs">
            {value.map((n, i) => (
              <label key={i}>
                M{i}
                <input
                  type="number"
                  step="any"
                  value={n}
                  onChange={(e) => {
                    const next = [...value];
                    next[i] = Number(e.target.value);
                    onChange(next);
                  }}
                />
              </label>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
function Fields({
  value,
  onChange,
  path = "",
  months,
}: {
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
  path?: string;
  months: number;
}) {
  return (
    <div className="model-fields">
      {Object.entries(value)
        .filter(([key]) => !["schemaVersion", "assumptions"].includes(key))
        .map(([key, v]) => {
          const update = (next: unknown) => onChange({ ...value, [key]: next }),
            full = path ? `${path}.${key}` : key;
          if (seriesKeys.has(key))
            return (
              <Schedule
                key={key}
                name={key}
                value={v as number[] | null}
                onChange={update}
                months={months}
              />
            );
          if (Array.isArray(v)) {
            if (key === "exclusions")
              return (
                <label className="wide" key={key}>
                  Explicit exclusions (one per line)
                  <textarea
                    rows={3}
                    value={v.join("\n")}
                    onChange={(e) =>
                      update(e.target.value.split("\n").filter(Boolean))
                    }
                  />
                </label>
              );
            return (
              <fieldset key={key} className="wide nested">
                <legend>{label(key)}</legend>
                {v.map((entry, i) => (
                  <details key={i} open={v.length === 1}>
                    <summary>
                      {String(
                        entry.name ?? entry.id ?? `${label(key)} ${i + 1}`,
                      )}
                    </summary>
                    <Fields
                      value={entry}
                      months={months}
                      path={`${full}.${i}`}
                      onChange={(next) =>
                        update(v.map((x, j) => (i === j ? next : x)))
                      }
                    />
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => update(v.filter((_, j) => i !== j))}
                    >
                      Remove this line
                    </button>
                  </details>
                ))}
                <button
                  type="button"
                  className="button secondary"
                  disabled={!v.length}
                  onClick={() => update([...v, structuredClone(v[0])])}
                >
                  Add a line
                </button>
              </fieldset>
            );
          }
          if (v && typeof v === "object")
            return (
              <details className="wide model-group" key={key}>
                <summary>{label(key)}</summary>
                <Fields
                  value={v as Record<string, unknown>}
                  onChange={update}
                  path={full}
                  months={months}
                />
              </details>
            );
          let options = enums[key];
          if (key === "mode")
            options =
              path === "tax"
                ? ["unresolved", "explicit_exclusion", "configured"]
                : path === "debt"
                  ? ["unresolved", "none", "scheduled"]
                  : ["unresolved", "none", "configured"];
          if (key === "conceptId") options = seed.concepts.map((c) => c.id);
          if (options)
            return (
              <label key={key}>
                {label(key)}
                <select
                  value={String(v)}
                  onChange={(e) => update(e.target.value)}
                >
                  {options.map((o) => (
                    <option value={o} key={o}>
                      {o.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            );
          if (key === "propertyId")
            return (
              <label key={key}>
                Property
                <select
                  value={String(v ?? "")}
                  onChange={(e) => update(e.target.value || null)}
                >
                  <option value="">No asset selected</option>
                  {seed.assets.map((a) => (
                    <option value={a.id} key={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>
            );
          const numeric = typeof v === "number" || v === null;
          return (
            <label key={key}>
              {label(key)}
              <input
                type={
                  key === "startDate" ? "date" : numeric ? "number" : "text"
                }
                step={numeric ? "any" : undefined}
                value={v === null ? "" : String(v)}
                placeholder={numeric ? "Unknown" : ""}
                onChange={(e) =>
                  update(
                    numeric
                      ? e.target.value === ""
                        ? null
                        : Number(e.target.value)
                      : e.target.value,
                  )
                }
              />
              {numeric && (
                <small className="muted">
                  {/(Rate|share|discount|cancellations|badDebt|Occupancy)$/.test(
                    key,
                  )
                    ? "Fraction: 0.15 = 15%"
                    : "Blank = unknown; zero is an explicit assumption"}
                </small>
              )}
            </label>
          );
        })}
    </div>
  );
}
function returnLabel(r: ReturnResult) {
  return r.status === "available"
    ? pct(r.rate)
    : r.status === "ambiguous"
      ? "Ambiguous"
      : "Unavailable";
}
export function FinancialLab({
  conceptId,
  locale,
  savedModels = [],
}: {
  conceptId: string;
  locale: Locale;
  savedModels?: WorkspaceRecord[];
}) {
  const [year, setYear] = useState(0);
  const [tab, setTab] = useState("screen"),
    [caseName, setCaseName] = useState<keyof typeof reportCases>("base"),
    [screen, setScreen] = useState(reportCases.base),
    [investment, setInvestment] = useState(22_209_450),
    [target, setTarget] = useState(0.08),
    [model, setModel] = useState<DevelopmentModel>(() => emptyModel(conceptId)),
    [message, setMessage] = useState(""),
    [rationale, setRationale] = useState(""),
    [json, setJson] = useState(""),
    [stress, setStress] = useState({
      delay: 0,
      capex: 0,
      wages: 0,
      prices: 0,
      occupancy: 0,
      withdrawalMonth: null as number | null,
    });
  const s = screening(screen, investment),
    result = useMemo(() => calculateFinance(model), [model]),
    downside = useMemo(
      () => calculateFinance(stressModel(model, stress)),
      [model, stress],
    );
  const save = async () => {
    setMessage("Saving…");
    try {
      const response = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          kind: "model",
          title: model.name,
          body: { input: model },
          rationale,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(
        "New model version saved for publication review. Canonical scenarios were not changed.",
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed; nothing saved");
    }
  };
  const reference = () => {
    const next = emptyModel("TSK-S7");
    next.name = "Care + rehabilitation — report reference inputs";
    next.phases = [
      {
        name: "Full-scale reference (timing unresolved)",
        openingMonth: 24,
        capacity: 140,
      },
    ];
    next.services = [
      {
        ...next.services[0]!,
        id: "care",
        name: "Long-term care",
        share: 0.7,
        rate: 3400,
      },
      {
        ...next.services[0]!,
        id: "rehab",
        name: "Rehabilitation",
        share: 0.3,
        rate: 190,
        period: "day",
      },
    ];
    next.ancillaryRate = 0.06;
    next.maintenanceRate = 0.02;
    next.development.direct = [
      {
        name: "Hard costs: 9,500 m² × €1,050",
        total: 9_975_000,
        currency: "EUR",
        entity: "propco",
      },
      {
        name: "FF&E, clinical, therapy & IT",
        total: 3_360_000,
        currency: "EUR",
        entity: "opco",
      },
      {
        name: "Hydrotherapy",
        total: 1_200_000,
        currency: "EUR",
        entity: "propco",
      },
    ];
    next.development.softRate = 0.12;
    next.development.contingencyRate = 0.15;
    next.assumptions.report = {
      classification: "assumption",
      sourceIds: ["audit-2026"],
      asOf: "2026-09-06",
      note: "§11: full-scale inputs only. Opening date/month are editor defaults, not sourced timing. Acquisition+transaction €2.75m and pre-opening+working capital €1m remain unsplit, so their individual inputs remain unknown.",
    };
    setModel(next);
    setTab("development");
  };
  return (
    <>
      {savedModels.length > 0 && (
        <section className="panel">
          <h2>Published model versions</h2>
          {savedModels.map((r) => (
            <button
              key={r.id}
              className="button secondary"
              onClick={() => {
                const p = modelSchema.safeParse(r.body.input);
                if (p.success) {
                  setModel(p.data);
                  setTab("development");
                  setMessage(
                    "Loaded published version. Edits create a new scenario.",
                  );
                } else
                  setMessage("This version uses an unsupported model schema.");
              }}
            >
              {r.title} ? v{r.version}
            </button>
          ))}
        </section>
      )}
      <div className="segmented">
        <button
          aria-pressed={tab === "screen"}
          onClick={() => setTab("screen")}
        >
          Report screening
        </button>
        <button
          aria-pressed={tab === "development"}
          onClick={() => setTab("development")}
        >
          Monthly development model
        </button>
      </div>
      {tab === "screen" ? (
        <>
          <div className="notice">
            <Tag kind="derived" locale={locale} /> Stabilized annual screening
            based on assumed margins. It excludes ramp-up, debt, tax and
            property-specific costs. This is not IRR.
          </div>
          <div className="finance-layout">
            <section className="panel">
              <h2>Trace the assumptions</h2>
              <label>
                Operating case
                <select
                  value={caseName}
                  onChange={(e) => {
                    const k = e.target.value as keyof typeof reportCases;
                    setCaseName(k);
                    setScreen(reportCases[k]);
                  }}
                >
                  {Object.keys(reportCases).map((k) => (
                    <option key={k} value={k}>
                      {label(k)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="input-grid">
                {Object.entries(screen).map(([k, v]) => (
                  <label key={k}>
                    {label(k)}
                    <input
                      type="number"
                      min="0"
                      max={/Occupancy|ancillary|margin/.test(k) ? 1 : undefined}
                      step="any"
                      value={v}
                      onChange={(e) =>
                        setScreen({
                          ...screen,
                          [k]: Math.max(
                            0,
                            Math.min(
                              /Occupancy|ancillary|margin/.test(k)
                                ? 1
                                : Infinity,
                              Number(e.target.value),
                            ),
                          ),
                        })
                      }
                    />
                    <small className="muted">
                      {/Occupancy|ancillary|margin/.test(k)
                        ? "Fraction (0.85 = 85%)"
                        : "EUR per " + (k === "rehabRate" ? "day" : "month")}
                    </small>
                  </label>
                ))}
                <label>
                  Total investment · EUR
                  <input
                    type="number"
                    min="1"
                    value={investment}
                    onChange={(e) =>
                      setInvestment(Math.max(1, Number(e.target.value)))
                    }
                  />
                </label>
              </div>
              <button
                className="text-button"
                onClick={() => {
                  setScreen(reportCases.base);
                  setCaseName("base");
                  setInvestment(22_209_450);
                }}
              >
                <RotateCcw size={14} />
                Reset report base
              </button>
              <SourceNote locator="11.5–11.10" locale={locale} />
            </section>
            <div>
              <div className="result-grid">
                <Stat
                  label="Annual revenue"
                  value={money(s.revenue)}
                  note="98 care beds + 42 rehabilitation beds"
                />
                <Stat
                  label="EBITDA"
                  value={money(s.ebitda)}
                  note="Assumed margin, not a staffing budget"
                />
                <Stat
                  label="Cash before debt & tax"
                  value={money(s.cash)}
                  note="After maintenance capex at 2% of revenue"
                />
                <Stat
                  label="Stabilized cash yield"
                  value={pct(s.yield)}
                  note="Not project IRR or equity return"
                />
              </div>
              <RevenueChart
                longRevenue={s.longRevenue}
                rehabRevenue={s.rehabRevenue}
                cash={s.cash}
              />
              <div className="panel">
                <h3>What would need to change?</h3>
                <label>
                  Target stabilized yield
                  <input
                    type="number"
                    min="0.001"
                    max="1"
                    step="0.01"
                    value={target}
                    onChange={(e) =>
                      setTarget(Math.max(0.001, Number(e.target.value)))
                    }
                  />
                </label>
                <p>
                  At this cash flow, maximum investment for the target is{" "}
                  <strong>{money(s.cash / target)}</strong>. Required annual
                  cash at the selected investment is{" "}
                  <strong>{money(investment * target)}</strong>.
                </p>
                <p className="muted small">
                  Holding the cash margin constant does not establish feasible
                  pricing or staffing. A bottom-up model must test the proposed
                  improvement.
                </p>
              </div>
            </div>
          </div>
          <section className="panel">
            <h2>Capex × operating case</h2>
            <div className="table-scroll">
              <table>
                <caption>
                  Stabilized unlevered pre-tax cash yield · report assumptions
                </caption>
                <thead>
                  <tr>
                    <th>Total investment</th>
                    {Object.keys(reportCases).map((k) => (
                      <th key={k}>{label(k)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[14_600_000, 22_200_000, 31_300_000].map((cap) => (
                    <tr key={cap}>
                      <th>{money(cap)}</th>
                      {Object.entries(reportCases).map(([k, v]) => (
                        <td
                          key={k}
                          className="heat-cell"
                          style={{
                            background:
                              screening(v, cap).yield! >= 0.08
                                ? "#e4efdf"
                                : "#f5eadc",
                          }}
                        >
                          {pct(screening(v, cap).yield)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small muted">
              The exact capex build is €22,209,450; the report presents
              approximately €22.209m and uses €22.21m for the worked yield.
              Contingency is 15% of direct costs, excluding soft costs.
            </p>
            <div className="toolbar">
              <button
                className="button secondary"
                onClick={() =>
                  download(
                    "tskaltubo-screening.json",
                    JSON.stringify(
                      {
                        source: "audit-2026 §11",
                        inputs: { ...screen, investment },
                        results: s,
                      },
                      null,
                      2,
                    ),
                  )
                }
              >
                <Download size={16} />
                Export screening
              </button>
              <button className="button" onClick={reference}>
                Use report inputs in monthly model
                <Save size={16} />
              </button>
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="notice">
            Missing inputs stay unknown. The opening calendar is an editable
            planning default. The model does not assume Georgian tax rules,
            finance terms or safe staffing. All monthly schedules must span the
            chosen horizon; rates are fractions.
          </div>
          <div className="toolbar">
            <button className="button secondary" onClick={reference}>
              Load sourced reference inputs
            </button>
            <button
              className="button secondary"
              onClick={() => setModel(emptyModel(conceptId))}
            >
              New blank scenario
            </button>
            <button
              className="button secondary"
              onClick={() =>
                download(
                  "tskaltubo-model.json",
                  JSON.stringify(
                    { input: model, result, engineVersion: "2.0.0" },
                    null,
                    2,
                  ),
                )
              }
            >
              <Download size={16} />
              Export inputs & results
            </button>
          </div>
          <div className="model-layout">
            <section className="panel">
              <h2>Development assumptions</h2>
              <Fields
                value={model as unknown as Record<string, unknown>}
                onChange={(v) => setModel(v as unknown as DevelopmentModel)}
                months={model.months}
              />
              <details>
                <summary>Assumption provenance & advanced JSON import</summary>
                <p className="small">
                  Attach sources, dates and explanatory notes under the
                  assumptions register. Existing project facts are never
                  overwritten by these scenario inputs.
                </p>
                <textarea
                  aria-label="Model JSON"
                  rows={12}
                  value={json}
                  onChange={(e) => setJson(e.target.value)}
                  placeholder="Paste an exported model or input object"
                />
                <div className="toolbar">
                  <button
                    className="button secondary"
                    onClick={() => setJson(JSON.stringify(model, null, 2))}
                  >
                    Load current JSON
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(json);
                        setModel(modelSchema.parse(parsed.input ?? parsed));
                        setMessage("Imported into this browser only.");
                      } catch (e) {
                        setMessage(
                          e instanceof Error ? e.message : "Invalid JSON",
                        );
                      }
                    }}
                  >
                    Validate & import
                  </button>
                </div>
              </details>
            </section>
            <aside>
              <section className="panel model-results">
                <div className="card-kicker">
                  <h2>Results</h2>
                  <span className="tag">{result.status}</span>
                </div>
                <div className="result-grid">
                  <Stat
                    label="Development investment"
                    value={money(result.totalInvestment)}
                  />
                  <Stat label="Project NPV" value={money(result.npv)} />
                  <Stat
                    label="Project IRR"
                    value={returnLabel(result.projectIrr)}
                  />
                  <Stat
                    label="Equity IRR"
                    value={returnLabel(result.equityIrr)}
                  />
                  <Stat
                    label="Peak unfunded cash"
                    value={money(result.peakFundingGap)}
                  />
                </div>
                {result.issues.length > 0 && (
                  <ul className="error">
                    {result.issues.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                )}
                {result.missing.length > 0 && (
                  <>
                    <h3>Inputs blocking results</h3>
                    <ul>
                      {result.missing.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </>
                )}
                <details>
                  <summary>Conventions and limitations</summary>
                  <ul>
                    {result.warnings.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </details>
              </section>
              <section className="panel">
                <h3>Combined downside</h3>
                <div className="input-grid">
                  {Object.entries(stress).map(([k, v]) => (
                    <label key={k}>
                      {label(k)}
                      <input
                        type="number"
                        step="any"
                        value={v ?? ""}
                        placeholder="Not applied"
                        onChange={(e) =>
                          setStress({
                            ...stress,
                            [k]:
                              e.target.value === "" && k === "withdrawalMonth"
                                ? null
                                : Number(e.target.value),
                          })
                        }
                      />
                      <small>
                        {k === "delay" || k === "withdrawalMonth"
                          ? "Months (index starts at 0)"
                          : "Proportional change: −0.1 = −10%"}
                      </small>
                    </label>
                  ))}
                </div>
                <p>
                  Downside NPV: <strong>{money(downside.npv)}</strong>
                  <br />
                  Downside funding gap:{" "}
                  <strong>{money(downside.peakFundingGap)}</strong>
                </p>
                {downside.issues.length > 0 && (
                  <p className="error">{downside.issues.join("; ")}</p>
                )}
              </section>
              <section className="panel">
                <h3>Save a new version</h3>
                <label>
                  Why are these assumptions useful?
                  <textarea
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    rows={3}
                  />
                </label>
                <button
                  className="button"
                  disabled={
                    rationale.trim().length < 8 || result.status === "invalid"
                  }
                  onClick={save}
                >
                  <Save size={16} />
                  Save for review
                </button>
                <p className="small muted">
                  An invited account is required. No data is saved until the
                  server confirms it.
                </p>
                <p role="status">{message}</p>
              </section>
            </aside>
          </div>
          <section className="panel">
            <h2>Monthly cash and operating schedules</h2>
            <label>
              Display year
              <select
                value={Math.min(year, Math.ceil(model.months / 12) - 1)}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {Array.from(
                  { length: Math.ceil(model.months / 12) },
                  (_, i) => (
                    <option key={i} value={i}>
                      Months {i * 12}?
                      {Math.min((i + 1) * 12 - 1, model.months - 1)}
                    </option>
                  ),
                )}
              </select>
            </label>
            <button
              className="button secondary"
              onClick={() => {
                const keys = [
                  "month",
                  "capacity",
                  "occupied",
                  "revenue",
                  "fte",
                  "payroll",
                  "opex",
                  "ebitda",
                  "capex",
                  "tax",
                  "projectCash",
                  "debtBalance",
                  "dscr",
                  "fundingGap",
                ] as const;
                download(
                  "tskaltubo-monthly.csv",
                  [
                    keys.join(","),
                    ...result.monthly.map((r) =>
                      keys.map((k) => r[k] ?? "").join(","),
                    ),
                  ].join("\n"),
                  "text/csv",
                );
              }}
            >
              Export monthly CSV
            </button>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Capacity</th>
                    <th>Occupied</th>
                    <th>Revenue</th>
                    <th>EBITDA</th>
                    <th>FTE</th>
                    <th>Project cash</th>
                    <th>Debt balance</th>
                    <th>DSCR</th>
                    <th>Entities & detail</th>
                  </tr>
                </thead>
                <tbody>
                  {result.monthly
                    .slice(
                      Math.min(year, Math.ceil(model.months / 12) - 1) * 12,
                      Math.min(year, Math.ceil(model.months / 12) - 1) * 12 +
                        12,
                    )
                    .map((r) => (
                      <tr key={r.month}>
                        <th>{r.month}</th>
                        <td>{r.capacity ?? "Unknown"}</td>
                        <td>{r.occupied?.toFixed(1) ?? "Unknown"}</td>
                        <td>{money(r.revenue)}</td>
                        <td>{money(r.ebitda)}</td>
                        <td>{r.fte?.toFixed(1) ?? "Unknown"}</td>
                        <td>{money(r.projectCash)}</td>
                        <td>{money(r.debtBalance)}</td>
                        <td>{r.dscr?.toFixed(2) ?? "N/A"}</td>
                        <td>
                          <details>
                            <summary>Details</summary>
                            <dl>
                              {Object.entries(r)
                                .filter(([k]) => k !== "month")
                                .map(([k, v]) => (
                                  <div key={k}>
                                    <dt>{label(k)}</dt>
                                    <dd>
                                      {v && typeof v === "object"
                                        ? JSON.stringify(v)
                                        : v === null
                                          ? "Unknown"
                                          : String(v)}
                                    </dd>
                                  </div>
                                ))}
                            </dl>
                          </details>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}
