# Tskaltubo property research

A static inventory of 22 named historic resort properties for a senior-living and care investigation. Explore dated evidence, property news and next verification steps. Seven scenarios and the original eleven-property audit remain under Project, with an annual investment worksheet. No accounts or backend services.

## Run locally

Use Node 22.13 or later:

```sh
npm ci
npm run dev
```

No environment file, API key, database or authentication configuration is required. `npm run build` generates a static site in `out/`. `npm start` serves that directory at http://127.0.0.1:4173 for verification.

## Structure

- Main navigation: Sanatoriums, News, Project and Sources. The homepage opens the maintained inventory.
- Maintained research: `src/data/properties.ts`, `evidence.ts`, `property-identities.ts` and `property-news.ts`. Explicit identities preserve all existing property URLs.
- Historical audit: `src/data/research.json`, generated from the immutable dated audit and concept strategy with `npm run import:report`. Static download: `public/data/research.json`.
- Finance: pure annual engine, year 0 plus ten annual periods. Browser edits never change research data and disappear on reload.
- Languages: English, German and Georgian. New property narratives have all three versions; German and Georgian await native review. The historical specialist audit remains English.

The care-plus-rehabilitation report configuration is provisional. Report assertions are attributed and unverified; historical asset values do not establish availability or current ownership. Unknown financial inputs remain null.

## Verify

```sh
npm test
npm run check
npm run build
npm start
npm run verify:http
```

See [financial conventions](docs/financial-model.md), [deployment](docs/deployment.md), and [verification](docs/verification.md).

The audit importer does not overwrite the maintained inventory. See [property research log](docs/property-research-log.md) for source checks and remaining gaps. Sources includes a copyable NASP request; no request has been sent.

With agent-browser installed, run `node scripts/verify-property-browser.mjs http://127.0.0.1:4173 /path/to/agent-browser`. Screenshots and results go to ignored `.verification/property-first/`. This script verifies local pages only.

## Archive

`archive/full-workspace-prototype` at `b6eb5f2` preserves the earlier collaboration prototype, excluding credentials and generated artifacts. It is not a dependency of this product. The old Supabase project is left untouched for a separate cleanup decision.
