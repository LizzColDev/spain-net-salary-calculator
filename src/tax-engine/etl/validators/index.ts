import type { TaxDataset } from "@/types/tax";
import type { ValidationIssue } from "../types";
import { validateRanges } from "./ranges";
import { validateRegions } from "./regions";
import { validateStructure } from "./schema";

export function validateDataset(dataset: TaxDataset): ValidationIssue[] {
  const issues: ValidationIssue[] = [
    ...validateStructure(dataset),
    ...validateRegions(dataset),
    ...validateRanges(dataset)
  ];

  return issues;
}

export function assertValidDataset(dataset: TaxDataset) {
  const issues = validateDataset(dataset);
  const errors = issues.filter((issue) => issue.severity === "error");
  if (errors.length > 0) {
    const detail = errors.map((issue) => `${issue.path}: ${issue.message}`).join("\n");
    throw new Error(`Dataset fiscal inválido:\n${detail}`);
  }
  return issues;
}
