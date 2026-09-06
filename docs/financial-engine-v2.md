# Monthly development engine, schema version 2

`src/lib/model-schema.ts` validates all model inputs. `src/lib/finance.ts` is the pure calculation engine shared by the browser and model-save endpoint. `engineVersion: 2.0.0` is retained in saved variants. No historical v1 model records exist to migrate; the former annual contract is superseded.

## Timing and inputs

Month indices start at 0. The configurable 1–360 month horizon defaults to 120 months. The date must be the first of a month. Opening occurs at the start of an explicitly selected month; available capacity is the sum of opened phases less service-specific unavailable beds. Bed-service shares sum to one; outpatient/session services do not consume a residential share. Daily prices use actual calendar days, monthly prices one period per month. Occupancy is a fraction. Admissions = occupied bed-days / length of stay.

Null means unknown, and zero is an explicit assumption. Schedules must have one entry per model month. The editor's calendar, eight-hour shift blocks and service scaffolding are planning defaults, not evidence of an opening programme or safe roster. Imported report values retain their source note. Additional source/date/reason information can be added in the assumptions register. No rates or budgets are inferred for the other six concepts.

## Costs and cash

Report screening reproduces 98 care beds plus 42 rehabilitation beds, assumed EBITDA margins and 2% maintenance. Exact base development arithmetic is €22,209,450. The report's worked revenue is €5,609,408.70 and pre-tax cash €1,177,975.827. Its rounded €22.21m denominator yields 5.30% stabilized unlevered pre-tax cash yield, not IRR.

The monthly model uses bottom-up costs. Roster mode computes each role's paid FTE from the greater of its allocated acuity hours and shift coverage, divided by productive hours per paid FTE. Loaded wages include the costs supplied by the user. Aggregate mode is an explicitly selected simpler coverage estimate. The two modes replace each other; payroll is not added twice. Language coverage is reported against the user's assumed requirement and is not certified clinically safe.

Direct development costs are allocated to PropCo or OpCo. Soft costs and contingency follow their direct-cost allocation. Contingency can explicitly apply to direct costs alone or direct plus soft costs. Acquisition and transaction expenses, pre-opening, sponsor costs and replacement capex are separate. The total development-investment indicator includes initial working capital and the continuity reserve; it excludes future replacement capex, financing and unconfigured tax. Scheduled project cash includes replacements when they occur.

Receivables/payables use monthly run-rate days. Their change, plus explicit working-capital movements, affects cash. Users must avoid duplicating the same requirement in both schedules. Deposits/refunds are tracked as restricted liabilities and never fund project distributions. Refunds cannot exceed cumulative deposits.

EUR is the reporting currency; foreign costs and revenue require explicit EUR-per-unit FX. The input assumptions register carries the FX source/date. These are scenario conversion assumptions, not automatic live rates or a hedging model.

## Entities, debt and tax

Rent is revenue in PropCo and expense in OpCo, eliminated from combined EBITDA and cash. Entity cash schedules are before financing; global debt is assigned to the property/development financing layer. Debt draws occur at month start; interest applies to opening debt plus current draws, principal is paid at month end. Interest may be capitalized during explicitly selected development months. Repayments cannot exceed debt; a configured terminal sale repays remaining debt before equity distribution.

Tax can remain unresolved, be explicitly excluded, or use supplied entity rates, depreciation, withholding, VAT/customs cash and payment lag. The configured income-tax computation applies supplied rates to positive entity income with the chosen lag; it does not implement a legal conclusion about Georgia's distribution-tax regime or assume loss carryforwards. A qualified adviser must supply appropriate schedules and treatment. Unlevered project cash excludes debt interest and uses the corresponding unlevered tax base; equity reflects financing and withholding. VAT/customs cash is allocated to PropCo. Terminal tax cash must include any outstanding disposal or deferred liabilities that arise on exit.

DSCR uses EBITDA less maintenance, working-capital movement and cash taxes divided by paid interest plus scheduled principal. Capitalized interest is not paid debt service. Rent cover uses consolidated pre-rent EBITDA / rent. Neither definition claims lender approval. Zero debt service/rent gives an unavailable ratio, not infinity.

## Returns, scenarios and limitations

All monthly cash flows are placed at their month index; index 0 is the valuation date. NPV uses the supplied annual effective discount rate. IRR is solved monthly and annualized. Missing inputs, absence of opposite-signed cash flows, or multiple sign changes return explicit unavailable/ambiguous states. No terminal value is assumed until the user selects either no disposal or a configured final-month sale.

Committed equity is a schedule, never a silently assumed funding plug. Negative accumulated cash appears as a funding gap and suppresses equity IRR until resolved. Positive cash after commitments is distributed, while the continuity reserve and resident deposits remain excluded. Closing working capital and continuity funds are not automatically released. A no-disposal horizon retains assets and liabilities.

Downside controls change opening timing, direct capex, wages, prices, occupancy and operator-withdrawal occupancy. Users must also adjust affected spending, financing, closure costs and terminal assumptions; the engine does not infer those consequences. The model is a development analysis tool, not accounting software or a validated investment case.

Automated tests use explicitly synthetic inputs separate from the project seed and cover arithmetic, phasing, leap years, currencies, unknowns, cash consolidation, deposits, debt, tax lag and IRR edge cases.
