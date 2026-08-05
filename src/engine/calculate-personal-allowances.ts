import type { SalaryScenarioInput, TaxDataset } from "@/types/tax";
import { sum } from "./math";

export function calculatePersonalAllowances(input: SalaryScenarioInput, data: TaxDataset) {
  const allowances = data.personalAllowances;
  const childAmounts = Array.from({ length: input.personal.children }, (_, index) => {
    return allowances.children[Math.min(index, allowances.children.length - 1)] ?? 0;
  });

  return sum([
    input.tax.personalMinimumOverride ?? allowances.personal,
    input.personal.age >= 65 ? allowances.ageOver65 : 0,
    input.personal.age >= 75 ? allowances.ageOver75 : 0,
    sum(childAmounts),
    input.personal.childrenUnder3 * allowances.childUnder3,
    input.personal.ascendants * allowances.ascendantOver65,
    input.personal.dependants * allowances.ascendantOver65,
    allowances.disability[input.personal.disability],
    input.personal.mobilityGeographic ? allowances.mobilityGeographic : 0
  ]);
}
