import type { SalaryScenarioInput, TaxDataset } from "@/types/tax";
import { clamp, sum } from "./math";

function mergedRates(baseRates: Record<string, number>, overrides: Record<string, number | undefined>) {
  return Object.fromEntries(
    Object.entries(baseRates).map(([key, value]) => [key, overrides[key] ?? value])
  );
}

export function calculateSocialSecurity(input: SalaryScenarioInput, data: TaxDataset) {
  const monthlyBaseRaw = input.job.grossAnnual / 12;
  const monthlyMin = data.contributionBases.monthlyMinByGroup[input.job.contributionGroup] ?? 0;
  const monthlyBase = clamp(monthlyBaseRaw, monthlyMin * input.job.workingTimeRatio, data.contributionBases.monthlyMax);
  const annualBase = monthlyBase * 12;
  const unemployment = data.contributionRates.unemployment[input.job.contractType];
  const employeeRates = {
    ...mergedRates(data.contributionRates.employee, input.contributions.overrideEmployeeRates),
    unemployment: input.contributions.overrideEmployeeRates.unemployment ?? unemployment.employee
  };
  const employerRates = {
    ...mergedRates(data.contributionRates.employer, input.contributions.overrideEmployerRates),
    unemployment: input.contributions.overrideEmployerRates.unemployment ?? unemployment.employer,
    workplaceAccident: input.contributions.overrideEmployerRates.workplaceAccident ?? input.contributions.workplaceAccidentRate
  };
  const employee = annualBase * sum(Object.values(employeeRates));
  const employer = annualBase * sum(Object.values(employerRates));
  const employeeOvertime = input.contributions.overtimeAmount * data.contributionRates.overtime.structuralEmployee;
  const employerOvertime = input.contributions.overtimeAmount * data.contributionRates.overtime.structuralEmployer;

  return {
    annualBase,
    monthlyBase,
    employee: employee + employeeOvertime,
    employer: employer + employerOvertime,
    employeeRates,
    employerRates
  };
}
