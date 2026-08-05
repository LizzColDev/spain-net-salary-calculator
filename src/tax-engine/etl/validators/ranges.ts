import type { TaxBracket, TaxDataset } from "@/types/tax";
import type { ValidationIssue } from "../types";

function validateRate(path: string, rate: number, issues: ValidationIssue[]) {
  if (!Number.isFinite(rate) || rate < 0 || rate > 0.6) {
    issues.push({ path, message: "Porcentaje fuera del rango esperado 0%-60%.", severity: "error" });
  }
}

function validateBrackets(path: string, brackets: TaxBracket[], issues: ValidationIssue[]) {
  let previousTo = 0;
  brackets.forEach((bracket, index) => {
    if (bracket.from < previousTo) {
      issues.push({ path: `${path}[${index}].from`, message: "Los tramos no están ordenados.", severity: "error" });
    }
    if (bracket.to !== null && bracket.to <= bracket.from) {
      issues.push({ path: `${path}[${index}].to`, message: "El límite superior debe ser mayor que el inferior.", severity: "error" });
    }
    validateRate(`${path}[${index}].rate`, bracket.rate, issues);
    previousTo = bracket.to ?? previousTo;
  });
}

export function validateRanges(dataset: TaxDataset): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  validateBrackets("stateBrackets", dataset.stateBrackets, issues);
  dataset.regions.forEach((region) => validateBrackets(`regions.${region.code}.brackets`, region.brackets, issues));

  Object.entries(dataset.contributionRates.employee).forEach(([key, value]) => validateRate(`contributionRates.employee.${key}`, value, issues));
  Object.entries(dataset.contributionRates.employer).forEach(([key, value]) => validateRate(`contributionRates.employer.${key}`, value, issues));
  Object.entries(dataset.contributionRates.unemployment).forEach(([contract, rates]) => {
    validateRate(`contributionRates.unemployment.${contract}.employee`, rates.employee, issues);
    validateRate(`contributionRates.unemployment.${contract}.employer`, rates.employer, issues);
  });

  if (dataset.contributionBases.monthlyMax < 1000 || dataset.contributionBases.monthlyMax > 15000) {
    issues.push({ path: "contributionBases.monthlyMax", message: "Base máxima mensual fuera del rango esperado.", severity: "error" });
  }
  Object.entries(dataset.contributionBases.monthlyMinByGroup).forEach(([group, value]) => {
    if (!Number.isFinite(value) || value <= 0) {
      issues.push({ path: `contributionBases.monthlyMinByGroup.${group}`, message: "Base mínima inválida.", severity: "error" });
    }
  });
  if (dataset.smi.annual < 10000 || dataset.smi.annual > 40000) {
    issues.push({ path: "smi.annual", message: "SMI anual fuera del rango esperado.", severity: "error" });
  }

  return issues;
}
