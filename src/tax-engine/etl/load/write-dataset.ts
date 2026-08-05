import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { LoadResult, TaxUpdateSummary } from "../types";
import type { TaxDataset } from "@/types/tax";
import { compareDatasets } from "./diff";

export interface LoadOptions {
  dataDir: string;
  forceSameYear?: boolean;
}

async function readDataset(filePath: string): Promise<TaxDataset | undefined> {
  if (!existsSync(filePath)) return undefined;
  return JSON.parse(await readFile(filePath, "utf8")) as TaxDataset;
}

export async function loadVersionedDataset(dataset: TaxDataset, summary: Omit<TaxUpdateSummary, "load" | "diff">, options: LoadOptions): Promise<TaxUpdateSummary> {
  await mkdir(options.dataDir, { recursive: true });
  const yearPath = path.join(options.dataDir, `${dataset.taxYear}.json`);
  const currentPath = path.join(options.dataDir, "current.json");
  const previous = await readDataset(currentPath);
  const diff = compareDatasets(previous, dataset);

  const currentYear = new Date().getFullYear();
  if (existsSync(yearPath) && dataset.taxYear < currentYear && !options.forceSameYear) {
    throw new Error(`El dataset histórico ${dataset.taxYear}.json ya existe. No se sobrescriben años anteriores sin --force-same-year.`);
  }

  const diffPath = path.join(options.dataDir, `${dataset.taxYear}.diff.json`);
  const summaryPath = path.join(options.dataDir, `${dataset.taxYear}.summary.json`);
  const serializedDataset = `${JSON.stringify(dataset, null, 2)}\n`;
  const fullSummary: TaxUpdateSummary = {
    ...summary,
    diff,
    load: {
      writtenDatasetPath: yearPath,
      updatedCurrentPath: currentPath,
      diffPath,
      summaryPath
    }
  };

  await writeFile(yearPath, serializedDataset, "utf8");
  await writeFile(currentPath, serializedDataset, "utf8");
  await writeFile(diffPath, `${JSON.stringify(diff, null, 2)}\n`, "utf8");
  await writeFile(summaryPath, `${JSON.stringify(fullSummary, null, 2)}\n`, "utf8");

  return fullSummary;
}
