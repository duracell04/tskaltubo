# Annual financial worksheet

The pure `calculateAnnual` engine accepts `AnnualInput` and returns investment components, eleven annual rows, missing assumptions, validation issues and return indicators. It has no I/O or persistence. The calculator uses React state; queries can select a known concept/property but never encode edited assumptions.

## Conventions

EUR reporting, year 0 acquisition and ten annual operating periods. Rates and costs do not inflate. Monthly revenue uses 12 months and daily revenue uses 365 days; this is a screening annualization, not actual-date billing. No debt, tax, automatic working-capital recovery or terminal value. Outputs are pre-tax and unlevered.

Direct development = gross building area × renovation EUR/m² + capacity × FF&E per bed + separately entered medical equipment + hydrotherapy. Soft costs use direct development. Report contingency uses direct development; the earlier draft's direct-plus-soft-cost basis remains an explicit alternative. Acquisition/transaction and pre-opening/working capital are separate from direct development.

The report bundles acquisition with transaction costs, FF&E with medical/therapy/IT, and pre-opening with working capital. Unknown splits remain null while the known bundle calculates. Switching to split inputs requires adjusting the original combined amount to prevent double counting. This is explained beside the controls.

Acquisition and transaction occur in year 0. Eleven nonnegative spending shares totaling 100% allocate all remaining investment. One to three phases open at the start of years 1–10 and must reconcile to total capacity. Fractional service allocations are screening capacity equivalents, not a room schedule.

Revenue = sum of occupied capacity × service price × annualization, plus ancillary revenue. Cost-based mode deducts annual personnel and other variable costs per occupied unit-year plus fixed annual Opex. Fixed costs begin at first opening and apply in full thereafter. EBITDA-margin mode replaces that calculation; it does not add staffing costs a second time. Pre-opening staffing belongs in pre-opening costs. No clinical safety is certified.

Maintenance = revenue × maintenance rate. Operating cash = EBITDA minus maintenance. Project cash additionally subtracts investment spending. Cumulative project cash is the running sum including year 0.

Cash yield = annual operating cash / total planned investment. Simple ROI = year-10 cumulative net project cash / investment. Payback is the first nonnegative cumulative year that remains nonnegative through year 10. Annual IRR uses year-zero and year-end project cash; missing flows, absent sign changes and potentially multiple roots produce explicit unavailable/ambiguous results. No terminal proceeds are inferred.

Unknown inputs leave dependent results null; independent schedules still calculate. Invalid shares/capacities hide economic results until corrected. Acquisition in GEL/CHF/USD requires an explicit positive EUR-per-unit rate and date; no live FX service is used. Property land area never substitutes for gross building area. Historical price ranges require the visitor to choose an amount explicitly.

## Report reconciliation

Audit §§11.5–11.10, dated 6 September 2026: 140 beds, 9,500 m², EUR 1,050/m², bundled equipment EUR 24,000/bed, hydrotherapy EUR 1.2m, soft costs 12%, direct-cost contingency 15%, acquisition/transaction EUR 2.75m and pre-opening/working capital EUR 1m produce **EUR 22,209,450**. The base service assumptions produce **EUR 5,609,408.70 revenue**, **EUR 1,177,975.83 operating cash**, and **5.30% stabilized cash yield**.

The ten-year extension uses explicit worksheet timing and flat assumptions. It is not a forecast supplied by the report. Other concepts receive empty financial structures; the user must supply supporting assumptions.
