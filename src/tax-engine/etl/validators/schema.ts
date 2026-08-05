import type { TaxDataset } from "@/types/tax";
import type { ValidationIssue } from "../types";

export function validateStructure(dataset: TaxDataset): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const requiredTopLevel: Array<keyof TaxDataset> = [
    "version",
    "jurisdiction",
    "taxYear",
    "effectiveFrom",
    "publishedAt",
    "checksum",
    "sources",
    "stateBrackets",
    "regions",
    "personalAllowances",
    "contributionRates",
    "contributionBases",
    "smi",
    "flexibleCompensationExemptions"
  ];

  requiredTopLevel.forEach((key) => {
    if (dataset[key] === undefined || dataset[key] === null) {
      issues.push({ path: String(key), message: "Campo obligatorio ausente.", severity: "error" });
    }
  });

  if (dataset.jurisdiction !== "ES") {
    issues.push({ path: "jurisdiction", message: "El dataset debe ser de jurisdicción ES.", severity: "error" });
  }

  return issues;
}
