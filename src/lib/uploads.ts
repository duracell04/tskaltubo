export const MAX_UPLOAD = 10 * 1024 * 1024;
export const uploadTypes: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  csv: "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
};
export function validateFile(name: string, size: number, mime: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (!uploadTypes[ext] || uploadTypes[ext] !== mime)
    throw new Error("Allowed files: PDF, PNG, JPEG, CSV, XLSX and XLS");
  if (size <= 0 || size > MAX_UPLOAD)
    throw new Error("File must be between 1 byte and 10 MB");
  return ext;
}
export function checkSignature(bytes: Uint8Array, ext: string) {
  const hex = Array.from(bytes.slice(0, 8))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const prefixes: Record<string, string> = {
    pdf: "25504446",
    png: "89504e470d0a1a0a",
    jpg: "ffd8ff",
    jpeg: "ffd8ff",
    xlsx: "504b0304",
    xls: "d0cf11e0a1b11ae1",
  };
  if (ext === "csv") {
    if (bytes.includes(0)) throw new Error("CSV must contain text");
  } else if (!hex.startsWith(prefixes[ext] ?? "INVALID"))
    throw new Error("File content does not match its extension");
}
