import type { TaxDataset } from "@/types/tax";
import type { ExtractedFact } from "../types";

function setPath(target: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let cursor = target;
  keys.slice(0, -1).forEach((key) => {
    const next = cursor[key];
    if (typeof next !== "object" || next === null) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  });
  cursor[keys[keys.length - 1]] = value;
}

export function applyFacts(base: TaxDataset, facts: ExtractedFact[]): TaxDataset {
  const next = structuredClone(base) as unknown as Record<string, unknown>;

  facts.forEach((fact) => {
    const payload = fact.payload as { path?: string; value?: unknown };
    if (payload.path) setPath(next, payload.path, payload.value);
  });

  return next as unknown as TaxDataset;
}
