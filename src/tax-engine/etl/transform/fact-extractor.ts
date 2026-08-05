import type { ExtractedFact, SourceDocument } from "../types";
import { parseNumber } from "../utils";

type PatchPayload = { path: string; value: unknown };

function factsFromJson(document: SourceDocument): ExtractedFact[] {
  const parsed = JSON.parse(document.content) as { facts?: ExtractedFact[]; patches?: PatchPayload[] };
  if (Array.isArray(parsed.facts)) {
    return parsed.facts.map((fact) => ({ ...fact, sourceDocumentId: fact.sourceDocumentId || document.id }));
  }
  if (Array.isArray(parsed.patches)) {
    return parsed.patches.map((patch) => ({
      kind: "fiscal-limits",
      sourceDocumentId: document.id,
      confidence: "official-structured",
      payload: patch
    }));
  }
  return [];
}

function factsFromCsv(document: SourceDocument): ExtractedFact[] {
  const [headerLine, ...lines] = document.content.trim().split(/\r?\n/);
  if (!headerLine) return [];
  const headers = headerLine.split(";").map((item) => item.trim());
  const pathIndex = headers.indexOf("path");
  const valueIndex = headers.indexOf("value");
  const kindIndex = headers.indexOf("kind");
  if (pathIndex === -1 || valueIndex === -1) return [];

  return lines.map((line) => {
    const cells = line.split(";").map((item) => item.trim());
    const parsedNumber = parseNumber(cells[valueIndex] ?? "");
    return {
      kind: (cells[kindIndex] || "fiscal-limits") as ExtractedFact["kind"],
      sourceDocumentId: document.id,
      confidence: "official-structured",
      payload: {
        path: cells[pathIndex],
        value: parsedNumber ?? cells[valueIndex]
      }
    };
  });
}

export function extractFacts(document: SourceDocument): ExtractedFact[] {
  if (document.mediaType === "json") return factsFromJson(document);
  if (document.mediaType === "csv") return factsFromCsv(document);
  return [];
}
