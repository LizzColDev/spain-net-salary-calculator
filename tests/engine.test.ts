import { describe, expect, it } from "vitest";
import { calculateNetSalary } from "../src/engine";
import { getCurrentTaxDataset } from "../src/tax-engine/repository";
import { defaultScenario } from "../src/components/calculator/default-scenario";

describe("salary engine", () => {
  it("calculates a positive net salary and employer cost", () => {
    const result = calculateNetSalary(defaultScenario, getCurrentTaxDataset());

    expect(result.grossAnnual).toBeGreaterThan(40_000);
    expect(result.netAnnual).toBeGreaterThan(0);
    expect(result.employerCostAnnual).toBeGreaterThan(result.grossAnnual);
    expect(result.irpf).toBeGreaterThan(0);
  });

  it("manual IRPF overrides automatic rate", () => {
    const scenario = {
      ...defaultScenario,
      tax: { ...defaultScenario.tax, mode: "manual" as const, manualIrpfRate: 0.1 }
    };
    const result = calculateNetSalary(scenario, getCurrentTaxDataset());

    expect(Math.round(result.irpf)).toBe(Math.round(scenario.job.grossAnnual * 0.1));
  });

  it("comparison-sensitive inputs produce different outputs", () => {
    const base = calculateNetSalary(defaultScenario, getCurrentTaxDataset());
    const higher = calculateNetSalary({ ...defaultScenario, job: { ...defaultScenario.job, grossAnnual: 60_000 } }, getCurrentTaxDataset());

    expect(higher.netAnnual).toBeGreaterThan(base.netAnnual);
    expect(higher.irpf).toBeGreaterThan(base.irpf);
  });
});
