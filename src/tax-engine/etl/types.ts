import type { TaxDataset } from "@/types/tax";

export type OfficialSourceId = "aeat" | "seguridad-social" | "boe";

export interface SourceDocument {
  id: string;
  source: OfficialSourceId;
  title: string;
  url: string;
  mediaType: "json" | "csv" | "xml" | "rss" | "pdf" | "html" | "text";
  fetchedAt: string;
  content: string;
  checksum: string;
}

export interface ExtractContext {
  taxYear: number;
  fetcher?: typeof fetch;
  now?: Date;
}

export interface SourceConnector {
  id: OfficialSourceId;
  name: string;
  extract(context: ExtractContext): Promise<SourceDocument[]>;
}

export type FactKind =
  | "state-irpf-brackets"
  | "regional-irpf-brackets"
  | "employee-contributions"
  | "employer-contributions"
  | "contribution-bases"
  | "smi"
  | "mei"
  | "regional-deductions"
  | "fiscal-limits";

export interface ExtractedFact<T = unknown> {
  kind: FactKind;
  sourceDocumentId: string;
  confidence: "official-structured" | "official-semi-structured" | "manual-review-required";
  payload: T;
}

export interface TransformResult {
  dataset: TaxDataset;
  facts: ExtractedFact[];
  warnings: string[];
}

export interface ValidationIssue {
  path: string;
  message: string;
  severity: "error" | "warning";
}

export interface DatasetDiff {
  percentages: string[];
  regions: string[];
  bases: string[];
  deductions: string[];
  metadata: string[];
}

export interface LoadResult {
  writtenDatasetPath: string;
  updatedCurrentPath: string;
  diffPath: string;
  summaryPath: string;
}

export interface TaxUpdateSummary {
  taxYear: number;
  datasetVersion: string;
  documents: Array<Pick<SourceDocument, "id" | "source" | "title" | "url" | "mediaType" | "checksum">>;
  warnings: string[];
  diff: DatasetDiff;
  validation: ValidationIssue[];
  load?: LoadResult;
}
