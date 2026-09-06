import { it, expect } from "vitest";
import { validateFile, checkSignature, MAX_UPLOAD } from "../src/lib/uploads";
it("enforces file size and an explicit MIME allowlist", () => {
  expect(validateFile("report.pdf", 123, "application/pdf")).toBe("pdf");
  expect(() =>
    validateFile("x.pdf", MAX_UPLOAD + 1, "application/pdf"),
  ).toThrow();
  expect(() => validateFile("x.html", 100, "text/html")).toThrow();
  expect(() => validateFile("x.pdf", 100, "text/html")).toThrow();
});
it("rejects disguised executable markup before publication", () => {
  expect(() =>
    checkSignature(new TextEncoder().encode("<script>bad</script>"), "pdf"),
  ).toThrow();
  expect(() =>
    checkSignature(new TextEncoder().encode("%PDF-1.7"), "pdf"),
  ).not.toThrow();
  expect(() => checkSignature(new Uint8Array([0, 1, 2]), "csv")).toThrow();
});
