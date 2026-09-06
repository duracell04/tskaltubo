const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const routes = [
  "",
  "/scenarios",
  "/sanatoriums",
  "/sanatoriums/intouristi",
  "/compare",
  "/finance",
  "/diligence",
  "/evidence?kind=source",
  "/report",
  "/workspace",
  "/methodology",
];
const failures = [];
for (const locale of ["de", "en", "ka"])
  for (const route of routes) {
    const response = await fetch(`${origin}/${locale}${route}`);
    const text = await response.text();
    if (response.status !== 200 || !text.includes("Tskaltubo"))
      failures.push(`${locale}${route}: ${response.status}`);
  }
for (const route of ["/fr", "/en/nonexistent", "/en/sanatoriums/nonexistent"]) {
  const r = await fetch(origin + route);
  if (r.status !== 404)
    failures.push(`${route}: expected 404, received ${r.status}`);
}
const state = await fetch(origin + "/api/workspace").then((r) => r.json());
if (state.member !== null || state.drafts.length)
  failures.push("Anonymous account data exposed");
const unauthorized = await fetch(origin + "/api/workspace", {
  method: "POST",
  headers: { Origin: origin, "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "create",
    kind: "contribution",
    title: "Unauthorized",
    body: {},
    rationale: "Permission boundary test",
  }),
});
if (unauthorized.status !== 401)
  failures.push("Anonymous mutation was not denied");
const badOrigin = await fetch(origin + "/api/workspace", {
  method: "POST",
  headers: {
    Origin: "https://unrelated.invalid",
    "Content-Type": "application/json",
  },
  body: "{}",
});
if (badOrigin.status !== 403)
  failures.push("Cross-origin mutation was not denied");
const exported = await fetch(origin + "/api/export");
const data = await exported.json();
if (data.records.length < 80 || data.sections.length !== 20)
  failures.push("Public export incomplete");
console.log(
  JSON.stringify(
    {
      routes: 33,
      notFoundCases: 3,
      anonymousWritesDenied: unauthorized.status === 401,
      crossOriginDenied: badOrigin.status === 403,
      publicRecords: data.records.length,
      failures,
    },
    null,
    2,
  ),
);
if (failures.length) process.exitCode = 1;
