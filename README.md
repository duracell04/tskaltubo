# Tskaltubo transparent partner workspace

A Next.js partner-facing project workspace for **Tskaltubo Senior Living & Care Development**. All seven operating concepts remain visible; the care-led configuration is a provisional hypothesis. Historical property assertions are not current verified title or offers.

## Run and verify

Use Node 22.13+ and npm. A project-local Node 22 runtime is installed for environments with an older system version.

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
```

The root redirects to `/de`. DE, EN and KA routes provide overview, concepts, properties and individual assets, comparison, finance, diligence, evidence, report, collaboration and methodology. Unknown locales/pages/assets return 404.

The app works without credentials as a labeled, dated read-only source snapshot. Anonymous financial experiments and exports work locally; no saved collaboration is simulated. Live storage/auth/database setup is documented in [deployment](docs/deployment.md).

## Included

- Full original audit: 20 sections, 11 historic assets, 7 strategy concepts, 24 risks, 6 gates, 10 priority tasks, claims, decisions and sources.
- Source hash, provenance, explicit unknowns, searchable report and side-by-side comparisons.
- Report arithmetic and a versioned monthly development model with roster payroll, entity cash flows, debt, configurable tax, FX, liquidity, returns and downside scenarios.
- Public read access, Google sign-in, invited contributors, administrator review, private evidence uploads, task assignment, optimistic revisions and explicit gate decisions.
- Database migrations, repeatable seed import, public exports and a tested read-only fallback.

The report and strategy are retained as source versions. Linked external sources and unavailable original decks/registry documents are not represented as independently reviewed. English research extracts remain available in all locales; translated navigation, overview and concept summaries are marked as draft translations.

## Documentation

- [Financial engine conventions and limits](docs/financial-engine-v2.md)
- [Access, publication, evidence and backup operations](docs/workspace-operations.md)
- [Deployment and service connection](docs/deployment.md)
- [Seven-concept strategy](docs/strategy/concept-operating-model-matrix.md)

Tests use synthetic financial data separately from the project seed and exercise actual PostgreSQL functions/row-level permissions through PGlite. Provider OAuth, signed storage and production behavior also need hosted verification once connected.
