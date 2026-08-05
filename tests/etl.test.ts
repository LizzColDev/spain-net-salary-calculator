import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildDatasetFromDocuments } from "../src/tax-engine/etl/transform/build-dataset";
import { validateDataset } from "../src/tax-engine/etl/validators";
import { loadVersionedDataset } from "../src/tax-engine/etl/load/write-dataset";
import { updateTaxData } from "../src/tax-engine/etl/update-tax-data";
import { getCurrentTaxDataset } from "../src/tax-engine/repository";
import type { SourceDocument } from "../src/tax-engine/etl/types";

function document(content: unknown): SourceDocument {
  return {
    id: "test-json",
    source: "boe",
    title: "Fuente estructurada de prueba",
    url: "https://www.boe.es/test.json",
    mediaType: "json",
    fetchedAt: "2026-01-01T00:00:00.000Z",
    checksum: "test",
    content: JSON.stringify(content)
  };
}

describe("tax ETL", () => {
  it("applies structured official patches and validates the dataset", () => {
    const base = getCurrentTaxDataset();
    const transformed = buildDatasetFromDocuments(
      base,
      [document({ patches: [{ path: "contributionBases.monthlyMax", value: 5200 }] })],
      2027
    );

    expect(transformed.dataset.taxYear).toBe(2027);
    expect(transformed.dataset.contributionBases.monthlyMax).toBe(5200);
    expect(validateDataset(transformed.dataset).filter((issue) => issue.severity === "error")).toHaveLength(0);
  });

  it("writes versioned datasets and diff reports", async () => {
    const temp = await mkdtemp(path.join(tmpdir(), "tax-etl-"));
    try {
      const base = getCurrentTaxDataset();
      await writeFile(path.join(temp, "current.json"), `${JSON.stringify(base, null, 2)}\n`, "utf8");
      const transformed = buildDatasetFromDocuments(
        base,
        [document({ patches: [{ path: "smi.annual", value: 18000 }] })],
        2099
      );
      const summary = await loadVersionedDataset(
        transformed.dataset,
        {
          taxYear: 2099,
          datasetVersion: transformed.dataset.version,
          documents: [],
          warnings: [],
          validation: []
        },
        { dataDir: temp }
      );

      expect(summary.load?.writtenDatasetPath.endsWith("2099.json")).toBe(true);
      expect(summary.diff.bases.some((item) => item.includes("SMI"))).toBe(true);
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });

  it("cancels updates when no structured facts are extracted", async () => {
    const fetcher = async () => new Response("<html>official page without structured rates</html>", { status: 200 });
    const summary = await updateTaxData({
      taxYear: 2098,
      dryRun: true,
      runTests: false,
      fetcher: fetcher as typeof fetch
    });

    expect(summary.validation.some((issue) => issue.path === "etl.facts" && issue.severity === "error")).toBe(true);
    expect(summary.load).toBeUndefined();
  });
});
