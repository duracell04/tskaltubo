# Static memo verification

## Property-first revision, 7 September 2026

- Maintained inventory: 22 identities, 66 localized profiles, dated claim-level evidence and property-linked news. Original eleven-property audit and seven scenario definitions remain unchanged.
- Type checking and ESLint pass. All 26 tests pass, including identity/source validation, conflicting figures, historical availability, forecast/registry/map guards, Georgian number formatting, audit importer isolation and static segment compatibility.
- Production export builds successfully. HTTP verification covers 99 localized routes, invalid/removed routes, legacy redirects and the unchanged audit download.
- Headless Chromium: 137 acceptance checks, including 81 viewport/page combinations at 360, 768 and 1440px in English, German and Georgian. No document overflow, missing control labels, failed resources, page errors or console messages in the final suite.
- Interactions cover alias/cadastral search, combined filters, empty results, historical-auction labels, both price conflicts, source anchors, news-to-property navigation, all seven scenarios, calculator edits/reference/reset, mobile keyboard navigation/table scrolling, language route/query/fragment preservation and request-copy feedback.
- Screenshots and the machine-readable results are under ignored `.verification/property-first/`; the repeatable harness is `scripts/verify-property-browser.mjs`. The local CLI required an explicitly selected installed Chromium executable and a fresh task-owned session to avoid stale error-buffer entries.
- Browser testing exposed Next.js Windows export issue [#92339](https://github.com/vercel/next.js/issues/92339). A postbuild compatibility script adds missing flat segment artifacts inside `out/`, preserves original files and rejects conflicting content. It is idempotent and leaves correct exports alone. No dependency or hosting changes.
- Browser testing also exposed missing Georgian ICU support in Chromium. Explicit property-number formatting now matches server output; a regression test protects this.
- Native German/Georgian review and fresh title/availability evidence remain outstanding research limitations, not verified facts. The NASP request is drafted only. No deployment or external correspondence was performed.

## Mobile layout correction, 7 September 2026

- Chromium checks cover all 57 routes in English, German and Georgian at 320, 360, 390, 412 and 768px: 285 viewport checks and 570 closed/expanded states. Every state satisfies `document.documentElement.scrollWidth === document.documentElement.clientWidth`; no clipped cards, multi-column card/input groups or undersized form controls were detected.
- Native menu keyboard activation, visible focus, active-page indication, closing after navigation, and language switching with the current route/query/fragment were verified. Calculator renovation edits change results without changing the report reference; reset restores the baseline. Wide tables scroll independently with the keyboard.
- Full-page desktop overview screenshots at 1280px and 1440px are pixel-identical before and after the correction. Phone screenshots cover Overview, Intouristi property detail and Calculator in all three locales.
- Financial table cells retain normal word wrapping so amounts remain readable inside their horizontal scroll container. A separate final table check covers comparison, calculator and appendix in all three locales at all five widths.
- Evidence is saved under the ignored `.verification/mobile/` directory: browser matrices, interaction results, desktop comparison and screenshots. Production deployment identity and hosted checks belong to the release report; these local results alone do not certify deployment.

## Static simplification

Refactor verification, 6 September 2026.

- Full prototype archived at `archive/full-workspace-prototype` (`b6eb5f2`); secrets and provider state excluded.
- Static Next.js export produces the three locales, all eleven property details and research pages.
- Annual model and source integrity tests pass, including report reconciliation and financial edge cases.
- TypeScript and ESLint pass.
- Local static HTTP verification passes all 57 page/locale combinations, seven removed/invalid routes, six legacy redirects and the static data export.
- Browser check: renovation-cost change updates investment while report reference stays fixed; reset restores base. No API/Supabase resource requests or browser storage keys observed.

Final clean-checkout build, production deployment identity and hosted interaction checks are recorded in the release report and Netlify deployment metadata. Google OAuth is intentionally removed; no onboarding or administrator activation is required.

The clean checkout passed typecheck, lint, all 17 tests and the complete static build without environment files. An isolated Netlify preview passed all 57 routes and every removed API/auth URL returned 404. Archived local Netlify cache was excluded after the initial preview exposed old functions. Browser checks cover historical property input copying, report/source navigation, property/concept comparison, report search, keyboard skip-link focus, mobile overflow, calculator changes/reset and absent service/storage activity. A print test PDF generated successfully.
