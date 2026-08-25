import { describe, expect, it } from "vitest";
import { salaryScenarioSchema } from "../src/engine/schema";
import { defaultScenario } from "../src/components/calculator/default-scenario";
import { validateScenario } from "@/components/calculator/validation";

describe("salary scenario validation", () => {
  it("accepts the default scenario", () => {
    const result = salaryScenarioSchema.safeParse(defaultScenario);

    expect(result.success).toBe(true);
  });

  it("rejects an age below 16", () => {
    const result = salaryScenarioSchema.safeParse({
      ...defaultScenario,
      personal: {
        ...defaultScenario.personal,
        age: 15
      }
    });

    expect(result.success).toBe(false);
  });

  it("rejects zero weekly hours", () => {
    const result = salaryScenarioSchema.safeParse({
      ...defaultScenario,
      job: {
        ...defaultScenario.job,
        weeklyHours: 0
      }
    });

    expect(result.success).toBe(false);
  });

  it("rejects zero payments", () => {
    const result = salaryScenarioSchema.safeParse({
      ...defaultScenario,
      job: {
        ...defaultScenario.job,
        payments: 0
      }
    });

    expect(result.success).toBe(false);
  });

  it("rejects zero gross annual salary", () => {
  const result = salaryScenarioSchema.safeParse({
    ...defaultScenario,
    job: {
      ...defaultScenario.job,
      grossAnnual: 0
    }
    });

    expect(result.success).toBe(false);
  });
});