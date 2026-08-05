import type { CalculationLine, SalaryCalculationResult, SalaryScenarioInput, TaxDataset } from "@/types/tax";
import { getRegionOrThrow } from "@/tax-engine/repository";
import { percentOf, sum } from "./math";
import { calculateIRPF } from "./calculate-irpf";
import { calculatePersonalAllowances } from "./calculate-personal-allowances";
import { calculateRegionalDeductions } from "./calculate-regional-deductions";
import { calculateSocialSecurity } from "./calculate-social-security";
import { calculateTaxBase, calculateTotalGross } from "./calculate-tax-base";

export function calculateEmployerCost(grossAnnual: number, employerContributions: number) {
  return grossAnnual + employerContributions;
}

export function calculateAnnualNet(grossAnnual: number, irpf: number, employeeContributions: number, manualDeductions: number) {
  return Math.max(0, grossAnnual - irpf - employeeContributions - manualDeductions);
}

export function calculateMonthlyNet(annualNet: number, payments: number) {
  return annualNet / Math.max(1, payments);
}

export function calculateNetSalary(input: SalaryScenarioInput, data: TaxDataset): SalaryCalculationResult {
  const region = getRegionOrThrow(input.job.region, data);
  const grossAnnual = calculateTotalGross(input, data);
  const socialSecurity = calculateSocialSecurity(input, data);
  const personalAllowances = calculatePersonalAllowances(input, data);
  const taxBase = calculateTaxBase(input, data, socialSecurity.employee, personalAllowances);
  const regionalDeductions = calculateRegionalDeductions(input, region, taxBase);
  const irpf = calculateIRPF(input, data, region, taxBase, regionalDeductions);
  const manualDeductions = sum(input.manualDeductions.map((item) => item.annualAmount));
  const totalDeductions = irpf + socialSecurity.employee + manualDeductions;
  const netAnnual = calculateAnnualNet(grossAnnual, irpf, socialSecurity.employee, manualDeductions);
  const employerCostAnnual = calculateEmployerCost(grossAnnual, socialSecurity.employer);
  const line = (concept: string, amount: number, kind: CalculationLine["kind"]): CalculationLine => ({
    concept,
    amount,
    percentOfGross: percentOf(amount, grossAnnual),
    kind
  });

  return {
    grossAnnual,
    grossMonthly: grossAnnual / input.job.payments,
    taxableIncome: grossAnnual,
    taxBase,
    irpf,
    irpfRate: percentOf(irpf, grossAnnual),
    employeeContributions: socialSecurity.employee,
    employerContributions: socialSecurity.employer,
    totalDeductions,
    netAnnual,
    netMonthly: calculateMonthlyNet(netAnnual, input.job.payments),
    employerCostAnnual,
    employerCostMonthly: employerCostAnnual / 12,
    regionalDeductions,
    personalAllowances,
    lines: [
      line("Salario bruto anual", grossAnnual, "gross"),
      line("Base liquidable estimada", taxBase, "gross"),
      line("Mínimos personales y familiares", personalAllowances, "deduction"),
      line("Deducciones autonómicas", regionalDeductions, "deduction"),
      line("IRPF", -irpf, "tax"),
      line("Cotización trabajador", -socialSecurity.employee, "contribution"),
      line("Deducciones manuales", -manualDeductions, "deduction"),
      line("Salario neto anual", netAnnual, "net"),
      line("Cotización empresa", socialSecurity.employer, "employer"),
      line("Coste empresa anual", employerCostAnnual, "employer")
    ]
  };
}
