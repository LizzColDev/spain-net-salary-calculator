import crypto from "node:crypto";

export function sha256(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

export function parseNumber(value: string) {
  const normalized = value
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}

export async function fetchText(url: string, fetcher: typeof fetch = fetch) {
  const response = await fetcher(url, {
    headers: {
      "User-Agent": "salario-neto-espana-tax-etl/1.0 (+https://localhost)"
    }
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

export function compactJson(value: unknown) {
  return JSON.stringify(value, Object.keys(value as object).sort());
}
