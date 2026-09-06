import fs from "node:fs";
import crypto from "node:crypto";
const source =
  process.argv[2] || "research/sources/2026-09-06-integrated-audit.md";
const bytes = fs.readFileSync(source);
const report = bytes.toString("utf8").replace(/^\uFEFF/, "");
fs.mkdirSync("research/sources", { recursive: true });
if (source !== "research/sources/2026-09-06-integrated-audit.md")
  fs.writeFileSync("research/sources/2026-09-06-integrated-audit.md", bytes);
const sections = [
  ...report.matchAll(
    /^## (\d+)\. ([^\r\n]+)\r?\n([\s\S]*?)(?=^## \d+\.|$(?![\s\S]))/gm,
  ),
].map((m) => ({
  id: `section-${m[1]}`,
  number: Number(m[1]),
  title: m[2],
  body: m[3].trim(),
}));
const section = (n) => sections.find((s) => s.number === n)?.body || "";
const table = (text) =>
  text
    .split(/\r?\n/)
    .filter((l) => l.startsWith("|") && !/^\|[\s:|-]+$/.test(l))
    .map((l) =>
      l
        .split("|")
        .slice(1, -1)
        .map((s) => s.trim().replace(/\*\*/g, "")),
    );
const sub = (n, heading) =>
  section(n)
    .split(heading)[1]
    ?.split(/\r?\n### /)[0] || "";
const names = [
  "intouristi",
  "geologist",
  "savane",
  "imereti",
  "meshakhte",
  "rkinigzeli",
  "megobroba",
  "philiali",
  "gelati",
  "aia",
  "medea",
];
const assets = table(sub(8, "### 8.2 Historical asset screen"))
  .slice(1)
  .map((r, i) => ({
    id: names[i],
    name: r[0],
    cadastral: r[1],
    landArea: r[2],
    historicalValue: r[3],
    signal: r[4],
    screen: r[5],
    titleStatus: "unknown",
    availability: "unknown",
    coordinates: null,
    sourceId: "audit-2026",
    locator: "8.2",
    classification: "market_field",
    verification: "unverified",
    informationGapPriority: ["geologist", "imereti", "meshakhte"].includes(
      names[i],
    )
      ? "Urgent: contradictory or missing title/status evidence"
      : "Fresh registry and transaction evidence required",
  }));
const expertise = (text) =>
  /licen|legal|benefit|GDPR|title|ownership|occupant/i.test(text)
    ? "legal"
    : /staff|clinical|hospital|water|rehab/i.test(text)
      ? "clinical"
      : /cost|structur|pilot|heritage|construction/i.test(text)
        ? "engineering"
        : /cash|equity|margin|currency|EUR|financ/i.test(text)
          ? "financing"
          : /demand|relocat|referral|travel/i.test(text)
            ? "demand"
            : "operating";
const risks = table(section(12))
  .slice(1)
  .map((r, i) => ({
    id: `risk-${i + 1}`,
    title: r[0],
    probability: r[1],
    impact: r[2],
    rating: r[3],
    mitigation: r[4],
    expertise: expertise(r.join(" ")),
    status: "open",
    sourceId: "audit-2026",
    locator: "12",
    classification: "assumption",
  }));
const tasks = table(sub(17, "### 17.1 Priority sequence"))
  .slice(1)
  .map((r, i) => ({
    id: `task-${i + 1}`,
    priority: Number(r[0]),
    title: r[1],
    output: r[2],
    rationale: r[3],
    expertise: expertise(r.join(" ")),
    status: "not_started",
    ownerId: null,
    sourceId: "audit-2026",
    locator: "17.1",
  }));
const decisions = table(sub(18, "### 18.1 Decisions still required"))
  .slice(1)
  .map((r, i) => ({
    id: `decision-${i + 1}`,
    title: r[0],
    status: r[1],
    ownerRole: r[2],
    expertise: expertise(r.join(" ")),
    sourceId: "audit-2026",
    locator: "18.1",
  }));
const gates = [
  ...section(13).matchAll(
    /^### 13\.\d+:? Gate (\d+): ([^\r\n]+)\r?\n([\s\S]*?)(?=^### |$(?![\s\S]))/gm,
  ),
].map((m) => ({
  id: `gate-${m[1]}`,
  number: Number(m[1]),
  title: m[2],
  body: m[3].trim(),
  status: "not_approved",
  sourceId: "audit-2026",
  locator: `13.${Number(m[1]) + 1}`,
}));
const claims = table(
  section(20)
    .split("### Appendix A: Claims register")[1]
    ?.split("### Appendix B:")[0] || "",
)
  .slice(1)
  .map((r, i) => ({
    id: `claim-${i + 1}`,
    title: r[0],
    status: r[1],
    wording: r[2],
    required: r[3],
    classification: /5.3%/.test(r[0])
      ? "derived"
      : /cost|Self-pay|Referrals|DACH-quality|capex/.test(r[0])
        ? "assumption"
        : "market_field",
    verification: "unverified",
    sourceId: "audit-2026",
    locator: "Appendix A",
  }));
const sources = [
  {
    id: "audit-2026",
    title: "Integrated Audit, Pre-Feasibility and Execution Framework",
    publisher: "Project working document",
    publishedAt: "2026-09-06",
    accessedAt: null,
    url: null,
    documentPath: "research/sources/2026-09-06-integrated-audit.md",
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
    availability: "retained",
    verification: "unverified",
  },
  ...[...section(19).matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)].map(
    (m, i) => ({
      id: `source-${i + 1}`,
      title: m[1],
      url: m[2],
      publisher: new URL(m[2]).hostname,
      publishedAt: null,
      accessedAt: null,
      availability: "referenced_link",
      verification: "unverified",
    }),
  ),
];
const strategy = fs.readFileSync(
  "docs/strategy/concept-operating-model-matrix.md",
  "utf8",
);
const concepts = [
  ...strategy.matchAll(
    /^### TSK-S(\d) — ([^\r\n]+)\r?\n([\s\S]*?)(?=^### |^## |$(?![\s\S]))/gm,
  ),
].map((m) => ({
  id: `TSK-S${m[1]}`,
  title: m[2],
  body: m[3].replace(/\n---\s*$/, "").trim(),
  classification: "assumption",
  verification: "unverified",
  sourceId: "strategy-matrix",
  locator: `4 / TSK-S${m[1]}`,
}));
const matrix = table(
  strategy.split("## 3. Scenario matrix")[1]?.split("## 4.")[0] || "",
);
concepts.forEach((c) => {
  const row = matrix.find((r) => r[0]?.startsWith(c.id));
  c.services = row
    ? Object.fromEntries(matrix[0].slice(1).map((k, i) => [k, row[i + 1]]))
    : {};
});
sources.push({
  id: "strategy-matrix",
  title: "Concept & Operating Model Matrix",
  publisher: "Project strategy",
  publishedAt: null,
  accessedAt: null,
  url: null,
  documentPath: "docs/strategy/concept-operating-model-matrix.md",
  availability: "retained",
  verification: "unverified",
});
const out = {
  version: 1,
  asOf: "2026-09-06",
  reportSha256: sources[0].sha256,
  sections,
  assets,
  concepts,
  risks,
  tasks,
  decisions,
  gates,
  claims,
  sources,
  strategy,
};
if (
  sections.length !== 20 ||
  assets.length !== 11 ||
  concepts.length !== 7 ||
  gates.length !== 6
)
  throw new Error(
    `Import incomplete: ${sections.length} sections, ${assets.length} assets, ${concepts.length} concepts, ${gates.length} gates`,
  );
fs.mkdirSync("src/data", { recursive: true });
fs.writeFileSync(
  "src/data/research.json",
  JSON.stringify(out, null, 2) + "\n",
);
console.log(
  `Imported ${sections.length} sections, ${assets.length} assets, ${concepts.length} concepts, ${risks.length} risks, ${gates.length} gates. SHA256 ${out.reportSha256}`,
);

fs.mkdirSync("public/data", { recursive: true });
fs.copyFileSync("src/data/research.json", "public/data/research.json");
