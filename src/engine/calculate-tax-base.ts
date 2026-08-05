import type { SalaryScenarioInput, TaxDataset } from "@/types/tax";
import { sum } from "./math";

export function calculateTaxableCompensation(input: SalaryScenarioInput, data: TaxDataset) {
  return input.compensation.reduce((total, item) => {
    const exemption = data.flexibleCompensationExemptions[item.id] ?? data.flexibleCompensationExemptions.other;
    if (item.taxable || exemption.taxable) return total + item.annualAmount;
    const annualLimit = exemption.annualLimit ?? Number.POSITIVE_INFINITY;
    const monthlyLimit = exemption.monthlyLimit ? exemption.monthlyLimit * 12 : Number.POSITIVE_INFINITY;
    const exempt = Math.min(item.annualAmount, annualLimit, monthlyLimit);
    return total + Math.max(0, item.annualAmount - exempt);
  }, 0);
}

export function calculateTotalGross(input: SalaryScenarioInput, data: TaxDataset) {
  const bonus = sum(Object.values(input.bonus));
  return input.job.grossAnnual + bonus + calculateTaxableCompensation(input, data);
}

export function calculateTaxBase(input: SalaryScenarioInput, data: TaxDataset, employeeContributions: number, allowances: number) {
  return Math.max(
    0,
    calculateTotalGross(input, data) - employeeContributions - allowances - input.tax.reductions
  );
}
