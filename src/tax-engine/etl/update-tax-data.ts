import { spawnSync } from "node:child_process";
import path from "node:path";
import { getCurrentTaxDataset } from "../repository";
import { extractOfficialDocuments } from "./extract";
import { buildDatasetFromDocuments } from "./transform/build-dataset";
import { validateDataset } from "./validators";
import { loadVersionedDataset } from "./load/write-dataset";
import type { ExtractContext, TaxUpdateSummary } from "./types";

export interface UpdateTaxDataOptions {
  taxYear?: number;
  dryRun?: boolean;
  forceSameYear?: boolean;
  runTests?: boolean;
  allowEmptyFacts?: boolean;
  fetcher?: typeof fetch;
  projectRoot?: string;
}

function runTestSuite(projectRoot: string) {
  const npmExecPath = process.env.npm_execpath;
  const command = npmExecPath ? process.execPath : process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const args = npmExecPath ? [npmExecPath, "test"] : ["test"];
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: "pipe",
    shell: process.platform === "win32",
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(`Los tests fallaron durante tax:update.\n${result.stdout}\n${result.stderr}`);
  }
}

export async function updateTaxData(options: UpdateTaxDataOptions = {}): Promise<TaxUpdateSummary> {
  const base = getCurrentTaxDataset();
  const taxYear = options.taxYear ?? new Date().getFullYear();
  const context: ExtractContext = { taxYear, fetcher: options.fetcher };
  const projectRoot = options.projectRoot ?? process.cwd();
  const dataDir = path.join(projectRoot, "src", "tax-engine", "data");
  const documents = await extractOfficialDocuments(context);
  const transformed = buildDatasetFromDocuments(base, documents, taxYear);
  const validation = validateDataset(transformed.dataset);
  if (transformed.facts.length === 0 && !options.allowEmptyFacts) {
    validation.push({
      path: "etl.facts",
      message: "Ninguna fuente produjo hechos fiscales estructurados. Se cancela para evitar publicar datos no actualizados.",
      severity: "error"
    });
  }
  const errors = validation.filter((issue) => issue.severity === "error");

  const summaryBase = {
    taxYear,
    datasetVersion: transformed.dataset.version,
    documents: documents.map((document) => ({
      id: document.id,
      source: document.source,
      title: document.title,
      url: document.url,
      mediaType: document.mediaType,
      checksum: document.checksum
    })),
    warnings: transformed.warnings,
    validation
  };

  if (errors.length > 0) {
    return {
      ...summaryBase,
      diff: { percentages: [], regions: [], bases: [], deductions: [], metadata: ["Actualización cancelada por errores de validación."] }
    };
  }

  if (options.runTests ?? true) {
    runTestSuite(projectRoot);
  }

  if (options.dryRun) {
    return {
      ...summaryBase,
      diff: { percentages: [], regions: [], bases: [], deductions: [], metadata: ["Dry run: no se escribió ningún archivo."] }
    };
  }

  return loadVersionedDataset(transformed.dataset, summaryBase, {
    dataDir,
    forceSameYear: options.forceSameYear
  });
}
