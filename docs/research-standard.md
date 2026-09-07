# Research standard

## Responsibilities

- `src/types/`: TypeScript contracts, not runtime validators.
- `src/data/properties.ts`: language-neutral assets and a separate translated-narrative collection.
- `src/data/evidence.ts`: shared sources and claim-level evidence.
- `src/data/markets.ts`: target-market definitions, independent of assets.
- `docs/strategy/concept-operating-model-matrix.md`: authoritative concept definitions and scenario decision statuses.
- `src/data/scenarios.ts`: empty runtime collection reserved for future business concepts, separate narratives and explicit model assumptions. Do not duplicate the Markdown definitions into typed data until an interactive comparison needs them.
- `src/data/translations/`: structural UI text only; never duplicated factual numbers.
- `research/`: working material awaiting review.

The maintained property and evidence datasets were populated on 7 September 2026. `property-identities.ts` contains the reviewed identity mapping, including the eleven stable audit IDs. New identities use reviewed names, never row positions. `property-news.ts` connects attributed news to claims and properties. These collections are independent of generated `research.json` and its historical audit importer.

Portfolio memberships are dated records: historic inventory, September 2025 state offers and original audit shortlist. Counts are derived from included records. The ministry's reported 2022 programme total is separately attributed; the inaccessible catalogue is not used to manufacture membership records.

Concept-related research must reference the relevant scenario IDs (`TSK-S1` through `TSK-S7`) and building-block IDs from the [concept matrix](strategy/concept-operating-model-matrix.md). Separate evidence from assumptions and record sources and retrieval dates for factual claims. Update the matrix when a scenario definition or decision status changes. Scenario decision statuses such as Hypothesis, Shortlisted and Preferred are separate from the claim verification statuses below.

## Provenance

Each known property value references at least one evidence ID. Evidence references sources and records an effective date, verification date and document locator where available. A source describes the document; evidence describes support for a particular claim.

| Category | Meaning |
| --- | --- |
| `official` | Government, registry or official statistics |
| `market` | Auction, transaction or operator information |
| `field` | Observation or field report |
| `assumption` | An explicit analytical input |

| Status | Meaning |
| --- | --- |
| `current` | Explicitly verified for the stated date; requires a day-precision verification date |
| `historical` | Describes an earlier state without claiming it persists |
| `reported` | Attributed information not independently established |
| `unverified` | A claim awaiting review |
| `unknown` | No established claim |

Category and status are independent. Official does not mean current. Accessing an old document does not refresh an ownership claim. Statuses are editorial judgments with dates, not numeric confidence scores.

Sources retain language, source type and access result. Blocked or unretrieved documents cannot support promoted verified claims. A registry directory is not a property extract. The registry-verified ownership label requires a current property-specific registry extract verified on the research date. None is established in this revision.

Historical buyers, reported owners, shareholders, developers and operators have separate roles. Active offers require day-precision confirmation, an authorized party, validity end date and current evidence; expired or incomplete confirmations display as unknown. None is established in this revision.

Inventory evidence age uses the latest underlying ownership, development, operation or price date, not access dates or the audit's compilation date. Age is measured against the displayed research date: within twelve calendar months, older or undated. Partial dates use their earliest possible day conservatively. Age does not certify title or availability.

Price events retain type, currency, date, scope and tax treatment independently. Conflicting records stay visible with explicit questions. Investment obligations are not construction-cost estimates. Forecasts cannot establish completion. Reversions remain in ownership history.

## Missing values, units and dates

Use `SourcedValue` with `status: "unknown"` and `value: null` for missing facts. Zero remains an actual value. Nullable source metadata represents unavailable information.

Retain year/month/day precision using `ResearchDate`, formatted as `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. Calendar validity, source references and numeric constraints require runtime validation before data is published; TypeScript alone does not enforce these.

Areas use square metres and distinguish plot, gross building and usable area. Historical asking, auction-reserve and transaction prices retain their original currencies and dates. They are not current acquisition assumptions.

Media requires source ID, attribution, licence and capture date where known. Unknown coordinates mean no marker. Do not use fictional property photographs.

`validatePropertyResearch` runs before static page generation and in content tests. It checks references, dates, sourced values, translations and publication guards. An importer-isolation test runs the historical importer in a temporary fixture and verifies maintained research bytes remain unchanged.

## Translations

Translate narratives separately; avoid repeating factual values inside prose. Georgian structural copy awaits native review. Keep Betreuung and Pflege distinct rather than translating both through a generic care label.
