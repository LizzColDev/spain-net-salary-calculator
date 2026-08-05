import type { SourceDocument, TransformResult } from "../types";
import type { TaxDataset } from "@/types/tax";
import { extractFacts } from "./fact-extractor";
import { applyFacts } from "./apply-facts";
import { sha256 } from "../utils";

export function buildDatasetFromDocuments(base: TaxDataset, documents: SourceDocument[], taxYear: number): TransformResult {
  const facts = documents.flatMap(extractFacts);
  const warnings: string[] = [];
  const dataset = applyFacts(base, facts);

  if (facts.length === 0) {
    warnings.push("No se encontraron hechos fiscales estructurados; se generó candidato desde el último dataset válido.");
  }

  dataset.taxYear = taxYear;
  dataset.effectiveFrom = `${taxYear}-01-01`;
  dataset.publishedAt = new Date().toISOString();
  dataset.version = `${taxYear}.${documents.length}.${facts.length}`;
  dataset.sources = documents.map((document) => ({
    id: document.id,
    name: document.title,
    url: document.url,
    type: document.source === "boe" ? "boe" : document.mediaType === "html" ? "html" : document.mediaType === "pdf" ? "pdf" : "api"
  }));
  dataset.checksum = sha256(JSON.stringify({ ...dataset, checksum: "" }));

  return { dataset, facts, warnings };
}
