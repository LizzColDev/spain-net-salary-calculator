export type RegionCode =
  | "AN" | "AR" | "AS" | "IB" | "CN" | "CB" | "CM" | "CL" | "CT" | "VC"
  | "EX" | "GA" | "MD" | "MC" | "NC" | "PV" | "RI" | "CE" | "ML";

export type ContractType = "indefinite" | "temporary" | "training" | "internship";
export type WorkerType = "general" | "artist" | "agricultural" | "domestic" | "autonomo";
export type MaritalStatus = "single" | "married" | "separated" | "widowed";
export type DisabilityLevel = "none" | "gte33" | "gte65";

export interface TaxBracket {
  from: number;
  to: number | null;
  rate: number;
}

export interface RegionDefinition {
  code: RegionCode;
  name: string;
  fiscalRegime: "common" | "foral" | "special-city";
  brackets: TaxBracket[];
  deductionRules: DeductionRule[];
}

export interface DeductionRule {
  id: string;
  label: string;
  amount: number;
  condition: {
    familyLarge?: boolean;
    singleParent?: boolean;
    disability?: DisabilityLevel;
    minChildren?: number;
    maxTaxBase?: number;
  };
}

export interface ContributionRates {
  employee: Record<string, number>;
  employer: Record<string, number>;
  overtime: {
    structuralEmployee: number;
    structuralEmployer: number;
    forceMajeureEmployee: number;
    forceMajeureEmployer: number;
  };
  unemployment: Record<ContractType, { employee: number; employer: number }>;
}

export interface ContributionBases {
  monthlyMax: number;
  monthlyMinByGroup: Record<string, number>;
}

export interface PersonalAllowances {
  personal: number;
  ageOver65: number;
  ageOver75: number;
  children: number[];
  childUnder3: number;
  ascendantOver65: number;
  ascendantOver75: number;
  disability: Record<DisabilityLevel, number>;
  mobilityGeographic: number;
}

export interface TaxDataset {
  version: string;
  jurisdiction: "ES";
  taxYear: number;
  effectiveFrom: string;
  publishedAt: string;
  checksum: string;
  sources: Array<{ id: string; name: string; url: string; type: "api" | "html" | "pdf" | "boe" }>;
  stateBrackets: TaxBracket[];
  regions: RegionDefinition[];
  personalAllowances: PersonalAllowances;
  contributionRates: ContributionRates;
  contributionBases: ContributionBases;
  smi: { annual: number; monthly14: number };
  flexibleCompensationExemptions: Record<string, { annualLimit: number | null; monthlyLimit?: number; taxable: boolean }>;
}

export interface CompensationItem {
  id: string;
  label: string;
  annualAmount: number;
  taxable: boolean;
  socialSecurityIncluded: boolean;
}

export interface SalaryScenarioInput {
  personal: {
    age: number;
    birthDate?: string;
    sex?: "female" | "male" | "other" | "prefer-not";
    maritalStatus: MaritalStatus;
    children: number;
    childrenUnder3: number;
    disabledChildren: number;
    ascendants: number;
    dependants: number;
    disability: DisabilityLevel;
    mobilityGeographic: boolean;
    familyLarge: boolean;
    singleParent: boolean;
  };
  job: {
    grossAnnual: number;
    grossMonthly?: number;
    payments: number;
    contractType: ContractType;
    workingTimeRatio: number;
    weeklyHours: number;
    startDate?: string;
    endDate?: string;
    agreement?: string;
    professionalCategory?: string;
    contributionGroup: string;
    workerType: WorkerType;
    multiEmployment: boolean;
    multiActivity: boolean;
    region: RegionCode;
  };
  tax: {
    mode: "automatic" | "manual";
    manualIrpfRate: number;
    personalMinimumOverride?: number;
    reductions: number;
    deductions: number;
  };
  contributions: {
    overrideEmployeeRates: Record<string, number | undefined>;
    overrideEmployerRates: Record<string, number | undefined>;
    overtimeAmount: number;
    workplaceAccidentRate: number;
  };
  compensation: CompensationItem[];
  bonus: {
    annualBonus: number;
    variable: number;
    stockOptions: number;
    rsu: number;
    commissions: number;
    overtime: number;
    incentives: number;
  };
  manualDeductions: CompensationItem[];
}

export interface CalculationLine {
  concept: string;
  amount: number;
  percentOfGross: number;
  kind: "gross" | "tax" | "contribution" | "net" | "employer" | "deduction" | "benefit";
}

export interface SalaryCalculationResult {
  grossAnnual: number;
  grossMonthly: number;
  taxableIncome: number;
  taxBase: number;
  irpf: number;
  irpfRate: number;
  employeeContributions: number;
  employerContributions: number;
  totalDeductions: number;
  netAnnual: number;
  netMonthly: number;
  employerCostAnnual: number;
  employerCostMonthly: number;
  regionalDeductions: number;
  personalAllowances: number;
  lines: CalculationLine[];
}
