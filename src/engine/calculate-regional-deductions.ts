import type { DeductionRule, RegionDefinition, SalaryScenarioInput } from "@/types/tax";

function matches(rule: DeductionRule, input: SalaryScenarioInput, taxBase: number) {
  const condition = rule.condition;
  if (condition.familyLarge !== undefined && condition.familyLarge !== input.personal.familyLarge) return false;
  if (condition.singleParent !== undefined && condition.singleParent !== input.personal.singleParent) return false;
  if (condition.disability !== undefined && condition.disability !== input.personal.disability) return false;
  if (condition.minChildren !== undefined && input.personal.children < condition.minChildren) return false;
  if (condition.maxTaxBase !== undefined && taxBase > condition.maxTaxBase) return false;
  return true;
}

export function calculateRegionalDeductions(input: SalaryScenarioInput, region: RegionDefinition, taxBase: number) {
  return region.deductionRules
    .filter((rule) => matches(rule, input, taxBase))
    .reduce((total, rule) => total + rule.amount, 0);
}
