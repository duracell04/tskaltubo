# Tskaltubo interactive investment memo

A public research memo with an annual investment worksheet. Open a link, explore eleven properties and seven concepts, inspect evidence, and change assumptions locally. No accounts or backend services.

## Run locally

Use Node 22.13 or later:

```sh
npm ci
npm run dev
```

No environment file, API key, database or authentication configuration is required. `npm run build` generates a static site in `out/`. `npm start` serves that directory at http://127.0.0.1:4173 for verification.

## Structure

- Main memo: overview, properties/details/comparison, business concepts and calculator.
- Reference layer: Evidence & risks, searchable Research appendix and Methodology.
- Research: `src/data/research.json`, generated from the immutable dated audit and concept strategy with `npm run import:report`. Static download: `public/data/research.json`.
- Finance: pure annual engine, year 0 plus ten annual periods. Browser edits never change research data and disappear on reload.
- Languages: German, English and Georgian. Specialist research remains English; draft translation notices are visible.

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

## Archive

`archive/full-workspace-prototype` at `b6eb5f2` preserves the earlier collaboration prototype, excluding credentials and generated artifacts. It is not a dependency of this product. The old Supabase project is left untouched for a separate cleanup decision.
