import type { SalaryScenarioInput } from "@/types/tax";

export const defaultScenario: SalaryScenarioInput = {
  personal: {
    age: 35,
    maritalStatus: "single",
    children: 0,
    childrenUnder3: 0,
    disabledChildren: 0,
    ascendants: 0,
    dependants: 0,
    disability: "none",
    mobilityGeographic: false,
    familyLarge: false,
    singleParent: false
  },
  job: {
    grossAnnual: 42000,
    grossMonthly: 3000,
    payments: 14,
    contractType: "indefinite",
    workingTimeRatio: 1,
    weeklyHours: 40,
    contributionGroup: "1",
    workerType: "general",
    multiEmployment: false,
    multiActivity: false,
    region: "MD"
  },
  tax: {
    mode: "automatic",
    manualIrpfRate: 0.16,
    reductions: 0,
    deductions: 0
  },
  contributions: {
    overrideEmployeeRates: {},
    overrideEmployerRates: {},
    overtimeAmount: 0,
    workplaceAccidentRate: 0.015
  },
  compensation: [
    { id: "restaurant", label: "Ticket restaurante", annualAmount: 0, taxable: false, socialSecurityIncluded: true },
    { id: "medicalInsurance", label: "Seguro médico", annualAmount: 0, taxable: false, socialSecurityIncluded: true },
    { id: "transport", label: "Transporte", annualAmount: 0, taxable: false, socialSecurityIncluded: true },
    { id: "pensionPlan", label: "Plan de pensiones", annualAmount: 0, taxable: false, socialSecurityIncluded: true }
  ],
  bonus: {
    annualBonus: 0,
    variable: 0,
    stockOptions: 0,
    rsu: 0,
    commissions: 0,
    overtime: 0,
    incentives: 0
  },
  manualDeductions: []
};
