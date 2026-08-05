import type { RegionCode, TaxDataset } from "@/types/tax";
import type { ValidationIssue } from "../types";

export const requiredRegions: RegionCode[] = [
  "AN", "AR", "AS", "IB", "CN", "CB", "CM", "CL", "CT", "VC",
  "EX", "GA", "MD", "MC", "NC", "PV", "RI", "CE", "ML"
];

export function validateRegions(dataset: TaxDataset): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const codes = new Set(dataset.regions.map((region) => region.code));

  requiredRegions.forEach((code) => {
    if (!codes.has(code)) {
      issues.push({ path: `regions.${code}`, message: "Falta la comunidad autónoma en el dataset.", severity: "error" });
    }
  });

  dataset.regions.forEach((region) => {
    if (region.brackets.length === 0) {
      issues.push({ path: `regions.${region.code}.brackets`, message: "La comunidad no tiene tramos IRPF.", severity: "error" });
    }
  });

  return issues;
}
