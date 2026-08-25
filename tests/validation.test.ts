import { describe, expect, it } from "vitest";
import { validateScenario } from "../src/components/calculator/validation";
import { defaultScenario } from "../src/components/calculator/default-scenario";

describe("validateScenario", () => {
  it("returns no errors for a valid scenario", () => {
    expect(validateScenario(defaultScenario)).toEqual({});
  });

  it("returns an error for an invalid age", () => {
    const scenario = {
      ...defaultScenario,
      personal: {
        ...defaultScenario.personal,
        age: 15
      }
    };

    const errors = validateScenario(scenario);

    expect(errors["personal.age"]).toBeDefined();
  });

  it("returns an error for invalid weekly hours", () => {
    const scenario = {
      ...defaultScenario,
      job: {
        ...defaultScenario.job,
        weeklyHours: 0
      }
    };

    const errors = validateScenario(scenario);

    expect(errors["job.weeklyHours"]).toBeDefined();
  });
  
  it("does not consider an invalid scenario valid", () => {
    const scenario = {
      ...defaultScenario,
      personal: {
        ...defaultScenario.personal,
        age: 15
      }
    };

    const errors = validateScenario(scenario);

    expect(Object.keys(errors)).toContain("personal.age");
    expect(Object.keys(errors)).not.toHaveLength(0);
  });

  it("returns an error for empty gross annual salary", () => {
    const scenario = {
      ...defaultScenario,
      job: {
        ...defaultScenario.job,
        grossAnnual: ""
      }
  };

    const errors = validateScenario(scenario);

    expect(errors["job.grossAnnual"]).toBe(
      "El salario bruto anual debe ser mayor que 0 €."
    );
});

it("returns an error for empty weekly hours", () => {
  const scenario = {
    ...defaultScenario,
    job: {
      ...defaultScenario.job,
      weeklyHours: ""
    }
  };

    const errors = validateScenario(scenario);

    expect(errors["job.weeklyHours"]).toBe(
      "Las horas semanales deben ser mayores que 0."
    );
});

it("returns an error for empty age", () => {
  const scenario = {
    ...defaultScenario,
    personal: {
      ...defaultScenario.personal,
      age: ""
    }
  };

    const errors = validateScenario(scenario);

    expect(errors["personal.age"]).toBe(
      "La edad debe ser de 16 años o más."
    );
  });
});
