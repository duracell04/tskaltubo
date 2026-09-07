import { expect, it } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
// @ts-expect-error Small build script has no TypeScript declaration file.
import { fixStaticSegments } from "../scripts/fix-static-segments.mjs";

it("repairs nested Windows segment artifacts without touching HTML or existing files", () => {
  const root = mkdtempSync(path.join(tmpdir(), "tskaltubo-segments-"));
  try {
    const nested = path.join(root, "en", "__next.$d$locale", "$d$section");
    mkdirSync(nested, { recursive: true });
    writeFileSync(path.join(nested, "__PAGE__.txt"), "segment");
    writeFileSync(path.join(root, "en", "index.html"), "html");
    expect(fixStaticSegments(root)).toHaveLength(1);
    expect(readFileSync(path.join(root, "en", "__next.$d$locale.$d$section.__PAGE__.txt"), "utf8")).toBe("segment");
    expect(readFileSync(path.join(root, "en", "index.html"), "utf8")).toBe("html");
    expect(fixStaticSegments(root)).toEqual([]);
    writeFileSync(path.join(nested, "__PAGE__.txt"), "different");
    expect(() => fixStaticSegments(root)).toThrow("Conflicting segment artifact");
  } finally {
    if (path.dirname(path.resolve(root)) !== path.resolve(tmpdir()) || !path.basename(root).startsWith("tskaltubo-segments-")) throw new Error("Unsafe cleanup");
    rmSync(root, { recursive: true, force: true });
  }
});
