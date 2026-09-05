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

All datasets are empty in Phase 1. Canonical names, slugs and factual records are established during research, not generated as examples.

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

## Missing values, units and dates

Use `SourcedValue` with `status: "unknown"` and `value: null` for missing facts. Zero remains an actual value. Nullable source metadata represents unavailable information.

Retain year/month/day precision using `ResearchDate`, formatted as `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. Calendar validity, source references and numeric constraints require runtime validation before data is published; TypeScript alone does not enforce these.

Areas use square metres and distinguish plot, gross building and usable area. Historical asking, auction-reserve and transaction prices retain their original currencies and dates. They are not current acquisition assumptions.

Media requires source ID, attribution, licence and capture date where known. Unknown coordinates mean no marker. Do not use fictional property photographs.

## Translations

Translate narratives separately; avoid repeating factual values inside prose. Georgian structural copy awaits native review. Keep Betreuung and Pflege distinct rather than translating both through a generic care label.
