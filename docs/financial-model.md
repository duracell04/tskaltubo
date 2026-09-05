# Financial model contract — not implemented

`src/types/finance.ts` defines the future boundary. `calculateFinance` in `src/lib/finance.ts` accepts that contract and returns only `{ status: "notImplemented" }`. It does not validate or calculate yet. The placeholder UI does not call it with fabricated inputs.

There are no presets, sample costs, staffing rates, FX rates or numerical results. The following is a later implementation specification, not an assumption set.

## Inputs

- EUR base; CHF/GEL entries carry explicit, dated EUR-per-foreign-unit FX assumptions.
- Primary variables: acquisition, renovation per gross m², capacity, occupancy and monthly/daily pricing.
- Development: gross/usable area, transaction costs, FF&E per unit, medical equipment, balneology, soft costs, contingency, pre-opening expenditure and working capital.
- At most three opening phases with year, capacity and gross area; annual spending shares cover year 0 through year 10.
- Service-line capacity shares, annual occupancy ramps, pricing period and personnel/non-personnel variable costs per occupied unit.
- Ancillary revenue, fixed Opex or a margin shortcut, and maintenance capex.
- Optional staffing checks across nursing/care, medical/therapy, hospitality, management/administration and technical/support. They validate or explicitly derive personnel assumptions; they must not be added twice to Opex.

Every numerical parameter is an `Assumption` with category, optional date and evidence references. Copied facts become explicit scenario inputs; editing them must never edit the property record. Rates/shares use fractions in the eventual module; the UI formats percentages.

## Planned model

Acquisition occurs at year 0, followed by ten annual operating periods. Opening is at the start of the selected year. No debt, tax, automatic inflation, terminal value or automatic working-capital release is included.

Renovation uses gross area. Direct development includes renovation, FF&E, medical equipment and balneology. Soft costs apply to direct development; contingency applies to direct development plus soft costs. Acquisition, transaction costs, pre-opening expenditure and working capital are separate. Scheduled expenditure must reconcile to total investment without double counting.

Revenue uses occupied capacity, service pricing and annualization (12 months or 365 days), plus ancillary revenue. Derived-cost mode subtracts personnel, variable costs and fixed Opex. Margin mode replaces that calculation rather than additionally subtracting derived costs.

Maintenance capex is based on revenue. Operating cash flow is EBITDA less maintenance capex. Project cash flow also deducts project expenditure.

## Planned outputs

Investment breakdown, investment per unit, annual capacity/occupancy, revenue, Opex, EBITDA/margin, maintenance capex, operating and project cash flow, cumulative cash flow and annual operating cash yield against total planned investment.

- Operating break-even: first positive EBITDA year.
- Cash-flow break-even: first positive operating cash-flow year.
- Investment payback: first year cumulative cash flow becomes nonnegative and stays so through year 10; otherwise not recovered within the horizon.
- Simple ROI: year-10 net cumulative project cash flow divided by total project investment.
- Indicative unlevered IRR: year-0 and annual year-end cash flows; unavailable or ambiguous roots are explicit states.

Validation and formulas are deferred. Later tests must cover missing values, invalid shares, phase allocation, currencies, zero capacity/occupancy, Opex modes and IRR edge cases. No formula tests exist in Phase 1 because no formulas exist.
