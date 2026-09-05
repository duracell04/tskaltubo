# Tskaltubo Sanatorium Opportunity Explorer

A research framework for examining Tskaltubo sanatorium properties, redevelopment concepts and target markets independently.

**Status: Phase 1 — repository skeleton only.** All research datasets are empty. The map and calculator are placeholders. There are no property assessments, financial assumptions, photographs or deployments.

## Run locally

Use a supported Node.js LTS release (Node 22.13+ recommended) and npm.

```sh
npm ci
npm run dev
```

Open <http://localhost:3000>. `/` redirects to `/de`.

```sh
npm run typecheck
npm run lint
npm run check
npm run build
npm start
```

`check` runs route type generation, strict TypeScript checking and ESLint. `build` verifies production compilation and static generation. No financial test suite is installed because formulas are deliberately absent.

## Routes

Each of `/de`, `/en` and `/ka` has a home page plus `/sanatoriums`, `/compare`, `/scenarios` and `/methodology`. The `/sanatoriums/[slug]` route is ready for researched properties; the empty inventory means every property slug currently returns not found. Unsupported locales also return not found.

Language switching preserves the page path. Georgian structural copy is marked as awaiting native review.

## Structure and boundaries

| Location | Responsibility |
| --- | --- |
| `src/app/` | Locale routes, layouts and placeholder pages |
| `src/components/` | Layout, property, comparison, scenario, finance and map UI |
| `src/types/` | Property, evidence, concept and finance contracts |
| `src/data/` | Empty typed research/scenario collections |
| `src/data/translations/` | Structural UI copy and shared dictionary shape |
| `src/lib/` | Locale/evidence helpers, constants and finance interface |
| `research/` | Working property, market, legal and source research |
| `public/` | Reserved image/map assets; no photographs |
| `docs/` | Standards, methodology, financial contract and deployment notes |

Facts are language-neutral and reference evidence. Narratives are separate. Evidence categories do not imply verification status. Current evidence requires an explicit verification date; missing facts remain unknown. Business concepts do not classify the asset itself. Scenario edits must never mutate property facts.

The finance entry point returns `notImplemented`, never fabricated zero results. The map loads no provider or coordinates. Only navigation needs a client component; placeholder content renders on the server.

No database, CMS, authentication, backend service, analytics, environment variables or deployment configuration are required.

## Next phases

The [Concept & Operating Model Matrix](docs/strategy/concept-operating-model-matrix.md) is the authoritative definition of the seven Tskaltubo scenarios and their service building blocks. All scenarios remain hypotheses; the matrix is a strategy document, with no runtime scenario presets or financial assumptions yet.

Research/input → business concepts and financial model → complete UI → substantive translations and review → full validation → deployment.

See [research standards](docs/research-standard.md), [methodology](docs/methodology.md), [financial-model contract](docs/financial-model.md) and [deployment notes](docs/deployment.md).
