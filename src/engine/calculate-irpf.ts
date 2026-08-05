import type { RegionDefinition, SalaryScenarioInput, TaxDataset } from "@/types/tax";
import { applyProgressiveBrackets } from "./math";

export function calculateIRPF(input: SalaryScenarioInput, data: TaxDataset, region: RegionDefinition, taxBase: number, regionalDeductions: number) {
  if (input.tax.mode === "manual") {
    return Math.max(0, input.job.grossAnnual * input.tax.manualIrpfRate - input.tax.deductions - regionalDeductions);
  }

  if (region.fiscalRegime === "foral") {
    return Math.max(0, applyProgressiveBrackets(taxBase, region.brackets).tax - input.tax.deductions - regionalDeductions);
  }

  const state = applyProgressiveBrackets(taxBase, data.stateBrackets).tax;
  const regional = applyProgressiveBrackets(taxBase, region.brackets).tax;
  const specialCityReduction = region.fiscalRegime === "special-city" ? 0.6 : 0;
  return Math.max(0, (state + regional) * (1 - specialCityReduction) - input.tax.deductions - regionalDeductions);
}
