import { z } from "zod";

const money = z.coerce.number().finite().min(0).max(10_000_000);
const ratio = z.coerce.number().finite().min(0).max(1);

export const compensationItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  annualAmount: money,
  taxable: z.boolean(),
  socialSecurityIncluded: z.boolean()
});

export const salaryScenarioSchema = z.object({
  personal: z.object({
    age: z.coerce.number().int().min(16).max(100),
    birthDate: z.string().optional(),
    sex: z.enum(["female", "male", "other", "prefer-not"]).optional(),
    maritalStatus: z.enum(["single", "married", "separated", "widowed"]),
    children: z.coerce.number().int().min(0).max(20),
    childrenUnder3: z.coerce.number().int().min(0).max(20),
    disabledChildren: z.coerce.number().int().min(0).max(20),
    ascendants: z.coerce.number().int().min(0).max(10),
    dependants: z.coerce.number().int().min(0).max(10),
    disability: z.enum(["none", "gte33", "gte65"]),
    mobilityGeographic: z.boolean(),
    familyLarge: z.boolean(),
    singleParent: z.boolean()
  }),
  job: z.object({
    grossAnnual: money,
    grossMonthly: money.optional(),
    payments: z.coerce.number().int().min(1).max(24),
    contractType: z.enum(["indefinite", "temporary", "training", "internship"]),
    workingTimeRatio: ratio,
    weeklyHours: z.coerce.number().finite().min(1).max(80),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    agreement: z.string().optional(),
    professionalCategory: z.string().optional(),
    contributionGroup: z.string().min(1),
    workerType: z.enum(["general", "artist", "agricultural", "domestic", "autonomo"]),
    multiEmployment: z.boolean(),
    multiActivity: z.boolean(),
    region: z.enum(["AN", "AR", "AS", "IB", "CN", "CB", "CM", "CL", "CT", "VC", "EX", "GA", "MD", "MC", "NC", "PV", "RI", "CE", "ML"])
  }),
  tax: z.object({
    mode: z.enum(["automatic", "manual"]),
    manualIrpfRate: z.coerce.number().finite().min(0).max(0.6),
    personalMinimumOverride: money.optional(),
    reductions: money,
    deductions: money
  }),
  contributions: z.object({
    overrideEmployeeRates: z.record(z.coerce.number().finite().min(0).max(1).optional()),
    overrideEmployerRates: z.record(z.coerce.number().finite().min(0).max(1).optional()),
    overtimeAmount: money,
    workplaceAccidentRate: z.coerce.number().finite().min(0).max(0.2)
  }),
  compensation: z.array(compensationItemSchema).max(50),
  bonus: z.object({
    annualBonus: money,
    variable: money,
    stockOptions: money,
    rsu: money,
    commissions: money,
    overtime: money,
    incentives: money
  }),
  manualDeductions: z.array(compensationItemSchema).max(50)
});

export const calculateRequestSchema = z.object({
  scenarioA: salaryScenarioSchema,
  scenarioB: salaryScenarioSchema.optional()
});

export type SalaryScenarioForm = z.infer<typeof salaryScenarioSchema>;
